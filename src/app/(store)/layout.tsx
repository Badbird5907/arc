import { appConfig } from "@/app/app-config"
import { SiteHeader } from "@/components/header"
import { StoreHeader } from "@/components/header/store"
import { api, HydrateClient } from "@/trpc/server"
import Image from "next/image"

export default async function StoreLayout({
  children
}: {
  children: React.ReactNode
}) {
  await Promise.all([
    api.categories.getCategoryTree.prefetch({ featuredOnly: true}),
    api.categories.getProductsAndCategoryTree.prefetch({ mergeTree: true })
  ])
  return (
    <HydrateClient>
      <SiteHeader />
      <main className="bg-background min-h-screen w-full">
        <div className="w-full">
          <div className="w-full h-[40vh] bg-cover bg-center bg-no-repeat text-center" style={{ backgroundImage: 'url(/img/banner.png)' }}>
          <StoreHeader />
          <div className="h-full place-content-center gap-4 flex flex-col">
            <Image src="/img/logo.png" width={128} height={128} alt={appConfig.title} className="self-center" />
              <h1 className="text-6xl md:text-8xl font-bold">Store</h1>
            </div>
          </div>
          {children}
        </div>
      </main>
    </HydrateClient>
  )
}