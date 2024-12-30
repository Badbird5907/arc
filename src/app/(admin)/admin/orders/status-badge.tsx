import { Badge } from "@/components/ui/badge";
import { type orderStatus } from "@/server/db/schema";

export const StatusBadge = ({ status }: { status: (typeof orderStatus)[number] }) => {
  return (
    <Badge variant={status === "completed" ? "success" : status === "canceled" ? "destructive" : "warning"} className="h-fit">
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}