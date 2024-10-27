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

export const optionalProductData = z.object({
  name: z.string().optional(),
  price: z.coerce.number().min(0, { message: "Price must be positive" }).optional(),
  description: z.string().optional().nullable(),
  minQuantity: z.number().min(1).optional(),
  hidden: z.boolean().optional(),
  images: z.array(z.string()).optional(),
  type: z.enum(["single", "subscription"]).optional(),
  expiryPeriod: z.enum(["day", "month", "year"]).optional(),
  expiryLength: z.number().min(1).optional()
});
export const modifyProductInput = z.object({
  id: z.string(),
  data: optionalProductData
});