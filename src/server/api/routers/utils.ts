import { fixUUID } from "@/lib/utils";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { waitUntil } from "@vercel/functions";
import { get, set } from "@/server/redis";
import { type PlayerInfo } from "@/components/cart";

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
    const cached = await get<PlayerInfo | { notFound: true }>(`player:${username}`);
    console.log("cached", cached, typeof cached);
    if (cached) {
      return { notFound: false, cache: true, ...cached };
    }
    const response = await fetch(`https://api.geysermc.org/v2/utils/uuid/bedrock_or_java/${username}?prefix=.`, {
      headers: { Accept: 'application/json' }
    });
    if (response.status === 404 || response.status === 503) { // they return 503 if the account is not found in cache
      waitUntil(set(`player:${username}`, { notFound: true }));
      return { notFound: true };
    }
    if (!response.ok) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Error: ${response.status}`
      })
    }
    const result = await response.json() as {
      id: string;
      name: string;
    };
    const data = {
      uuid: fixUUID(result.id),
      name: result.name,
      bedrock
    };
    waitUntil(set(`player:${username}`, data));
    return { notFound: false, ...data };
  })
})