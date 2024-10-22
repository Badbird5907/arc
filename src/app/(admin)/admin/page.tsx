import { adminWrapper } from "@/app/(admin)/admin-panel";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";

const Page = adminWrapper(async ({ user }) => {
  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-3xl font-bold">Admin Panel</h1>
      <p>Welcome, {user.displayName}!</p>
    </div>
  );
})
export default Page;