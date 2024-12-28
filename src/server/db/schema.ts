import { v4 as uuidv4 } from "uuid";

import {
  type AnyPgColumn,
  boolean,
  decimal,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { rolesArr } from "@/lib/permissions";
import { relations, sql } from "drizzle-orm";
import { Delivery, deliveryWhen } from "@/types";
import { orderToCoupon } from "@/server/db/coupons";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */

export const rolesPgEnum = pgEnum("roles", rolesArr);

// When modifying this table, make sure to modify the database function in db_functions/signup.sql
export const users = pgTable(
  "users",
  {
    id: uuid("id")
      .primaryKey()
      .notNull()
      .defaultRandom(),
    username: text("username").notNull(),
    displayName: text("display_name").notNull(),
    email: text("email").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    role: rolesPgEnum("role").notNull().default("user"),
  }
)

export const productType = pgEnum("product_type", ["single", "subscription"]);
export const expiryPeriod = pgEnum("expiry_period", ["day", "month", "year"]);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id")
      .primaryKey()
      .notNull()
      .defaultRandom(),
    name: text("name").notNull(),
    parentCategoryId: uuid("parent_category_id")
      .references((): AnyPgColumn => categories.id, { onDelete: "restrict" }),
    hidden: boolean("hidden").default(false).notNull(),
    featured: boolean("featured").default(false).notNull(),
    slug: text("slug").notNull().$defaultFn(() => uuidv4()),
    sortPriority: integer("sort_priority").default(0).notNull(),
    bannerImage: text("banner_image"),
    cardImage: text("card_image"),
    description: text("description").default(""),
    showCategoryCards: boolean("show_category_cards").default(true).notNull(),

    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    modifiedAt: timestamp("modified_at", { precision: 3, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ([index("categories_search_index").using(
      "gin",
      sql`(
        setweight(to_tsvector('english', ${table.name}), 'A')
      )`
    ),
  ])
)
export const categoryRelations = relations(categories, ({ one, many }) => ({
  parentCategory: one(categories, {
    fields: [categories.parentCategoryId],
    references: [categories.id],
    relationName: "parent_children_relation",
  }),
  children: many(categories, {
    relationName: "parent_children_relation",
  }),
  products: many(products, {
    relationName: "product_category_relation",
  }),
}))

export const products = pgTable(
  "products",
  {
    id: uuid("id")
      .primaryKey()
      .notNull()
      .defaultRandom(),
    name: text("name").notNull(),
    price: doublePrecision("price").notNull(),
    description: text("description"),
    minQuantity: integer("min_quantity").default(1).notNull(),
    maxQuantity: integer("max_quantity").default(0).notNull(),
    hidden: boolean("hidden").default(false).notNull(),
    images: text("images").array().default([]).notNull(),
    type: productType("type").notNull().default("single"),
    subAllowSinglePurchase: boolean("sub_allow_single_purchase").default(true).notNull(), // if it is a subscription, allow single term purchase in addition to subscription
    expiryPeriod: expiryPeriod("expiry_period").notNull().default("month"),
    expiryLength: integer("expiry_length").notNull().default(1),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "restrict" }),
    sortPriority: integer("sort_priority").default(0).notNull(),

    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    modifiedAt: timestamp("modified_at", { precision: 3, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ([
    index("products_search_index").using(
      "gin",
      sql`(
        setweight(to_tsvector('english', ${table.name}), 'A') ||
        setweight(to_tsvector('english', ${table.description}), 'B')
      )`
    ),
  ])
)


export const pgDeliveryWhen = pgEnum("delivery_when", deliveryWhen)
export const deliveries = pgTable('deliveries', {
  id: uuid('id')
    .primaryKey()
    .notNull()
    .defaultRandom(),
  type: text('type').notNull(),
  value: text('value').notNull(),
  scope: uuid('scope').references(() => servers.id, { onDelete: "set null" }),
  when: pgDeliveryWhen('when').notNull().default('purchase'),
  requireOnline: boolean('require_online').default(false).notNull(),
  delay: integer('delay').default(0).notNull(),
  global: boolean('global').default(false).notNull(),
  createdAt: timestamp('created_at', { precision: 3, mode: 'date' })
    .defaultNow()
    .notNull(),
});

export const deliveryRelations = relations(deliveries, ({ many }) => ({
  productToDelivery: many(productToDelivery)
}))

export const productToDelivery = pgTable(
  "product_to_delivery",
  {
    productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }),
    deliveryId: uuid("delivery_id").references(() => deliveries.id, { onDelete: "cascade" }),
  },
  (t) => [
    {
      pk: primaryKey({ columns: [t.productId, t.deliveryId] })
    }
  ]
)

export const productToDeliveryRelations = relations(productToDelivery, ({ one }) => ({
  product: one(products, {
    fields: [productToDelivery.productId],
    references: [products.id],
  }),
  delivery: one(deliveries, {
    fields: [productToDelivery.deliveryId],
    references: [deliveries.id],
  })
}))

export const productRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
    relationName: "product_category_relation",
  }),
  productToDelivery: many(productToDelivery)
}))

