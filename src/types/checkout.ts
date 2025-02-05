import { z } from "zod";

export const infoSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
});
export const checkoutSchema = z.object({
  username: z.string(),
  info: infoSchema,
  cart: z.array(z.object({
    id: z.string(),
    quantity: z.number().min(1)
  })),
  coupons: z.array(z.string()).optional()
});
export type Checkout = z.infer<typeof checkoutSchema>;
