import { createTRPCRouter, procedure, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { getPlayer, getPlayerFromUuid } from "@/utils/server/helpers";
import { db } from "@/server/db";
import { players } from "@/server/db/schema";
import { desc, eq, isNotNull, sql } from "drizzle-orm";
import { type PlayerInfo } from "@badbird5907/mc-utils";
import { type Player } from "@/types";

export const playersRouter = createTRPCRouter({
  fetchPlayer: publicProcedure.input(z.object({
    name: z.string().trim().toLowerCase(),
    bedrock: z.boolean(),
    checkBanned: z.boolean().optional().default(false),
  }))
  .output(z.object({
    notFound: z.boolean(),
    data: z.object({
      uuid: z.string(),
      name: z.string(),
      bedrock: z.boolean(),
    }).nullable(),
    banned: z.boolean().optional(),
  }))
  .query(async ({ input }) => {
    const { name, bedrock } = input;
    if (!name) {
      return { notFound: true, data: null };
    }
    const username = bedrock ? "." + name : name;
    const player = await getPlayer(username);
    if (player?.data?.uuid) {
      const existing = await db.select().from(players).where(eq(players.uuid, player.data.uuid));
      if (existing.length > 0 && !!existing[0]) {
        return { ...player, banned: existing[0].banned ? true : false };
      }
      // doesn't exist, insert it
      await db.insert(players).values({
        uuid: player.data.uuid,
      }).onConflictDoNothing();
    }
    return { ...player, banned: false };
  }),
  fetchPlayerByUuid: publicProcedure.input(z.object({
    uuid: z.string().trim().toLowerCase(),
  })).query(async ({ input }) => {
    const { uuid } = input;
    const player = await getPlayerFromUuid(uuid);
    if (player?.data?.uuid) {
      // insert the player if it doesn't exist
      await db.insert(players).values({
        uuid: player.data.uuid,
      }).onConflictDoNothing();
    }
    return player;
  }),
  getPlayerDetails: procedure("players:read").input(z.object({
    uuid: z.string().trim().toLowerCase(),
  })).query(async ({ input }) => {
    const { uuid } = input;
    const player = await db.select().from(players).where(eq(players.uuid, uuid));
    // if it exists, return it
    if (player.length > 0) {
      return player[0];
    }
    const newPlayer = await db.insert(players).values({
      uuid,
      banned: null,
      notes: "",
    }).onConflictDoNothing().returning();
    return newPlayer[0];
  }),
  setPlayerDetails: procedure("players:write").input(z.object({
    uuid: z.string().trim().toLowerCase(),
    details: z.object({
      banned: z.boolean().optional(),
      notes: z.string().optional(),
    }),
  })).mutation(async ({ input }) => {
    const { uuid, details } = input;
    console.log(details);
    await db.insert(players).values({
      uuid,
      ...details,
      ...("banned" in details ? { banned: details.banned ? new Date() : null } : { banned: undefined}),
    }).onConflictDoUpdate({
      target: [players.uuid],
      set: {
        ...details,
        ...("banned" in details ? { banned: details.banned ? new Date() : null } : { banned: undefined }),
      }
    });
  }),
  getBannedPlayers: procedure("players:read")
  .input(z.object({
    page: z.number().optional().default(0),
    pageSize: z.number().optional().default(10),
    withPlayer: z.boolean().optional().default(false),
  }))
  .query(async ({ input }) => {
    const { page, pageSize, withPlayer } = input;
    const [count, bannedPlayers] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(players).where(isNotNull(players.banned)),
      db.select().from(players).where(isNotNull(players.banned)).orderBy(desc(players.createdAt)).offset(page * pageSize).limit(pageSize)
    ]);
    if (withPlayer) {
      const uuidSet = new Set(bannedPlayers.map(player => player.uuid));
      const uuidArray = Array.from(uuidSet);
      const players = await Promise.all(
        uuidArray.map((uuid) => getPlayerFromUuid(uuid))
      ).then((arr) => arr.filter((player) => !player.notFound && player.data));
      const playerMap = new Map(players.map(player => [player.data?.uuid, player.data]));
      return {
        count: count[0]?.count ?? 0,
        players: bannedPlayers.map(player => ({
          ...player,
          player: playerMap.get(player.uuid)
        } as Player & { player: PlayerInfo | null | undefined })),
        playerMap,
      } as {
        count: number;
        players: (Player & { player: PlayerInfo | null | undefined })[];
        playerMap: Map<string, PlayerInfo | null | undefined>;
      };
    }
    return {
      count: count[0]?.count ?? 0,
      players: bannedPlayers,
    };
  }),
})