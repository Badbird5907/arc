import { appConfig } from "@/app/app-config"
import { SiteHeader } from "@/components/header"
import Image from "next/image"

export default function StoreLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SiteHeader />
      <main className="bg-background min-h-screen w-full">
        <div className="w-full">
          <div className="w-full h-[40vh] bg-cover bg-center bg-no-repeat text-center" style={{ backgroundImage: 'url(/img/banner.png)' }}>
            <div className="h-full place-content-center gap-4 flex flex-col">
              <Image src="/img/logo.png" width={128} height={128} alt={appConfig.title} className="self-center" />
              <h1 className="text-6xl md:text-8xl font-bold">Store</h1>
            </div>
          </div>
          {children}
        </div>
      </main>
    </>
  )
}