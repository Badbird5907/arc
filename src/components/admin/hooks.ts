import { api } from "@/trpc/react"

export const useModifyProduct = () => {
  const utils = api.useUtils();
  return api.products.modifyProduct.useMutation({
    onSuccess: async () => utils.products.getProduct.invalidate()
  })
}