import type {
  BuildQueryResult,
  DBQueryConfig,
  ExtractTablesWithRelations,
} from "drizzle-orm";

import type * as schema from "@/server/db/schema";

type Schema = typeof schema;
type TSchema = ExtractTablesWithRelations<Schema>;

export type IncludeRelation<TableName extends keyof TSchema> = DBQueryConfig<
  "one" | "many",
  boolean,
  TSchema,
  TSchema[TableName]
>["with"];

export type InferResultType<
  TableName extends keyof TSchema,
  With extends IncludeRelation<TableName> | undefined = undefined,
> = BuildQueryResult<
  TSchema,
  TSchema[TableName],
  {
    with: With;
  }
>;

export type User = InferResultType<"users">;
export type Product = InferResultType<"products">;
export type Category = InferResultType<"categories">;

export type ProductAndCategory = Product & {
  category?: Category;
}