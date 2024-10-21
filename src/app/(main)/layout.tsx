import { SiteHeader } from "@/components/header"

export default function StoreLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <main className="bg-zinc-800 min-h-screen w-full">
      <SiteHeader />
      {children}
    </main>
  )
}