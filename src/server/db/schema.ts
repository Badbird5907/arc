import { v4 as uuidv4 } from "uuid";

import {
  boolean,
  decimal,
  index,
  integer,
  numeric,
  pgEnum,
  pgTableCreator,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { rolesArr } from "@/lib/permissions";
import { sql } from "drizzle-orm";

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

export const products = createTable(
  "products",
  {
    id: uuid("id")
      .primaryKey()
      .notNull()
      .$defaultFn(() => uuidv4()),
    name: text("name").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).$type<number>().notNull(),
    description: text("description"),
    minQuantity: integer("min_quantity").default(1).notNull(),
    hidden: boolean("hidden").default(false).notNull(),
    expiryPeriod: expiryPeriod("expiry_period").notNull().default("month"),
    expiryLength: integer("expiry_length").notNull().default(1),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    modifiedAt: timestamp("modified_at", { precision: 3, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    searchIndex: index("search_index").using(
      "gin",
      sql`(
        setweight(to_tsvector('english', ${table.name}), 'A') ||
        setweight(to_tsvector('english', ${table.description}), 'B')
      )`
    )
  })
)
