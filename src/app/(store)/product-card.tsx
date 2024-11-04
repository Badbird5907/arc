import { MDXRemote } from "next-mdx-remote/rsc";
import { ProductImages } from "@/app/(store)/store/category/[...slug]/images";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { type Product } from "@/types";
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
      <DialogContent className="w-2/3 max-w-2/3">
        <DialogHeader>
          <DialogTitle>
            {product.name}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-row gap-4 w-full">
          <div className="group rounded-lg w-1/2">
            <ProductImages product={product} productCard={false} />
          </div>
          <div className="flex flex-col gap-4 w-full">
            <MDXRemote source={product.description ?? ""} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}