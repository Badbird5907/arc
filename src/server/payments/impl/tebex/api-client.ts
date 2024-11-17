import { env } from "@/env";
import build from "next/dist/build";

export type TebexBasket = {
  first_name: string;
  last_name: string;
  email: string;
  return_url: string;
  complete_url: string;
  custom?: unknown;
}
export type TebexPackage = {
  name: string;
  price: number;
  type: "single" | "subscription";
  qty: number;
  expiry_period: "day" | "month" | "year";
  expiry_length: number;
  custom: unknown;
}
export type TebexSale = {
  name: string;
  discount_type: "percentage" | "amount";
  amount: number; // amount or percentage
}
type TebexPriceDetails = {
  fullPrice: number;
  subTotal: number;
  discounts: never[];
  total: number;
  surcharges: never[];
  tax: number;
  balance: number;
  sales: never[];
  giftcards: never[];
  roundUp: null;
};

type TebexAddress = {
  name: string;
  first_name: string;
  last_name: string;
  address: string;
  email: string;
  state_id: null;
  country: string;
  postal_code: string;
};

type TebexLimits = {
  user: {
      enabled: boolean;
      timestamp: number;
      limit: boolean;
  };
  global: {
      enabled: boolean;
      timestamp: number;
      limit: boolean;
  };
  packageExpiryTime: number;
};

type TebexRowMeta = {
  name: string;
  rowprice: number;
  initialprice: number;
  isCumulative: boolean;
  requiredPackages: never[];
  requiresAny: boolean;
  category: boolean;
  producesGiftCard: boolean;
  allowsGiftCards: boolean;
  servers: never[];
  limits: TebexLimits;
  hasDeliverables: boolean;
  deliverableTypes: never[];
  downloadLink: string;
  hasSellerProtection: boolean;
  itemType: null;
  revenue_share: never[];
  image: null;
  realprice: number;
};

type TebexRow = {
  id: number;
  basket: number;
  package: null;
  override: number;
  quantity: number;
  server: null;
  price: number;
  gift_username_id: null;
  options: null;
  recurring: boolean;
  recurring_period: null;
  recurring_next_payment_date: null;
  meta: TebexRowMeta;
  custom: null;
  image_url: null;
  recurring_price: null;
};

type TebexLinks = {
  payment: string | undefined;
  checkout: string | undefined;
};

type TebexCheckoutSession = {
  ident: string;
  expire: string;
  price: number;
  priceDetails: TebexPriceDetails;
  isPaymentMethodUpdate: boolean;
  returnUrl: null;
  complete: boolean;
  tax: number;
  username: null;
  discounts: never[];
  coupons: never[];
  giftcards: never[];
  address: TebexAddress;
  rows: TebexRow[];
  fingerprint: string;
  creator_code: string;
  roundup: boolean;
  cancel_url: string;
  complete_url: null;
  complete_auto_redirect: boolean;
  custom: Record<string, string | number>;
  links: TebexLinks;
};

let headers: Headers;
const buildHeaders = () => {
  if (headers) return headers;
  headers = new Headers();
  headers.append('Authorization', 'Basic ' + btoa(
    env.TEBEX_PROJECT_ID + ':' + env.TEBEX_PRIVATE_KEY
  ));
  headers.append('Content-Type', 'application/json');
  return headers;
}

export const createCheckoutSession = async (basket: TebexBasket, packages: TebexPackage[], sale?: TebexSale) => {
  const url = "https://checkout.tebex.io/api/checkout";
  const body = {
    basket,
    items: [
      ...packages.map(p => (
        {
          package: p
        }
      ))
    ],
    sale,
  };
  const response = await fetch(url, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });
  const json = await response.json() as TebexCheckoutSession;
  return json;
}
