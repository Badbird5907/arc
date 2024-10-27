import "server-only";

import { db } from "@/server/db";

export const getProductById = async (id: string) => {
  return db.query.products.findFirst({
    where: (product, { eq }) => eq(product.id, id)
  })
}