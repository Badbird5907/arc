import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { getPlayer } from "@/utils/server/helpers";

export const utilsRouter = createTRPCRouter({
  fetchPlayer: publicProcedure.input(z.object({
    name: z.string().trim().toLowerCase(),
    bedrock: z.boolean()
  })).query(async ({ input }) => {
    const { name, bedrock } = input;
    if (!name) {
      return { notFound: true };
    }
    const username = bedrock ? "." + name : name;
    return getPlayer(username);
  })
})