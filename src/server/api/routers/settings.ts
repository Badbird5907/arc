import { createTRPCRouter, procedure } from "@/server/api/trpc";
import { deliveries } from "@/server/db/schema";
import { setSetting } from "@/server/settings";
import { Delivery, zodDelivery } from "@/types";
import { type SettingKey } from "@/types/settings";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { v4 as uuid } from "uuid";

export const settingsRouter = createTRPCRouter({
  modifySetting: procedure("settings:modify")
  .input(z.object({
    key: z.string(),
    value: z.any(),
  })).mutation(async ({ input }) => {
    try {
      await setSetting(input.key as SettingKey, input.value as never);
    } catch (e: unknown) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: (e instanceof Error ? e.message : "Unknown error")
      })
    }
  }),

  getGlobalDeliveries: procedure("settings:read")
  .query(async ({ ctx }) => {
    const deliveries = await ctx.db.query.deliveries.findMany({
      where: (d, { eq }) => eq(d.global, true),
    })
    return deliveries as Delivery[];
  }),

  modifyGlobalDeliveries: procedure("settings:modify")
  .input(z.object({
    deliveries: z.array(zodDelivery),
  })).mutation(async ({ input, ctx }) => {
    const newDeliveries = input.deliveries.map(d => ({
      ...d,
      id: d.id ?? uuid(),
      global: true,
    }));
    console.log(newDeliveries);
    await ctx.db.transaction(async (tx) => {
      await tx.delete(deliveries).where(eq(deliveries.global, true));
      if (newDeliveries.length > 0) {
        await tx.insert(deliveries).values(newDeliveries);
      }
    })
  })
})