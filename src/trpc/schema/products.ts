import { z } from "zod";

export const createProductInput = z.object({
  name: z.string(),
  price: z.number().min(0, { message: "Price must be positive" }),
  description: z.string().optional(),
  hidden: z.boolean().default(false)
});

export const getProductsInput = z.object(
  {
    search: z.string().optional(),
    order: z.enum(["asc", "desc"]).default("asc").optional(),
    sort: z.enum(["name", "price", "created", "modified", "hidden"]).default("name").optional(),
  }
);