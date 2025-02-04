"use client"

import { DeliveryEditor } from "@/app/(admin)/admin/products/[id]/edit-delivery"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle, CardHeader, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogTrigger } from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/trpc/react"

export const DeliverySettings = () => {
  const { data: deliveries, isLoading } = api.settings.getGlobalDeliveries.useQuery();
  const modifyGlobalDeliveries = api.settings.modifyGlobalDeliveries.useMutation();

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>
          <strong>Global</strong> Delivery Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        <CardDescription className="flex flex-col">
          <span>Configure commands that will execute for all orders.</span>
          <span>It is recommended to add a ban command to the <code>On Chargeback</code> (dispute) trigger.</span>
        </CardDescription>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full mt-auto">
              View & Edit Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[75vw]">
            <DialogHeader>
              <DialogTitle>
                Modify Global Delivery Settings
              </DialogTitle>
            </DialogHeader>
            {isLoading ? (
              <Spinner />
            ) : (
              <DeliveryEditor initialDeliveries={deliveries ?? []} onSubmit={async (deliveries) => {
                await modifyGlobalDeliveries.mutateAsync({ deliveries });
              }} isSubscriptionProduct={false} defaultStack={false} />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
