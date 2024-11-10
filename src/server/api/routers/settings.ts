import { createTRPCRouter, procedure } from "@/server/api/trpc";
import { setSetting } from "@/server/settings";
import { type SettingKey } from "@/types/settings";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

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
  })
})