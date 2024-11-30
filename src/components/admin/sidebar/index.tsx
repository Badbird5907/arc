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
import { Boxes, Home, Settings, ChevronUp, Server } from "lucide-react"

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
    title: "Servers",
    url: "/servers",
    icon: Server,
    permission: "admin:servers:view",
  },
  {
    title: "Orders",
    url: "/orders",
    icon: Server,
    permission: "admin:orders:view",
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
          <SidebarGroupLabel>{appConfig.title}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminSidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={`/admin/${item.url}`}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
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
