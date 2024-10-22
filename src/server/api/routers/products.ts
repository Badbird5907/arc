import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const productRouter = createTRPCRouter({
  getProducts: protectedProcedure.meta({ permissions: ["sad:noperms"] })
  .query(() => {
    return ["hello"];
  })
})