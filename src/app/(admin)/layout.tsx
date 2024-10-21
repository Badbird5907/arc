import { AdminSidebar } from "@/app/(admin)/sidebar"
import { SiteHeader } from "@/components/header"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>

      <SidebarProvider>
        <AdminSidebar />
        <main className="bg-zinc-800 min-h-screen w-full">
          <SiteHeader admin />
          {children}
        </main>
      </SidebarProvider>
    </>
  )
}
