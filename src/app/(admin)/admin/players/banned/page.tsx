import { adminWrapper } from "@/app/(admin)/admin/admin-panel";
import { BannedPlayersClient } from "@/app/(admin)/admin/players/banned/client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Banned Players"
}
export default adminWrapper(async ({ user }) => {
  return (
    <BannedPlayersClient />
  )
}, "admin:players:view")