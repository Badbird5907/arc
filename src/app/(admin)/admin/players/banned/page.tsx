import { adminWrapper } from "@/app/(admin)/admin/admin-panel";
import { BannedPlayersClient } from "@/app/(admin)/admin/players/banned/client";

export default adminWrapper(async ({ user }) => {
  return (
    <BannedPlayersClient />
  )
}, "admin:players:view")