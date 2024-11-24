import { TebexPackage } from "@/server/payments/impl/tebex/api-client";

export const expiryPeriodToDays = (period: TebexPackage["expiry_period"], length: number) => {
  switch (period) {
    case "day": return length;
    case "month": return length * 30;
    case "year": return length * 365;
  }
  return 0;
}
export const formatExpiryPeriod = (period: TebexPackage["expiry_period"], length: number) => {
  if (length === 1) {
    return period;
  }
  return `${length} ${period}s`;
}
