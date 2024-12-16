import { pgDiscountType } from "@/server/db/discounts";
import { categories, orders, products } from "@/server/db/schema";
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from "uuid";

export const couponType = ["coupon", "giftcard"] as const;
export const pgCouponType = pgEnum("coupon_type", couponType)

export const coupons = pgTable(
  "coupons",
  {
    id: uuid("id")
      .primaryKey()
      .notNull()
      .$defaultFn(() => uuidv4()),
    type: pgCouponType("type").notNull().default("coupon"),
    code: text("code").notNull().unique(),
    discountType: pgDiscountType("discount_type").notNull().default("amount"),
    discountValue: doublePrecision("discount_value").notNull(),
    minOrderAmount: doublePrecision("min_order_amount").notNull().default(0),
    maxDiscountAmount: doublePrecision("max_discount_amount").notNull().default(-1),
    notes: text("notes").notNull().default(""),

    maxUses: integer("max_uses").notNull().default(1),
    uses: integer("uses").notNull().default(0),

    // mainly used for "gift cards"
    maxGlobalTotalDiscount: doublePrecision("max_global_total_discount").notNull().default(0),
    availableGlobalTotalDiscount: doublePrecision("available_global_total_discount").notNull().default(0),

    enabled: boolean("enabled").notNull().default(true),
    expiresAt: timestamp("expires_at", { precision: 3, mode: "date" }),
    startsAt: timestamp("starts_at", { precision: 3, mode: "date" }).defaultNow(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (t) => ([
    {
      codeIdx: index("code_idx").on(t.code),
      searchIndex: index("search_idx").using(
        "gin",
        sql`(
          setweight(to_tsvector('english', ${t.code}), 'A') ||
          setweight(to_tsvector('english', ${t.notes}), 'B')
        )`
      )
    }
  ])
)

export const couponToProduct = pgTable(
  "coupon_to_product",
  {
    couponId: uuid("coupon_id")
      .notNull()
      .references(() => coupons.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
  },
  (t) => (
    [{
      pk: primaryKey({ columns: [t.couponId, t.productId] }),
    }]
  )
)

export const couponToCategory = pgTable(
  "coupon_to_category",
  {
    couponId: uuid("coupon_id")
      .notNull()
      .references(() => coupons.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (t) => ([{
    pk: primaryKey({ columns: [t.couponId, t.categoryId] }),
  }])
)

export const orderToCoupon = pgTable(
  "order_to_coupon",
  {
    id: uuid("id")
      .primaryKey()
      .notNull()
      .$defaultFn(() => uuidv4()),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id),
    couponId: uuid("coupon_id")
      .notNull()
      .references(() => coupons.id),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
  }
)

export const couponRelations = relations(coupons, ({ many }) => ({
  orderToCoupon: many(orderToCoupon),
  couponToProduct: many(couponToProduct),
  couponToCategory: many(couponToCategory),
}))

export const couponToProductRelations = relations(couponToProduct, ({ one }) => ({
  coupon: one(coupons, {
    fields: [couponToProduct.couponId],
    references: [coupons.id],
  }),
  product: one(products, {
    fields: [couponToProduct.productId],
    references: [products.id],
  }),
}))

export const couponToCategoryRelations = relations(couponToCategory, ({ one }) => ({
  coupon: one(coupons, {
    fields: [couponToCategory.couponId],
    references: [coupons.id],
  }),
  category: one(categories, {
    fields: [couponToCategory.categoryId],
    references: [categories.id],
  }),
}))
