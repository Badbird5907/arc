import { discountType } from "@/server/db/schema";

import { couponType } from "@/server/db/schema";

import { z } from "zod";

export const createCouponForm = z.object({
  code: z.string().min(1),
  type: z.enum(couponType),
  discountType: z.enum(discountType),
  discountValue: z.coerce.number(),
  minOrderAmount: z.coerce.number().optional().default(0),
  maxDiscountAmount: z.coerce.number().optional().default(-1),
  maxUses: z.coerce.number().optional().default(-1),
  maxGlobalTotalDiscount: z.coerce.number().optional().default(-1),
  availableGlobalTotalDiscount: z.coerce.number().optional().default(-1),
  notes: z.string().optional().default(""),
  startsAt: z.coerce.date().optional().default(new Date()),
  expiresAt: z.coerce.date().optional().nullable(),
  enabled: z.boolean().optional().default(true),
});

export const modifyCouponForm = z.object({
  code: z.string().optional(),
  type: z.enum(couponType).optional(),
  discountType: z.enum(discountType).optional(),
  discountValue: z.coerce.number().optional(),
  minOrderAmount: z.coerce.number().optional(),
  maxDiscountAmount: z.coerce.number().optional(),
  maxUses: z.coerce.number().optional(),
  maxGlobalTotalDiscount: z.coerce.number().optional(),
  availableGlobalTotalDiscount: z.coerce.number().optional(),
  notes: z.string().optional(),
  startsAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional().nullable(),
  enabled: z.boolean().optional(),
});
