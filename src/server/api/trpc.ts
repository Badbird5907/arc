/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "@/server/db";
import { getSession } from "@/server/actions/auth";
import { getUser } from "@/utils/server/helpers";
import { RBAC } from "@/lib/permissions";
import { checkRateLimitAndThrowError } from "@/server/redis/rate-limit";

interface Meta {
  permissions?: string[] | string;
  validateSome?: boolean;
  rateLimit?: string;
}

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers; sourceIp?: string }) => {
  const session = await getSession();

  return {
    db,
    session,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().meta<Meta>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = performance.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = performance.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

const rateLimitMiddleware = t.middleware(async ({ next, meta, ctx }) => {
  const { sourceIp } = ctx;
  if (meta?.rateLimit) {
    await checkRateLimitAndThrowError({
      identifier: `${meta.rateLimit}:${sourceIp}`
    })
  }
  return next();
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware).use(rateLimitMiddleware);

/** Reusable middleware that enforces users are logged in before running the procedure. */
const enforceUserIsAuthed = t.middleware(async ({ ctx, next, meta }) => {
  if (!ctx.session?.data?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (!meta?.permissions) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Permissions not defined on procedure",
    });
  }
  const user = await getUser(ctx.session.data.user.id);
  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const { permissions } = meta;
  const perms = Array.isArray(permissions) ? permissions : [permissions];
  const results = await Promise.all(
    perms.map((permission) => RBAC.can(user.role, permission))
  );
  let passed = false;
  if (meta.validateSome) {
    passed = results.some((result) => result);
  } else {
    passed = results.every((result) => result);
  }
  if (!passed) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have permission to access this resource"
     });
  }
  
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session }, // TODO: fetch user here maybe?
      user,
    },
  });
});

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed).use(rateLimitMiddleware);

export const procedure = (permissions: string | string[]) => {
  return protectedProcedure.meta({ permissions });
}