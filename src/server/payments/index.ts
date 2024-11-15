import { TebexPaymentProvider } from "@/server/payments/impl/tebex";
import { type Checkout } from "@/types/checkout";
import { TRPCError } from "@trpc/server";

export const getAvailablePaymentProviders = async (_checkoutData: Checkout) => {
  return ["tebex"]
}

export const checkout = async (checkoutData: Checkout, provider: string) => {
  const providerImpl = getPaymentProvider(provider);
  if (!providerImpl) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Provider not found!"
    })
  }
  return providerImpl.beginCheckout(checkoutData);
}

const getPaymentProvider = (provider: string) => {
  switch (provider) {
    case "tebex":
      return new TebexPaymentProvider();
    default:
      return null;
  }
}