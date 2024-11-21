import { db } from "@/server/db";

export const getServer = async (req: Request) => {
  const header = req.headers.get("x-cobalt-secret");
  if (!header) {
    return false;
  }
  const server = await db.query.servers.findFirst({
    where: (s, { eq }) => eq(s.secretKey, header)
  });
  return server ?? false;
}