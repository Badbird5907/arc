import { Category } from "@/types";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const CategoryCard = ({ category }: { category: Category }) => {
  return (
    <div
      className="w-full max-w-[400px] overflow-hidden"
    >
      <Link
        href={`/store/category/${category.slug}`}
        className="group relative block aspect-square overflow-hidden rounded-lg"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
        <Image
          src={`/assets/categories/${category.id}/${category.cardImage}`}
          alt={category.name}
          fill
          className="object-cover transform group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
          <div className="flex w-full items-center justify-between">
            <h2 className="text-xl font-bold uppercase tracking-wider text-white">
              {category.name}
            </h2>
            <ArrowRight className="h-5 w-5 transform text-white opacity-75 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
          </div>
        </div>
      </Link>
    </div>
  )
}