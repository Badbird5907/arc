import "server-only";

import { db } from "@/server/db";
import { sql } from "drizzle-orm";
import { categories, products } from "@/server/db/schema";

export const getUser = async (id: string) => {
  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.id, id),
  })
  return user
}

