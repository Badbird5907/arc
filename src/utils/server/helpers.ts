import "server-only";

import { db } from "@/server/db";
import { get, set } from "@/server/redis";
import { type PlayerInfo } from "@/components/cart";
import { waitUntil } from "@vercel/functions";
import { fixUUID } from "@/lib/utils";
import { TRPCError } from "@trpc/server";
import { env } from "@/env";
import { headers } from "next/headers";
import { getSetting } from "@/server/settings";

export const getUser = async (id: string) => {
  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.id, id),
  })
  return user
}

export const getIpAddress = async () => {
  const header = env.IP_ADDRESS_RESOLVE_HEADER;
  if (!header || header === "none") return "0.0.0.0";
  const headersList = await headers();
  return headersList.get(header) ?? "0.0.0.0";
}

export const getPlayer = async (username: string): Promise<{data: PlayerInfo} | { notFound: true }> => {
  const bedrock = username.startsWith(".");
  const enableBedrock = await getSetting("enableBedrock");
  if (!enableBedrock && bedrock) return { notFound: true };
  const cached = await get<PlayerInfo | { notFound: true }>(`player:${username}`);
  console.log("cached", cached, typeof cached);
  if (cached) {
    if ("notFound" in cached && cached.notFound) return { notFound: true };
    return { data: cached as PlayerInfo };
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
  return { data };
}