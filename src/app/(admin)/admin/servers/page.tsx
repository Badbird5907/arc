import { adminWrapper } from "@/app/(admin)/admin/admin-panel";
import { ServersClient } from "@/app/(admin)/admin/servers/client";
import { api } from "@/trpc/server";

const Page = adminWrapper(async ({ user }) => {
  await api.servers.getServers.prefetch();
  return <ServersClient />;
}, "admin:servers:view");
export default Page;
