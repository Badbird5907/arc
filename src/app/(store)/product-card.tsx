
import { ProductImages } from "@/app/(store)/store/category/[...slug]/images";
import { ProductMarkdown } from "@/app/(store)/store/category/[...slug]/markdown";
import { AddToCartButton } from "@/components/cart/add";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { type Product } from "@/types";
import { formatExpiryPeriod } from "@badbird5907/mc-utils";
import { ShoppingCart } from "lucide-react";

import "react-responsive-carousel/lib/styles/carousel.min.css";

export const ProductCard = ({ product }: { product: Product }) => {
  return (
    <Dialog>
      <DialogTrigger asChild className="hover:cursor-pointer">
        <div
          className="w-full max-w-[400px] overflow-hidden border rounded-lg group"
        >
          <ProductImages product={product} productCard />
          <div className="p-4 bg-background rounded-b-lg transition-all duration-300">
            <div className="flex flex-row justify-between">
              <div className="flex flex-col">
                <h2 className="text-xl font-bold">{product.name}</h2>
                <span className="text-primary font-bold">${product.price}</span>
              </div>
              <Button className="place-self-center">
                <ShoppingCart />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="w-fit md:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>
            {product.name}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col md:flex-row gap-8 w-full">
          {product.images && product.images.length > 0 && (
            <div className="group rounded-lg w-full h-full basis-full lg:basis-4/6 place-items-center">
              <ProductImages product={product} productCard={false} />
            </div>
          )}
          <div className="flex flex-col w-full h-full prose dark:prose-invert">
            <div className="py-4 md:py-0">
              <ProductMarkdown product={product} />
            </div>
            <div className="mt-auto flex flex-row items-end">
              <p className="text-primary font-bold text-xl">${product.price}</p>
              {product.type === "subscription" && (
                <p className="text-accent-foreground/40 font-bold text-sm self-end ml-1">/{formatExpiryPeriod(product.expiryPeriod, product.expiryLength)}</p>
              )}
            </div>
          </div>
        </div>
        <AddToCartButton product={product} className="w-full mt-auto" />
      </DialogContent>
    </Dialog>
  )
}
