import { AdminSidebarLogout } from "@/components/admin/sidebar/logout"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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
import { Boxes, Home, Settings, ChevronUp, Server, Package, TicketPercent, Users, ChevronDown, Eye, Gavel } from "lucide-react"
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
    title: "Players",
    icon: Users,
    permission: "admin:players:*",
    url: "/players", // this is the base url
    accessible: false,
    children: [
      {
        title: "View Player Profile",
        url: "/find", // this would be /players/find
        icon: Eye,
        permission: "admin:players:view",
      },
      {
        title: "Banned Players",
        url: "/banned", // this would be /players/banned
        icon: Gavel,
        permission: "admin:players:banned",
      }
    ]
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
              {adminSidebarItems.map((item) => {
                if (!item.children) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link href={`/admin${item.url}`} prefetch={false}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                }
                return (
                  <Collapsible defaultOpen className="group/collapsible" key={item.title}>
                    <SidebarGroup className="p-0">
                      <SidebarGroupLabel asChild>
                        <CollapsibleTrigger className="" asChild>
                          <SidebarMenuItem className="p-0">
                            <SidebarMenuButton className="text-white">
                              <item.icon />
                              <span>{item.title}</span>
                              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        </CollapsibleTrigger>
                      </SidebarGroupLabel>
                      <CollapsibleContent>
                        <SidebarGroupContent>
                          {item.children.map((child) => (
                            <SidebarMenuItem key={child.title} className="pl-4">
                              <SidebarMenuButton asChild>
                                <Link href={`/admin${item.url}${child.url}`} prefetch={false}>
                                  <child.icon />
                                  <span>{child.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </SidebarGroupContent>
                      </CollapsibleContent>
                    </SidebarGroup>
                  </Collapsible>
                )
              })}
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
