import { adminWrapper } from "@/app/(admin)/admin-panel";
import { Test } from "@/app/(admin)/admin/products/test";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";

const Page = adminWrapper(async ({ user }) => {
  return (
    <>
    <Test />
    </>
  );
}, "admin:products:view")
export default Page;