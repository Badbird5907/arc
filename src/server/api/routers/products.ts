import { createTRPCRouter, procedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { products } from "@/server/db/schema";
import { createProductInput, getProductsInput, modifyProductInput } from "@/trpc/schema/products";
import { createBareServerClient } from "@/utils/supabase/server";
import { and, type AnyColumn, asc, desc, eq, getTableColumns, type SQL, sql, type SQLWrapper } from "drizzle-orm";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { TRPCError } from "@trpc/server";
import { type ProductAndCategory } from "@/types";

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

    const canReadHidden = true;
    const filterHidden = (input: SQL<unknown>) => {
      if (canReadHidden) {
        return input
      }
      return and(input, eq(products.hidden, false))
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { description: _unused, ...rest } = getTableColumns(products);
    if (input.search) {
      const matchQuery = sql`(
        setweight(to_tsvector('english', ${products.name}), 'A') ||
        setweight(to_tsvector('english', ${products.description}), 'B')), to_tsquery('english', ${input.search})`;
      return db.select({
        ...rest,
        rank: sql`ts_rank(${matchQuery})`,
        rankCd: sql`ts_rank_cd(${matchQuery})`
      }).from(products)
      .where(
        and(
          filterHidden(
            sql`(
              setweight(to_tsvector('english', ${products.name}), 'A') ||
              setweight(to_tsvector('english', ${products.description}), 'B')
              ) @@ to_tsquery('english', ${input.search})`
          ),
          input.categoryId ? eq(products.categoryId, input.categoryId) : undefined
        )
      ).orderBy(orderBy);
    }

    return db.select(rest).from(products)
      .where(and(
        filterHidden(sql`true`),
        input.categoryId ? eq(products.categoryId, input.categoryId) : undefined
      ))
      .orderBy(orderBy);
  }),
  getProduct: procedure("products:read")
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    const val = await db.query.products.findFirst({
      where: (p, { eq }) => eq(p.id, input.id),
      with: {
        category: true
      }
    });
    return val as ProductAndCategory;
  }),
  createProduct: procedure("products:create")
  .input(createProductInput)
  .mutation(async ({ input }) => {
    return db.insert(products).values(input).returning(getTableColumns(products));
  }),
  modifyProduct: procedure("products:modify")
  .input(modifyProductInput)
  .mutation(async ({ input }) => {
    // remove undefined values (keep nulls)
    const newValues = Object.fromEntries(
      Object.entries(input.data).filter(([_, v]) => v !== undefined)
    )
    return db.update(products)
    .set(newValues).where(eq(products.id, input.id));
  }),
  deleteProduct: procedure("products:delete")
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    const supabase = await createBareServerClient();
    const product = await db.query.products.findFirst({
      where: (p, { eq }) => eq(p.id, input.id)
    });
    if (!product) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Product not found!"
      })
    }
    // delete images
    await supabase.storage.from("products").remove(product.images.map((img) => `${product.id}/${img}`));
    // delete
    return db.delete(products).where(eq(products.id, input.id));
  }),
  
  deleteImage: procedure("products:modify")
  .input(z.object({ productId: z.string(), imageId: z.string() }))
  .mutation(async ({ input }) => {
    const supabase = await createBareServerClient();
    const { data, error } = await supabase.storage.from("products").remove([`${input.productId}/${input.imageId}`]);
    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message
      })
    }
    // remove from products
    await db.update(products)
    .set({ images: sql`array_remove(${products.images}, ${input.imageId})` })
    .where(eq(products.id, input.productId));
    
    return data;
  }),
  requestUploadUrl: procedure("products:modify")
  .input(z.object({ productId: z.string(), extension: z.string() }))
  .mutation(async ({ input }) => {
    const supabase = await createBareServerClient();
    const id = uuid();
    const ext = input.extension.startsWith(".") ? input.extension.slice(1) : input.extension;
    console.log("Creating signed url for", `${input.productId}/${id}.${ext}`);
    // check if storage bucket exists
    /*const { data: bucket } = await supabase.storage.getBucket("products");
    if (!bucket) {
      // console.log("Creating bucket");
      // await supabase.storage.createBucket("products", { public: true, allowedMimeTypes: ["image/*"] });
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Supabase storage bucket does not exist! Please create one named \"products\" with public access and allowed mime types of \"image/*\", and \"video/*\"!"
      })
    }*/
    const { data, error } = await supabase.storage.from("products").createSignedUploadUrl(`${input.productId}/${id}.${ext}`);
    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message
      })
    }
    return {
      id,
      ext,
      url: data.signedUrl,
      token: data.token,
      path: data.path,
    }
  }),

})