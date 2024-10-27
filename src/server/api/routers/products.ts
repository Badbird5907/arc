import { createTRPCRouter, procedure, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { products } from "@/server/db/schema";
import { createProductInput, getProductsInput, modifyProductInput } from "@/trpc/schema/products";
import { type AnyColumn, asc, desc, eq, getTableColumns, type SQL, sql, type SQLWrapper } from "drizzle-orm";
import { z } from "zod";

export const productRouter = createTRPCRouter({
  getProducts: procedure("products:read")
  .input(getProductsInput)
  .query(async ({ input }) => { // i hate this god awful code
    const orderStuff = (inQuery: AnyColumn | SQLWrapper) => {
      if (input.order === "asc") {
        return asc(inQuery)
      } else {
        return desc(inQuery)
      }
    }

    const orderBy = (t: { name: SQLWrapper, price: SQLWrapper, createdAt: SQLWrapper, modifiedAt: SQLWrapper, hidden: SQLWrapper, rank?: SQLWrapper}) => {
      switch (input.sort) {
        case "name":
          return orderStuff(t.name)
        case "price":
          return orderStuff(t.price)
        case "created":
          return orderStuff(t.createdAt)
        case "modified":
          return orderStuff(t.modifiedAt)
        case "hidden":
          return orderStuff(t.hidden)
      }
      if (t.rank) {
        return orderStuff(t.rank)
      }
      return orderStuff(t.name)
    }
    
    if (input.search) {
      const matchQuery = sql`(
        setweight(to_tsvector('english', ${products.name}), 'A') ||
        setweight(to_tsvector('english', ${products.description}), 'B')), to_tsquery('english', ${input.search})`;
      return db.select({
        ...getTableColumns(products),
        rank: sql`ts_rank(${matchQuery})`,
        rankCd: sql`ts_rank_cd(${matchQuery})`
      }).from(products)
      .where(
        sql`(
        setweight(to_tsvector('english', ${products.name}), 'A') ||
        setweight(to_tsvector('english', ${products.description}), 'B')
        ) @@ to_tsquery('english', ${input.search})`,
      ).orderBy(orderBy);
    }

    return db.select(getTableColumns(products)).from(products).orderBy(orderBy);
  }),
  getProduct: procedure("products:read")
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    return db.query.products.findFirst({
      where: (p, { eq }) => eq(p.id, input.id)
    })
  }),
  createProduct: procedure("products:create")
  .input(createProductInput)
  .mutation(async ({ input }) => {
    return db.insert(products).values(input).returning(getTableColumns(products));
  }),
  modifyProduct: procedure("products:modify")
  .input(modifyProductInput)
  .mutation(async ({ input }) => {
    // remove null/undefined values
    const newValues = Object.fromEntries(
      Object.entries(input.data).filter(([_, v]) => v !== null && v !== undefined)
    )

    return db.update(products)
    .set(newValues).where(eq(products.id, input.id));
  }),
  deleteProduct: procedure("products:delete")
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    return db.delete(products).where(eq(products.id, input.id));
  })

})