"use client";

import { ErrorPage } from "@/components/pages/error";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/trpc/react"

export const CategoryPageClient = ({ id }: { id: string }) => {
  const { isLoading, isError, data: category } = api.products.getCategoryTree.useQuery({ id });
  if (isLoading) return <Spinner />;
  if (isError) return <ErrorPage code="500" />;
  if (!category) {
    return <ErrorPage code="404" />;
  }
  return (
    <div className="flex flex-col gap-4 pt-4">
      <pre>{JSON.stringify(category, null, 2)}</pre>
    </div>
  )
}