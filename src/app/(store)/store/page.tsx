import { db } from "@/server/db"
import { categories } from "@/server/db/schema"
import { asc } from "drizzle-orm"
import { CategoryCard } from "@/app/(store)/category-card"

export default async function MainStorePage() {
  const data = await db.query.categories.findMany({
    where: (c, { eq, isNull, and }) =>
      and(eq(c.hidden, false), isNull(c.parentCategoryId), eq(c.featured, true)),
    orderBy: [asc(categories.sortPriority)],
  })

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 gap-6 pt-8 md:grid-cols-2 lg:grid-cols-3 place-items-center">
        {data.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  )
}