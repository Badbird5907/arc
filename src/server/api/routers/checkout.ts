import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { verifyCaptcha } from "@/server/helpers/captcha";
import { checkout, getAvailablePaymentProviders } from "@/server/payments";
import { checkoutSchema } from "@/types/checkout";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const checkoutRouter = createTRPCRouter({
  getAvailablePaymentProviders: publicProcedure
    .input(checkoutSchema)
    .query(async ({ input }) => {
      return getAvailablePaymentProviders(input);
    }),
  checkout: publicProcedure
    .input(z.object({
      data: checkoutSchema,
      captcha: z.string(),
      provider: z.string()
    }))
    .meta({ rateLimit: "checkoutBegin" })
    .mutation(async ({ input, ctx }) => {
      if (!await verifyCaptcha(input.captcha, ctx.sourceIp)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid captcha!"
        })
      }
      const providers = await getAvailablePaymentProviders(input.data);
      if (providers.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No payment providers available!"
        })
      }
      if (!providers.find(p => p === input.provider)) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Provider not found or not available for this order!"
        })
      }

      return checkout(input.data, input.provider);
    })
})