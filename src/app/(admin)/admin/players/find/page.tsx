import { adminWrapper } from "@/app/(admin)/admin/admin-panel";
import { PlayerFindClient } from "@/app/(admin)/admin/players/find/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default adminWrapper(async ({ }) => {
  return (
    <main className="w-full h-full min-h-[85vh] flex items-center justify-center">
      <div className="w-full flex justify-center">
        <Card className="w-full md:w-1/2">
          <CardHeader>
            <CardTitle>Player Lookup</CardTitle>
          </CardHeader>
          <CardContent>
            <PlayerFindClient />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}, "admin:players:view")