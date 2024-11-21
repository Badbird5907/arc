import { NextResponse } from "next/server";
import { getServer } from "@/app/api/servers";
import { db } from "@/server/db";

export const GET = async (req: Request) => {
  const server = await getServer(req);
  if (!server) {
    return new Response("Unauthorized", { status: 401 });
  }
  const commands = await db.query.queuedCommands.findMany({
    where: (q, { eq, and }) => and(eq(q.server, server.id), eq(q.requireOnline, false), eq(q.executed, false))
  });
  return NextResponse.json(commands);
}
