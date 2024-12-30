import { getServer } from "@/app/api/servers";
import { db } from "@/server/db";
import { queuedCommands } from "@/server/db/schema";
import { inArray } from "drizzle-orm";
import { NextResponse } from "next/server";


type Body = {
  commandIds: string[];
}
export const DELETE = async (req: Request) => {
  const server = await getServer(req);
  if (!server) {
    return new Response("Unauthorized", { status: 401 });
  }
  const body = await req.json() as Body;
  const { commandIds } = body;
  await db.update(queuedCommands).set({ executed: true }).where(inArray(queuedCommands.id, commandIds));
  return NextResponse.json({ success: true });
}