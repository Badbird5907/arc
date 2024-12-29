"use client";

import { useState } from "react";
import { Check, Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ProductSelectorProps {
  selectedProductIds: string[];
  onSelectionChange: (productIds: string[]) => void;
}

export const ProductSelector = ({
  selectedProductIds,
  onSelectionChange,
}: ProductSelectorProps) => {
  const [search, setSearch] = useState("");
  
  const { data: products, isLoading } = api.products.getProducts.useQuery({
    search,
  });

  const toggleProduct = (productId: string) => {
    if (selectedProductIds.includes(productId)) {
      onSelectionChange(selectedProductIds.filter(id => id !== productId));
    } else {
      onSelectionChange([...selectedProductIds, productId]);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>
      
      <ScrollArea className="h-[300px]">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="flex flex-col gap-1">
            {products?.map((product) => (
              <Button
                key={product.id}
                variant="ghost"
                className={cn(
                  "justify-start gap-2",
                  selectedProductIds.includes(product.id) && "bg-secondary"
                )}
                onClick={() => toggleProduct(product.id)}
              >
                <Check
                  className={cn(
                    "h-4 w-4",
                    selectedProductIds.includes(product.id) ? "opacity-100" : "opacity-0"
                  )}
                />
                {product.name}
                <span className="ml-auto text-muted-foreground hover:text-foreground">
                  <Link href={`/admin/products/${product.id}`} target="_blank">
                    <Eye />
                  </Link>
                </span>
              </Button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}; 