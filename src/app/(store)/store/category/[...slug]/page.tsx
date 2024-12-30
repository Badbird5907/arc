import { CategoryCard } from "@/app/(store)/category-card";
import { ProductCard } from "@/app/(store)/product-card";
import { StoreBanner } from "@/app/(store)/store-banner";
import { SubCategorySelector } from "@/app/(store)/store/category/[...slug]/selector";
import { db } from "@/server/db";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string[] }>
}) {
  const slugs = (await params).slug;
  const zero = slugs[0];
  if (!zero) {
    return notFound();
  }
  const base = await db.query.categories.findFirst({
    where: (c, { eq, and, isNull }) => and(
      eq(c.slug, zero),
      isNull(c.parentCategoryId)
    ),
    with: {
      children: true
    }
  });
  if (!base) {
    return notFound();
  }
  const current = slugs.length > 1 ? base.children.find((c) => c.slug === slugs[1]) : base;
  if (!current) {
    return notFound();
  } 
  return {
    title: current.name
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const slugs = (await params).slug;
  const zero = slugs[0];
  if (!zero) {
    return notFound();
  }
  const base = await db.query.categories.findFirst({
    where: (c, { eq, and, isNull }) => and(
      eq(c.slug, zero),
      isNull(c.parentCategoryId)
    ),
    with: {
      children: true
    }
  });
  if (!base) {
    return notFound();
  }
  const current = slugs.length > 1 ? base.children.find((c) => c.slug === slugs[1]) : base;
  if (!current) {
    return notFound();
  }
  const products = await db.query.products.findMany({
    where: (p, { eq, and }) => and(
      eq(p.categoryId, current.id),
      eq(p.hidden, false)
    ),
    orderBy: (p, { asc }) => asc(p.sortPriority)
  });
  return (
    <>
      <StoreBanner title={current.name} subTitle={current.description} />
      <SubCategorySelector base={base} current={current} />
      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 gap-6 pt-8 md:grid-cols-2 lg:grid-cols-3 place-items-center">
          {current.id === base.id && base.showCategoryCards && base.children.map((category) => {
            if (category.hidden) return null;
            return (
              <CategoryCard key={category.id} category={category} parent={base} />
            )
          })}
          {products.map((product, key) => (
            <ProductCard key={key} product={product} />
          ))}
        </div>
      </div>
    </>
  )
}