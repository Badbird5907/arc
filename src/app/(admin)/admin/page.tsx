import { adminWrapper } from "@/app/(admin)/admin/admin-panel";

const Page = adminWrapper(async ({ user }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold">Admin Panel</h1>
      <p>Welcome, {user.displayName}!</p>
    </div>
  );
})
export default Page;