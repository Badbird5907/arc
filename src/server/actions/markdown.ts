"use server";

import { db } from "@/server/db";
import { get, set } from "@/server/redis";
import { compile } from "@mdx-js/mdx";

export const renderMarkdown = async (productId: string) => {
  const cached = await get(`product:${productId}:mdx`);
  if (cached) {
    return cached;
  }
  const product = await db.query.products.findFirst({
    where: (p, { eq }) => eq(p.id, productId),
  }); // maybe we should also check if the product is hidden?? whatever...
  if (!product) {
    return "";
  }
  const code = String(
    await compile(
      product.description ?? "",
      {
        outputFormat: "function-body"
      }
    )
  )
  await set(`product:${productId}:mdx`, code);
  return code;
}