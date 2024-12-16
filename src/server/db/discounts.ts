import { pgEnum } from "drizzle-orm/pg-core";

export const discountType = ["percentage", "amount"] as const;
export const pgDiscountType = pgEnum("discount_type", discountType)
