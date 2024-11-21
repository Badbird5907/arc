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
  pgTableCreator,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { rolesArr } from "@/lib/permissions";
import { relations, sql } from "drizzle-orm";
import { Delivery } from "@/types";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => name);

export const rolesPgEnum = pgEnum("roles", rolesArr);

// When modifying this table, make sure to modify the database function in db_functions/signup.sql
export const users = createTable(
  "users",
  {
    id: uuid("id")
      .primaryKey()
      .notNull()
      .$defaultFn(() => uuidv4()),
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

export const categories = createTable(
  "categories",
  {
    id: uuid("id")
      .primaryKey()
      .notNull()
      .$defaultFn(() => uuidv4()),
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
  (table) => ({
    searchIndex: index("categories_search_index").using(
      "gin",
      sql`(
        setweight(to_tsvector('english', ${table.name}), 'A')
      )`
    ),
  })
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
export const products = createTable(
  "products",
  {
    id: uuid("id")
      .primaryKey()
      .notNull()
      .$defaultFn(() => uuidv4()),
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

    // game server command, or other stuff
    delivery: jsonb("delivery").$type<Delivery[]>(),

    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    modifiedAt: timestamp("modified_at", { precision: 3, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    searchIndex: index("products_search_index").using(
      "gin",
      sql`(
        setweight(to_tsvector('english', ${table.name}), 'A') ||
        setweight(to_tsvector('english', ${table.description}), 'B')
      )`
    ),
  })
)


export const productRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
    relationName: "product_category_relation",
  })
}))

export const paymentProviders = pgEnum("payment_provider", ["tebex"])
export const orderStatus = pgEnum("order_status", ["pending", "completed", "canceled", "refunded"])
export const disputeState = pgEnum("dispute_state", ["open", "won", "lost", "closed"])

export const orders = createTable(
  "orders",
  {
    id: uuid("id")
      .primaryKey()
      .notNull()
      .$defaultFn(() => uuidv4()),
    items: jsonb("items")
      .notNull()
      .default([])
      .$type<Array<{productId: string, quantity: number}>>(),
    playerUuid: text("player_uuid").notNull(),
    provider: paymentProviders("provider").notNull(),
    providerOrderId: text("provider_order_id"),
    ipAddress: text("ip_address").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    status: orderStatus("status").notNull().default("pending"),
    subtotal: doublePrecision("subtotal").notNull(),
    disputed: boolean("disputed").default(false).notNull(),
    disputeState: disputeState("dispute_state"),
    metadata: jsonb("metadata")
      .notNull()
      .default({})
      .$type<Record<string, unknown>>(),

    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
  }
)

export const settings = createTable(
  "settings",
  {
    key: text("key").primaryKey().notNull(),
    value: text("value").notNull(),
    lastModified: timestamp("last_modified", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
  }
)

export const queuedCommands = createTable(
  "queued_commands",
  {
    id: uuid("id")
      .primaryKey()
      .notNull()
      .$defaultFn(() => uuidv4()),
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
  (table) => ({
    queuedCommandOrderIndex: index("queued_command_order_index").on(table.orderId),
    queuedCommandPlayerUuidIndex: index("queued_command_player_uuid_index").on(table.minecraftUuid),
  })
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
export const servers = createTable(
  "servers",
  {
    id: uuid("id")
      .primaryKey()
      .notNull()
      .$defaultFn(() => uuidv4()),
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
