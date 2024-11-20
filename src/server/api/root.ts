
import { categoriesRouter } from "@/server/api/routers/categories";
import { checkoutRouter } from "@/server/api/routers/checkout";
import { productRouter } from "@/server/api/routers/products";
import { serversRouter } from "@/server/api/routers/servers";
import { settingsRouter } from "@/server/api/routers/settings";
import { utilsRouter } from "@/server/api/routers/utils";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  products: productRouter,
  categories: categoriesRouter,
  settings: settingsRouter,
  utils: utilsRouter,
  checkout: checkoutRouter,
  servers: serversRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
