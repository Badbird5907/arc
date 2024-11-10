import { z } from "zod";

export const createProductInput = z.object({
  name: z.string(),
  price: z.number().min(0, { message: "Price must be positive" }),
  description: z.string().optional(),
  hidden: z.boolean().default(false),
  categoryId: z.string().optional().nullable(),
});

export const getProductsInput = z.object(
  {
    search: z.string().optional(),
    categoryId: z.string().optional().nullable(),
    order: z.enum(["asc", "desc"]).default("asc").optional(),
    sort: z.enum(["name", "price", "created", "modified", "hidden"]).default("name").optional(),
  }
);

export const basicProductDataForm = z.object({ // only the values that are controlled by `edit-basic.tsx`
  name: z.string().optional(),
  price: z.coerce.number().min(0, { message: "Price must be positive" }).optional(),
  description: z.string().optional().nullable(),
  minQuantity: z.coerce.number().min(1).optional(),
  maxQuantity: z.coerce.number().min(0).optional(),
  type: z.enum(["single", "subscription"]).optional(),
  subAllowSinglePurchase: z.boolean().optional(),
  expiryPeriod: z.enum(["day", "month", "year"]).optional(),
  expiryLength: z.coerce.number().min(1).optional(),
  sortPriority: z.coerce.number().optional(),
})

export const optionalProductData = basicProductDataForm.merge(z.object({
  hidden: z.boolean().optional(),
  images: z.array(z.string()).optional(),
  categoryId: z.string().optional().nullable(),
}));
export const modifyProductInput = z.object({
  id: z.string(),
  data: optionalProductData
});

export const categoryData = z.object({
  name: z.string().trim(),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase, alphanumeric and hyphenated")
          .trim().toLowerCase(),
  description: z.string().optional().nullable(),
  parentCategoryId: z.string().trim().optional().nullable(),
  hidden: z.boolean().default(false),
  featured: z.boolean().default(false),
  sortPriority: z.coerce.number().default(0),
  bannerImage: z.string().optional().nullable(),
  cardImage: z.string().optional().nullable(),
  showCategoryCards: z.boolean().default(true).optional(),
})

export const optionalCategoryData = categoryData.merge(z.object({
  name: z.string().trim().optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase, alphanumeric and hyphenated")
  .trim().toLowerCase().optional(),
  hidden: z.boolean().optional(),
  featured: z.boolean().optional(),
  sortPriority: z.coerce.number().optional(),
}));


export const categoryImageFields = {
  bannerImage: "Banner",
  cardImage: "Card",
} as const