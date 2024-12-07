import { SettingsCard } from "@/app/(admin)/admin/settings/settings-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon } from "lucide-react";
import { getAllSettings } from "@/server/settings";

export default async function SettingsPage() {
  const settings = await getAllSettings();
  console.log(settings);
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Settings</h1>
      <div className="grid grid-flow-row md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>
              Chargeback Commands
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button>
              <PlusIcon className="h-4 w-4" />
              Add Command
            </Button>
          </CardContent>
        </Card>
        {Object.values(settings).map((setting) => (
          <SettingsCard key={setting.key} setting={setting} />
        ))}
      </div>
    </div>
  )
}