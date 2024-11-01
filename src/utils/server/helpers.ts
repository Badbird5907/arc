import "server-only";

import { db } from "@/server/db";

export const getUser = async (id: string) => {
  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.id, id),
  })
  return user
}
