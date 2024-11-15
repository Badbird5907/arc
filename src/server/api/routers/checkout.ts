import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
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
      provider: z.string()
    }))
    .mutation(async ({ input }) => {
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