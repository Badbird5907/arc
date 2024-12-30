import { pgTable, timestamp, uuid, text, boolean } from "drizzle-orm/pg-core";

export const players = pgTable(
  "players",
  {
    uuid: uuid("uuid")
      .primaryKey()
      .notNull(),
    notes: text("notes").default(""),
    banned: timestamp("banned", { precision: 3, mode: "date" }),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
  }
)