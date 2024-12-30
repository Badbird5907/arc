import "server-only";

import { db } from "@/server/db";
import { get, set } from "@/server/redis";
import { waitUntil } from "@vercel/functions";
import { env } from "@/env";
import { headers } from "next/headers";
import { getSetting } from "@/server/settings";
import { fetchPlayerByUsername, fetchPlayerByUUID, PlayerInfo, type PlayerResponse } from "@badbird5907/mc-utils";

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

export const getPlayer = async (username: string): Promise<PlayerResponse> => {
  const bedrock = username.startsWith(".");
  const enableBedrock = await getSetting("enableBedrock");
  
  if (!enableBedrock && bedrock) {
    return { notFound: true, data: null };
  }

  const cached = await get<PlayerInfo | { notFound: true }>(`player:${username}`);
  if (cached) {
    if ("notFound" in cached && cached.notFound) {
      return { notFound: true, data: null };
    }
    return { data: cached as PlayerInfo, notFound: false };
  }

  const result = await fetchPlayerByUsername(username);
  
  if (result.data) {
    waitUntil(set(`player:${username}`, result.data));
  } else {
    waitUntil(set(`player:${username}`, { notFound: true }));
  }

  return result;
}

export const getPlayerFromUuid = async (uuid: string): Promise<PlayerResponse> => {
  const cached = await get<PlayerInfo | { notFound: true }>(`player:${uuid}`);
  if (cached) {
    if ("notFound" in cached && cached.notFound) {
      return { notFound: true, data: null };
    }
    return { data: cached as PlayerInfo, notFound: false };
  }

  const result = await fetchPlayerByUUID(uuid);
  
  if (result.data) {
    waitUntil(set(`player:${uuid}`, result.data));
  } else {
    waitUntil(set(`player:${uuid}`, { notFound: true }));
  }

  return result;
}

