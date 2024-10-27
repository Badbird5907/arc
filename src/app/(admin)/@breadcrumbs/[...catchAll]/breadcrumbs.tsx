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
    const sidebarItem = adminSidebarItems.find(item => item.url === `/${route}`);
    const href: string = fullHref ? `/admin/${fullHref}/${route}` : `/admin/${route}`;
    fullHref = href

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
            <BreadcrumbLink href={href}>{sidebarItem?.title ?? route}</BreadcrumbLink>
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