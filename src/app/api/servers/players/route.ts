import { db } from "@/server/db";
import { getServer } from "@/app/api/servers";
import { queuedCommands } from "@/server/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  const server = await getServer(req);
  if (!server) {
    return new Response("Unauthorized", { status: 401 });
  }
  const players = await db
    .selectDistinct({
      uuid: queuedCommands.minecraftUuid,
    })
    .from(queuedCommands)
    .where(
      and(
        eq(queuedCommands.server, server.id),
        eq(queuedCommands.executed, false)
      )
    )
  return NextResponse.json(players);
}