import { orderStatus } from "@/server/db/schema";
import { z } from "zod";

export const ordersFilter = z.object({
  playerUuid: z.string().optional(),
  email: z.string().optional(),
  name: z.string().optional(),
  status: z.enum([...orderStatus, "all"]).optional(),
  coupons: z.string().array().optional(),
});