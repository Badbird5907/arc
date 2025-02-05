import { appConfig } from "@/app/app-config";
import { Footer } from "@/components/footer"
import { SiteHeader } from "@/components/header"
import { StoreHeader } from "@/components/header/store"
import { api, HydrateClient } from "@/trpc/server"
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: `${appConfig.title} | Store > %s`,
    default: `${appConfig.title} | Store`
  }
}
export default async function StoreLayout({
  children
}: {
  children: React.ReactNode
}) {
  await Promise.all([
    api.categories.getCategoryTree.prefetch({}),
    // api.categories.getProductsAndCategoryTree.prefetch({ mergeTree: true })
  ])
  return (
    <HydrateClient>
      <SiteHeader store />
      <main className="bg-background min-h-screen w-full relative">
        <StoreHeader />
        {children}
      </main>
      <Footer />
    </HydrateClient>
  )
}