export const paymentProviders = pgEnum("payment_provider", ["tebex"])
export const orderStatus = ["pending", "completed", "canceled", "refunded"] as const;
export const pgOrderStatus = pgEnum("order_status", orderStatus)
export const disputeState = pgEnum("dispute_state", ["open", "won", "lost", "closed"])
export const subscriptionStatus = pgEnum("subscription_status", ["active", "expired", "canceled"])


export const orders = pgTable(
  "orders",
  {
    id: uuid("id")
      .primaryKey()
      .notNull()
      .defaultRandom(),
    items: jsonb("items")
      .notNull()
      .default([])
      .$type<Array<{productId: string, quantity: number}>>(),
    playerUuid: uuid("player_uuid").notNull(),
    provider: paymentProviders("provider").notNull(),
    providerOrderId: text("provider_order_id"),
    ipAddress: text("ip_address").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    status: pgOrderStatus("status").notNull().default("pending"),
    subscriptionStatus: subscriptionStatus("subscription_status").default("active"),
    subtotal: doublePrecision("subtotal").notNull(),
    disputed: boolean("disputed").default(false).notNull(),
    disputeState: disputeState("dispute_state"),
    metadata: jsonb("metadata")
      .notNull()
      .default({})
      .$type<Record<string, unknown>>(),
    lastRenewedAt: timestamp("last_renewed_at", { precision: 3, mode: "date" }),
    recurringTransactionIds: text("recurring_transaction_ids").array().default([]),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => ([
    {
      nameSearchIdx: index('orders_name_search_idx')
      .using('gin', sql`(
        setweight(to_tsvector('english', ${table.firstName}), 'A') ||
        setweight(to_tsvector('english', ${table.lastName}), 'A')
      )`),
      emailSearchIdx: index('orders_email_search_idx')
      .using('gin', sql`to_tsvector('english', ${table.email})`),
    }
  ])
)

export const settings = pgTable(
  "settings",
  {
    key: text("key").primaryKey().notNull(),
    value: text("value").notNull(),
    lastModified: timestamp("last_modified", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
  }
)

export const queuedCommands = pgTable(
  "queued_commands",
  {
    id: uuid("id")
      .primaryKey()
      .notNull()
      .defaultRandom(),
    orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    minecraftUuid: uuid("minecraft_uuid").notNull(),
    requireOnline: boolean("require_online").notNull().default(false),
    delay: integer("delay").notNull().default(0),
    payload: text("payload").notNull(),
    server: uuid("server").notNull(),
    executed: boolean("executed").notNull().default(false),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => ([
    index("queued_command_order_index").on(table.orderId),
    index("queued_command_player_uuid_index").on(table.minecraftUuid),
  ])
)

export const queuedCommandRelations = relations(queuedCommands, ({ one }) => ({
  order: one(orders, {
    fields: [queuedCommands.orderId],
    references: [orders.id],
    relationName: "queued_command_order_relation",
  }),
  server: one(servers, {
    fields: [queuedCommands.server],
    references: [servers.id],
    relationName: "queued_command_server_relation",
  })
}))

export const serverType = pgEnum("server_type", ["minecraft", "other"])
export const servers = pgTable(
  "servers",
  {
    id: uuid("id")
      .primaryKey()
      .notNull()
      .defaultRandom(),
    name: text("name").notNull().unique(),
    secretKey: text("secret_key").notNull(),
    type: serverType("type").notNull().default("minecraft"),
    notes: text("notes").default(""),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    lastModified: timestamp("last_modified", { precision: 3, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }
)

export const orderRelations = relations(orders, ({ one, many }) => ({
  orderToCoupon: many(orderToCoupon),
}))

export * from "@/server/db/discounts";
export * from "@/server/db/coupons";