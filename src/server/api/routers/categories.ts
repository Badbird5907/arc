import { createTRPCRouter, procedure, publicProcedure } from "@/server/api/trpc";
import { type Category, type CategoryAndSlimProducts, type SlimProduct } from "@/types";
import { mergeCategoriesAndProducts } from "@/utils/helpers/products";
import { getUser } from "@/utils/server/helpers";
import { RBAC } from "@/lib/permissions";
import { db } from "@/server/db";
import { and, asc, eq, getTableColumns, inArray, not } from "drizzle-orm";
import { categories, products } from "@/server/db/schema";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { categoryData, categoryImageFields, optionalCategoryData } from "@/trpc/schema/products";
import { createBareServerClient } from "@/utils/supabase/server";
import { v4 as uuid } from "uuid";

export const categoriesRouter = createTRPCRouter({
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
  getCategoryTree: publicProcedure // does not sort!!
  .input(z.object({ id: z.string().optional(), featuredOnly: z.boolean().optional().default(false) }))
  .query(async ({ input }) => {
    const { id } = input;
    if (id) {
      return db.query.categories.findFirst({
        where: (c, { eq, and }) => and(
          eq(c.id, id),
          input.featuredOnly ? eq(c.featured, true) : undefined
        ),
        with: {
          children: true,
          parentCategory: true
        }
      });
    }
    return db.query.categories.findMany({
      where: (c, { isNull, and, eq }) => and(
        isNull(c.parentCategoryId),
        input.featuredOnly ? eq(c.featured, true) : undefined
      ),
      with: {
        children: true
      }
    });
  }),
  getProductsAndCategoryTree: publicProcedure
  .input(z.object({
    mergeTree: z.boolean().optional().default(false),
    categoryId: z.string().optional(),
    showHidden: z.boolean().optional().default(false),
  }))
  .query(async ({ input, ctx }) => {
    if (input.showHidden) {
      const userId = ctx.session.data.user?.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to view hidden products!"
        })
      }
      const user = await getUser(userId);
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to view hidden products!"
        })
      }
      if (!await RBAC.can(user.role, "products:read:hidden")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to view hidden products!"
        })
      }
    }
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
        }).from(products).where(input.showHidden ? undefined : not(products.hidden))
          .orderBy(asc(products.name))
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
          and(
            inArray(products.categoryId, categoryIds),
            input.showHidden ? undefined : not(products.hidden)
          )
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
  createCategory: procedure("products:create")
  .input(categoryData)
  .mutation(async ({ input: { name, parentCategoryId, slug } }) => {
    return db.insert(categories).values({ name, parentCategoryId, slug }).returning(getTableColumns(categories));
  }),
  modifyCategory: procedure("products:modify")
  .input(z.object({ id: z.string(), data: optionalCategoryData }))
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
  requestUploadUrl: procedure("products:modify")
  .input(z.object({ categoryId: z.string(), extension: z.string() }))
  .mutation(async ({ input }) => {
    const supabase = await createBareServerClient();
    const id = uuid();
    const ext = input.extension.startsWith(".") ? input.extension.slice(1) : input.extension;
    console.log("Creating signed url for", `${input.categoryId}/${id}.${ext}`);
    const { data, error } = await supabase.storage.from("categories").createSignedUploadUrl(`${input.categoryId}/${id}.${ext}`);
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
  deleteImage: procedure("products:modify")
  .input(z.object({ categoryId: z.string(), imageId: z.string() }))
  .mutation(async ({ input }) => {
    const supabase = await createBareServerClient();
    const { error } = await supabase.storage.from("categories").remove([`${input.categoryId}/${input.imageId}`]);
    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message
      })
    }
    const category = await db.query.categories.findFirst({
      where: (c, { eq }) => eq(c.id, input.categoryId)
    });
    if (!category) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Category not found!"
      })
    }
    const fields = Object.keys(categoryImageFields);
    const setNullNames: string[] = [];
    fields.forEach((fieldName) => {
      if (category[fieldName as keyof typeof category] === input.imageId) {
        setNullNames.push(fieldName);
      }
    });

    return db.update(categories).set(Object.fromEntries(setNullNames.map((name) => [name, null]))).where(eq(categories.id, input.categoryId));
  }),
})