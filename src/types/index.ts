import type {
  BuildQueryResult,
  DBQueryConfig,
  ExtractTablesWithRelations,
} from "drizzle-orm";

import type * as schema from "@/server/db/schema";
import { z } from "zod";

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

/*
function getDefaults<Schema extends z.AnyZodObject>(schema: Schema) {
    return Object.fromEntries(
        Object.entries(schema.shape).map(([key, value]) => {
            if (value instanceof z.ZodDefault) return [key, value._def.defaultValue()]
            return [key, undefined]
        })
    )
}
*/
export const getDefaultValue = <ZodSchema extends z.AnyZodObject>(schema: ZodSchema, key: keyof ZodSchema["shape"]) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const value = schema.shape[key] as z.ZodTypeAny;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  if (value instanceof z.ZodDefault) return value._def.defaultValue();
  return undefined;
}

export type User = InferResultType<"users">;
export type Product = InferResultType<"products">;
export type Category = InferResultType<"categories">;
export type Order = InferResultType<"orders">;

export type PaymentProvider = "tebex"; // | "coinbase" etc...

export type CategoryWithChildren = Category & {
  children?: Category[]; // children should never have their own children
};

export type ProductAndCategory = Product & {
  category?: Category;
}


export type SlimProduct = Pick<Product, "id" | "name" | "hidden" | "categoryId"> & { __product: true };
export type SlimCategory = Omit<Category, "createdAt" | "modifiedAt"> & { __category: true };

export type CategoryAndSlimProducts = SlimCategory & {
  products: SlimProduct[];
  children: CategoryAndSlimProducts[];
}


export type CategoryTreeNode = CategoryAndSlimProducts | SlimProduct;
export type CategoryTree = CategoryTreeNode[];