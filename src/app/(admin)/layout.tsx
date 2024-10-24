
import { AdminSidebar } from "@/components/admin/sidebar";
import { UserProvider } from "@/components/contexts/user";
import { SiteHeader } from "@/components/header"
import { SidebarProvider } from "@/components/ui/sidebar"
import { getSession } from "@/server/actions/auth"
import { getUser } from "@/utils/server/helpers";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session.data.user) {
    return redirect("/auth/login");
  }
  const user = await getUser(session.data.user.id);
  if (!user) {
    return redirect("/auth/login");
  }
  return (
    <SidebarProvider>
      <AdminSidebar user={user} />
      <main className="bg-background min-h-screen w-full">
        <SiteHeader admin />
        <div className="p-4">
          <UserProvider user={user}>
            {children}
          </UserProvider>
        </div>
      </main>
    </SidebarProvider>
  )
}
