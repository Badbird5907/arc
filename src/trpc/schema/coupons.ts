import { discountType } from "@/server/db/schema";

import { couponType } from "@/server/db/schema";

import { z } from "zod";

export const modifyCouponForm = z.object({
  code: z.string().min(1),
  type: z.enum(couponType),
  discountType: z.enum(discountType),
  discountValue: z.coerce.number(),
  minOrderAmount: z.coerce.number().optional().default(0),
  maxDiscountAmount: z.coerce.number().optional().default(-1),
  maxUses: z.coerce.number().optional().default(-1),
  notes: z.string().optional().default(""),
  startsAt: z.coerce.date().optional().default(new Date()),
  expiresAt: z.coerce.date().optional(),
});

