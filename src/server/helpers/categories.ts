import { db } from "@/server/db";


export const getCategoryTree = (id?: string, featuredOnly?: boolean) => {
  if (id) {
    return db.query.categories.findFirst({
      where: (c, { eq, and }) => and(
        eq(c.id, id),
        featuredOnly ? eq(c.featured, true) : undefined
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
      featuredOnly ? eq(c.featured, true) : undefined
    ),
    with: {
      children: true
    }
  });
}