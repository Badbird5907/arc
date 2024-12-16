import { appConfig } from "@/app/app-config"
import { AdminSidebarLogout } from "@/components/admin/sidebar/logout"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { type User } from "@/types"
import { Boxes, Home, Settings, ChevronUp, Server, Package, TicketPercent } from "lucide-react"
import Link from "next/link"

export const adminSidebarItems = [
  {
    title: "Home",
    url: "",
    icon: Home,
  },
  {
    title: "Products",
    url: "/products",
    icon: Boxes,
    permission: "admin:products:view",
  },
  {
    title: "Orders",
    url: "/orders",
    icon: Package,
    permission: "admin:orders:view",
  },
  {
    title: "Coupons",
    url: "/coupons",
    icon: TicketPercent,
    permission: "admin:coupons:view",
  },
  {
    title: "Servers",
    url: "/servers",
    icon: Server,
    permission: "admin:servers:view",
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]


export function AdminSidebar({ user }: { user: User }) {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Arc - Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminSidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={`/admin${item.url}`} prefetch={false}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    {user.displayName}
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <AdminSidebarLogout />
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
  )
}
