"use client";

import { api } from "@/trpc/react";

export const Test = () => {
  const products = api.products.getProducts.useQuery();
  return (
    <div>
      <pre>
        {JSON.stringify(products.data, null, 2)}
      </pre>
    </div>
  );
}