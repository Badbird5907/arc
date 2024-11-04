"use client";
import { cn } from "@/lib/utils";
import { Product } from "@/types";
import Image from "next/image";
import { Suspense } from "react";
import { Carousel } from "react-responsive-carousel";

export const ProductImages = (({ product, productCard }: { product: Product; productCard: boolean }) => {
  if (product.images?.length === 1) {
    return (
      <div className="relative group">
        <Image
          src={`/assets/products/${product.id}/${product.images[0]}`}
          width={400}
          height={400}
          alt="Product Image"
          className="rounded-lg"
        />
      </div>
    )
  }
  return (
    <Carousel showThumbs={false} autoPlay infiniteLoop
      // these are the default buttons, but with stopPropagation added to prevent the dialog from opening
      renderArrowPrev={(clickHandler: () => void, hasPrev: boolean, label: string) => {
        return (
          <button type="button" aria-label={label} className={cn(
            productCard && "hidden",
            productCard && hasPrev && "group-hover:block",
            "control-arrow control-prev",
            // "absolute z-10 top-[20px] bg-none border-0 cursor-pointer text-white text-2xl hover:bg-primary/10 hover:text-primary rounded-full p-2",
          )} onClick={(e) => {
            e.stopPropagation();
            clickHandler();
          }} />
        )
      }}
      renderArrowNext={(clickHandler: () => void, hasNext: boolean, label: string) => {
        return (
          <button type="button" aria-label={label} className={cn(
            productCard && "hidden",
            productCard && hasNext && "group-hover:block",
            "control-arrow control-next",
          )} onClick={(e) => {
            e.stopPropagation();
            clickHandler();
          }} />
        )
      }}
      showStatus={false}
    >
      {product.images.map((image, i) => (
        <div key={i} className="relative group">
          <Image
            src={`/assets/products/${product.id}/${image}`}
            width={400}
            height={400}
            alt={`Image ${i + 1}`}
            className={productCard ? "rounded-t-lg" : "rounded-lg"}
          />
        </div>
      ))}
    </Carousel>
  )
})