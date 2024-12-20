import { createTRPCRouter, procedure } from "@/server/api/trpc";
import { servers } from "@/server/db/schema";
import { z } from "zod";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

const nanoid32 = () => nanoid(32);
export const serversRouter = createTRPCRouter({
  getServers: procedure("servers:read")
  .query(async ({ ctx }) => {
      return (await ctx.db.query.servers.findMany()).map((server) => {
        return {
          ...server,
          secretKey: undefined,
        }
      });
    }),
  createServer: procedure("servers:create")
    .input(z.object({
      name: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const key = nanoid32();
      await ctx.db.insert(servers).values({
        name: input.name,
        notes: input.notes,
        secretKey: key,
      });
      return { 
        name: input.name,
        secretKey: key,
      }
    }),
  resetKey: procedure("servers:resetKey")
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const newKey = nanoid32();
      await ctx.db.update(servers).set({ secretKey: newKey }).where(eq(servers.id, input.id));
      return {
        secretKey: newKey,
      }
    }),
  modifyServer: procedure("servers:write")
    .input(z.object({
      id: z.string(),
      name: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(servers).set({ 
        name: input.name,
        notes: input.notes,
      }).where(eq(servers.id, input.id));
      return {
        id: input.id,
        name: input.name,
        notes: input.notes,
      }
    }),
  deleteServer: procedure("servers:delete")
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(servers).where(eq(servers.id, input.id));
      return {
        success: true,
      }
    }),
  })
