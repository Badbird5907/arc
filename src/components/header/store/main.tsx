"use client";

import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import Link from "next/link";
import * as React from "react";
import Image from "next/image";

export function MainStoreNav() {
  const { data: categoryTree } = api.categories.getCategoryTree.useQuery({ featuredOnly: true });

  const sortedData = React.useMemo(() => {
    if (!Array.isArray(categoryTree)) return [];
    // check sortPriority first, then name. Higher sortPriority comes first
    return categoryTree.sort((a, b) => {
      console.log(`Sorting: ${a.name} vs ${b.name}`)
      if (a.sortPriority === b.sortPriority) {
        console.log(` -> locale: ${a.name.localeCompare(b.name)}`)
        return a.name.localeCompare(b.name);
      }
      console.log(` -> sortPriority: ${a.sortPriority - b.sortPriority}`)
      return (a.sortPriority - b.sortPriority);
    }).reverse();
  }, [categoryTree])

  return (
    <div className="mr-4 hidden md:flex">
      <nav className="flex flex-row items-center gap-6 text-sm">
        {/*appConfig.nav.map((item) => {
          const isActive = item.checkExact ? item.link === pathname : pathname.startsWith(item.link);
          const className = item.className
            ? typeof item.className === "function"
              ? item.className(isActive)
              : item.className
            : cn(
              "transition-colors hover:text-foreground/80",
              isActive ? "text-foreground" : "text-foreground/60"
            );

          return (
            <Link key={item.link} href={item.link} className={className}>
              {item.title}
            </Link>
          );
        })*/}
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/store" legacyBehavior passHref>
                <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-inherit")}>
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            {sortedData.map((category) => {
              const hasChildren = Array.isArray(category.children) && category.children.length > 0;
              if (!hasChildren) {
                return (
                  <NavigationMenuItem key={category.id}>
                    <Link href={`/store/category/${category.slug}`} legacyBehavior passHref>
                      <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-inherit")}>
                        {category.name}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                )
              }
              return (
                <NavigationMenuItem key={category.id}>
                  <NavigationMenuTrigger className="bg-inherit">
                    {category.name}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] grid-cols-2 lg:w-[600px]">
                      {category.children.map((child) => (
                        <ListItem key={child.id} title={child.name} href={`/store/category/${category.slug}/${child.slug}`} imageUrl={child.bannerImage ? `/assets/categories/${child.id}/${child.bannerImage}` : null}>
                          {child.name}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </nav>
    </div>
  );
}
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & {
    imageUrl: string | null;
  }
>(({ className, title, children, imageUrl, ...props }, ref) => {
  if (imageUrl) {
    console.log(`Image URL: ${imageUrl}`)
  }
  return (
    <li className="rounded-lg bg-cover bg-center bg-no-repeat" style={{
      backgroundImage: `url(${imageUrl})`
    }}>
      <NavigationMenuLink asChild style={{
        backdropFilter: "blur(5px)",
      }}>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors",
            "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground font-extra">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"