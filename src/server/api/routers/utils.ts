import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { getPlayer, getPlayerFromUuid } from "@/utils/server/helpers";

export const utilsRouter = createTRPCRouter({
  fetchPlayer: publicProcedure.input(z.object({
    name: z.string().trim().toLowerCase(),
    bedrock: z.boolean()
  }))
  .output(z.object({
    notFound: z.boolean(),
    data: z.object({
      uuid: z.string(),
      name: z.string(),
      bedrock: z.boolean()
    }).nullable()
  }))
  .query(async ({ input }) => {
    const { name, bedrock } = input;
    if (!name) {
      return { notFound: true, data: null };
    }
    const username = bedrock ? "." + name : name;
    return getPlayer(username);
  }),
  fetchPlayerByUuid: publicProcedure.input(z.object({
    uuid: z.string().trim().toLowerCase(),
  })).query(async ({ input }) => {
    const { uuid } = input;
    return getPlayerFromUuid(uuid);
  }),
})