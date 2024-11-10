import { SettingsCard } from "@/app/(admin)/admin/settings/settings-card";
import { getAllSettings } from "@/server/settings";

export default async function SettingsPage() {
  const settings = await getAllSettings();
  console.log(settings);
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Settings</h1>
      <div className="grid grid-flow-row md:grid-cols-4 gap-4">
        {Object.values(settings).map((setting) => (
          <SettingsCard key={setting.key} setting={setting} />
        ))}
      </div>
    </div>
  )
}