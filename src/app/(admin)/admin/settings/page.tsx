import { SettingsCard } from "@/app/(admin)/admin/settings/settings-card";
import { getAllSettings } from "@/server/settings";
import { DeliverySettings } from "@/app/(admin)/admin/servers/delivery-settings";
import { api } from "@/trpc/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings"
}
export default async function SettingsPage() {
  const settings = await getAllSettings();
  await api.settings.getGlobalDeliveries.prefetch();
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Settings</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        <DeliverySettings />
        {Object.values(settings).filter((setting) => !setting.hidden).map((setting) => (
          <SettingsCard key={setting.key} setting={setting} />
        ))}
      </div>
    </div>
  )
}