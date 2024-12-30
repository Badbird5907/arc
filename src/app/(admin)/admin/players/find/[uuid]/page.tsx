import { adminWrapper } from "@/app/(admin)/admin/admin-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/server/db";
import { orders, players } from "@/server/db/schema";
import { getPublicSettings } from "@/server/settings";
import { getPlayerFromUuid } from "@/utils/server/helpers";
import { isValidUuid } from "@badbird5907/mc-utils";
import { and, count, eq } from "drizzle-orm";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { MiniOrdersList } from "@/components/admin/orders/mini";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink, Gavel } from "lucide-react";
import { PlayerActions } from "@/app/(admin)/admin/players/find/[uuid]/actions";
import { api, HydrateClient } from "@/trpc/server";
import { PlayerSkinImage } from "@/components/player-skin";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Player"
}
export default adminWrapper(async ({ params }: { params: Promise<{ uuid: string }> }) => {
  const { uuid } = await params;
  if (!isValidUuid(uuid)) return notFound();
  const [data, banned, settings, [total], [completed], [canceled], [refunded], [pending]] = await Promise.all([
    getPlayerFromUuid(uuid),
    db.select().from(players).where(eq(players.uuid, uuid)).then(result => result[0]?.banned ?? false),
    getPublicSettings(),
    db.select({ total: count(orders.id) })
      .from(orders)
      .where(eq(orders.playerUuid, uuid)),
    db.select({ completed: count(orders.id) })
      .from(orders)
      .where(and(eq(orders.playerUuid, uuid), eq(orders.status, "completed"))),
    db.select({ canceled: count(orders.id) })
      .from(orders)
      .where(and(eq(orders.playerUuid, uuid), eq(orders.status, "canceled"))),
    db.select({ refunded: count(orders.id) })
      .from(orders)
      .where(and(eq(orders.playerUuid, uuid), eq(orders.status, "refunded"))),
    db.select({ pending: count(orders.id) })
      .from(orders)
      .where(and(eq(orders.playerUuid, uuid), eq(orders.status, "pending"))),
    api.players.getPlayerDetails.prefetch({ uuid })
  ]);
  if (data.notFound || !data?.data) return notFound();
  const player = data.data;
  const tableData = [
    { label: "Name", value: player.name },
    { label: "UUID", value: player.uuid },
    { label: "Status", value: banned ? <Badge variant="destructive">Banned</Badge> : <Badge variant="success">Active</Badge> },
    { label: "Edition", value: player.bedrock ? "Bedrock" : "Java" },
    {
      label: "Orders", value: (
        <div className="flex flex-row gap-2">
          {total?.total && total?.total > 0 ? (
            <Badge variant="outline">
              Total: {total?.total}
            </Badge>
          ) : null}
          {completed?.completed && completed?.completed > 0 ? (
            <Badge variant="outline">
              Completed: {completed?.completed}
            </Badge>
          ) : null}
          {canceled?.canceled && canceled?.canceled > 0 ? (
            <Badge variant="outline">
              Canceled: {canceled?.canceled}
            </Badge>
          ) : null}
          {refunded?.refunded && refunded?.refunded > 0 ? (
            <Badge variant="outline">
              Refunded: {refunded?.refunded}
            </Badge>
          ) : null}
          {pending?.pending && pending?.pending > 0 ? (
            <Badge variant="outline">
              Pending: {pending?.pending}
            </Badge>
          ) : null}
        </div>
      )
    },
  ]
  return (
    <HydrateClient>
      <div className="flex flex-col gap-4">
        <div className="flex gap-4 pt-4">
          <PlayerSkinImage name={player.name} renderConfig={{
            name: "pixel",
            crop: "face"
          }} height={32} width={32} />
          <h1 className="text-2xl font-bold">{player.name}</h1>
          {settings.enableBedrock && (
            <Badge variant="outline" className="flex flex-row gap-2">
              <Image src={player.bedrock ? "/img/bedrock_block.webp" : "/img/grass_block.webp"} width={16} height={16} alt={player.bedrock ? "Bedrock" : "Java"} />
              {player.bedrock ? "Bedrock" : "Java"}
            </Badge>
          )}
          {banned && (
            <Badge variant="destructive" className="flex flex-row gap-2">
              Banned
            </Badge>
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="flex flex-col gap-4 w-full">
            <Card className="w-full h-fit">
              <CardHeader>
                <CardTitle>
                  General Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-row gap-4">
                  <PlayerSkinImage name={player.name} renderConfig={{
                    name: "ultimate", 
                    crop: "bust"
                  }} className="object-scale-down scale-110" />
                  <Table>
                    <TableBody>
                      {tableData.map((row) => (
                        <TableRow key={row.label}>
                          <TableCell className="text-primary-foreground/60">
                            <span className="flex flex-row gap-2">
                              {row.label}
                            </span>
                          </TableCell>
                          <TableCell>{row.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="w-full flex flex-col justify-between gap-2">
                  <span className="block md:hidden">Orders</span>
                  <div className="flex flex-row gap-2 justify-between">
                    <span className="hidden md:block content-center">
                      Orders
                    </span>
                    <div className="flex flex-col md:flex-row gap-2 w-full md:w-fit">
                      <Link href={`/admin/orders?playerUuid=${player.uuid}`} className="w-full md:w-fit">
                        <Button variant="outline" className="w-full md:w-fit">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MiniOrdersList filter={{ playerUuid: player.uuid }} />
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-col gap-4 w-full md:w-1/2">
            <PlayerActions uuid={uuid} />
          </div>
        </div>
      </div>
    </HydrateClient>
  )
}, "admin:players:view")