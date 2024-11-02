import { createTRPCRouter, procedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { categories, products } from "@/server/db/schema";
import { categoryData, createProductInput, getProductsInput, modifyProductInput } from "@/trpc/schema/products";
import { createBareServerClient } from "@/utils/supabase/server";
import { and, type AnyColumn, asc, desc, eq, getTableColumns, inArray, or, type SQL, sql, type SQLWrapper } from "drizzle-orm";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { TRPCError } from "@trpc/server";
import { Category, CategoryAndSlimProducts, SlimCategory, SlimProduct, type ProductAndCategory } from "@/types";
import { mergeCategoriesAndProducts } from "@/utils/helpers/products";
import { add } from "@dnd-kit/utilities";

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
        filterHidden(
          sql`(
            setweight(to_tsvector('english', ${products.name}), 'A') ||
            setweight(to_tsvector('english', ${products.description}), 'B')
            ) @@ to_tsquery('english', ${input.search})`
        ),
      ).orderBy(orderBy);
    }

    return db.select(rest).from(products)
      .where(filterHidden(sql`true`))
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
  getCategories: procedure("products:read")
  .query(async () => {
    return db.select(getTableColumns(categories)).from(categories);
  }),
  getCategory: procedure("products:read")
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    return db.query.categories.findFirst({
      where: (c, { eq }) => eq(c.id, input.id)
    });
  }),
  getCategoryTree: procedure("products:read")
  .input(z.object({ id: z.string().optional() }))
  .query(async ({ input }) => {
    const { id } = input;
    if (id) {
      return db.query.categories.findFirst({
        where: (c, { eq }) => eq(c.id, id),
        with: {
          children: true,
          parentCategory: true
        }
      });
    }
    return db.query.categories.findMany({
      where: (c, { isNull }) => isNull(c.parentCategoryId),
      with: {
        children: true
      }
    });
  }),
  getProductsAndCategoryTree: procedure("products:read")
  .input(z.object({ mergeTree: z.boolean().optional().default(false), categoryId: z.string().optional() }))
  .query(async ({ input }) => {
    let categories: Category[] | null = null, selectedProducts: Omit<SlimProduct, "__product">[] | null = null;
    if (!input.categoryId) {
      [categories, selectedProducts] = await Promise.all([
        db.query.categories.findMany({
          where: (c, { isNull }) => isNull(c.parentCategoryId),
          with: {
            children: true,
          }
        }),
        db.select({
          id: products.id,
          name: products.name,
          hidden: products.hidden,
          categoryId: products.categoryId,
        }).from(products).orderBy(asc(products.name))
      ])
    } else {
      const category = await db.query.categories.findFirst({
        where: (c, { eq }) => eq(c.id, input.categoryId!),
        with: {
          children: true,
        }
      });
      categories = [{
        ...category!,
        parentCategoryId: null, // HACK: there is a bug in mergeCategoriesAndProducts that makes it return [] if parentCategoryId is null. I'm too lazy to fix it so this works.
      }];
      const categoryIds = categories.map((c) => c.id);
      categories.forEach((c) => {
        if ("children" in c) {
          categoryIds.push(...(c.children as { id: string }[]).map((c) => c.id));
        }
      });
      selectedProducts = await db.select({
        id: products.id,
        name: products.name,
        hidden: products.hidden,
        categoryId: products.categoryId,
      }).from(products)
        .where(
          // eq(products.categoryId, input.categoryId)
          inArray(products.categoryId, categoryIds)
        )
        .orderBy(asc(products.name));
    }
    const fCategories = categories.map((category) => {
      const addCategoryTag = (c: typeof categories[0] | Omit<typeof categories[0], "children">) => {
        return {
          ...c,
          __category: true,
        }
      }
      return {
        ...addCategoryTag(category),
        children: Array.isArray((category as { children?: typeof categories[0][] }).children) ? (category as { children?: typeof categories[0][] }).children!.map(addCategoryTag) : []
      };
    }) as unknown as CategoryAndSlimProducts[];
    const fProducts: SlimProduct[] = selectedProducts.map((p) => {
      return {
        ...p,
        __product: true,
      }
    });
    if (!input.mergeTree) {
      return { categories: fCategories, products: fProducts };
    }
    return mergeCategoriesAndProducts(fCategories, fProducts);
  }),
  createProduct: procedure("products:create")
  .input(createProductInput)
  .mutation(async ({ input }) => {
    return db.insert(products).values(input).returning(getTableColumns(products));
  }),
  createCategory: procedure("products:create")
  .input(categoryData)
  .mutation(async ({ input: { name, parentCategoryId, slug } }) => {
    return db.insert(categories).values({ name, parentCategoryId, slug }).returning(getTableColumns(categories));
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
  modifyCategory: procedure("products:modify")
  .input(z.object({ id: z.string(), data: categoryData }))
  .mutation(async ({ input }) => {
    // remove undefined values (keep nulls)
    const newValues = Object.fromEntries(
      Object.entries(input.data).filter(([_, v]) => v !== undefined)
    )
    // get current
    const category = await db.query.categories.findFirst({
      where: (c, { eq }) => eq(c.id, input.id),
      with: {
        children: true,
      }
    });
    if (!category) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Category not found!"
      })
    }
    // check parent/child is valid (no circular references, no children)
    if (newValues.parentCategoryId) {
      if (newValues.parentCategoryId === category.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Category cannot be its own parent!"
        })
      }
      if (category.children.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Category has children! You cannot have deeply nested categories!"
        })
      }
    }
    return db.update(categories)
    .set(newValues).where(eq(categories.id, input.id));
  }),
  deleteProduct: procedure("products:delete")
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    return db.delete(products).where(eq(products.id, input.id));
  }),
  deleteCategory: procedure("products:delete")
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    // check if there are any dependant categories/products first!
    const dependantCategories = await db.query.categories.findMany({
      where: (c, { eq }) => eq(c.parentCategoryId, input.id)
    });
    if (dependantCategories.length > 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Cannot delete category as there are dependant categories! Please delete them first!"
      })
    }
    const dependantProducts = await db.query.products.findMany({
      where: (p, { eq }) => eq(p.categoryId, input.id)
    }); // don't need to recursively check children categories as dependant products will be checked if the user tries to delete the children first
    if (dependantProducts.length > 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Cannot delete category as there are dependant products! Please delete them first!"
      })
    }
    return db.delete(categories).where(eq(categories.id, input.id));
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