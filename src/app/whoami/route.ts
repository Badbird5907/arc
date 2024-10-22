import { getSession } from "@/server/actions/auth"
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  const session = await getSession();
  return NextResponse.json({ session })
}