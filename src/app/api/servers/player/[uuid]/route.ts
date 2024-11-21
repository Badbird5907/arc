import { getServer } from "@/app/api/servers";
import { isValidUuid } from "@/lib/utils";
import { db } from "@/server/db";
import { NextResponse } from "next/server";

export const GET = async (req: Request, { params }: { params: { uuid: string } }) => {
  const server = await getServer(req);
  if (!server) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { uuid } = params;
  if (!isValidUuid(uuid)) {
    return new Response("Invalid UUID", { status: 400 });
  }
  const command = await db.query.queuedCommands.findFirst({
    where: (q, { eq, and }) => and(eq(q.server, server.id), eq(q.minecraftUuid, uuid), eq(q.executed, false))
  });
  return NextResponse.json(command);
}