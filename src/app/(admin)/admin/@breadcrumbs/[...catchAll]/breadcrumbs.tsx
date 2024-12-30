import React, {ReactElement} from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { adminSidebarItems } from "@/components/admin/sidebar";

export function Breadcrumbs({routes = []}: {routes: string[]}) {
  let fullHref: string | undefined = undefined;
  const breadcrumbItems: ReactElement[] = [];
  let breadcrumbPage: ReactElement = <></>;

  if (routes[0] === "admin") {
    routes = routes.slice(1);
  }

  for(let i = 0; i < routes.length; i++) {
    const route = routes[i];
    // find parent first
    const parentItem = adminSidebarItems.find(item => item.url === `/${route}`);
    
    // no parent found and we have a previous route, check for children
    const previousRoute = i > 0 ? routes[i - 1] : null;
    const parentWithChild = previousRoute ? 
      adminSidebarItems.find(item => 
        item.url === `/${previousRoute}` && 
        item.children?.some(child => child.url === `/${route}`)
      ) : null;
    
    // get the actual item (either parent or child)
    const sidebarItem = parentItem || 
      (parentWithChild?.children?.find(child => child.url === `/${route}`));

    const href: string = fullHref ? `${fullHref}/${route}` : `/admin/${route}`;
    fullHref = href;

    if (i === routes.length-1) {
      breadcrumbPage = (
        <BreadcrumbItem>
          <BreadcrumbPage>{sidebarItem?.title ?? route}</BreadcrumbPage>
        </BreadcrumbItem>
      )
    } else {
      breadcrumbItems.push(
        <React.Fragment key={href}>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {sidebarItem && "accessible" in sidebarItem && sidebarItem.accessible === false ? (
              <span className="text-muted-foreground">{sidebarItem.title ?? route}</span>
            ) : (
              <BreadcrumbLink href={href}>{sidebarItem?.title ?? route}</BreadcrumbLink>
            )}
          </BreadcrumbItem>
        </React.Fragment>
      )
    }
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbItems}
        <BreadcrumbSeparator />
        {breadcrumbPage}
      </BreadcrumbList>
    </Breadcrumb>
  )
}