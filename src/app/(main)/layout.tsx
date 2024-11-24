import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/header"
import { env } from "@/env";

export default function StoreLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SiteHeader />
      <main className="bg-background min-h-screen w-full">
        {children}
      </main>
      <Footer />
    </>
  )
}