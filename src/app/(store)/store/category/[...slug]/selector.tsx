"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type Category, type CategoryWithChildren } from "@/types";
import Link from "next/link";

export const SubCategorySelector = ({ base, current }: { base: CategoryWithChildren; current: Category }) => {
  return (
    <div className="w-2/3 mx-auto">
      <div className="w-fit px-4 py-4 border rounded-2xl translate-y-[-30px] bg-background mx-auto">
        <div className="flex flex-wrap justify-center gap-2">
          {[base, ...(base.children ? base.children : [])].map((category) => {
            const isBase = category.id === base.id;
            const href = isBase ? `/store/category/${category.slug}` : `/store/category/${base.slug}/${category.slug}`;
            return (
              <Link
                key={category.id}
                href={href} 
                prefetch={false} // prefetch on hover
              >
                <Button
                  key={category.id}
                  variant="ghost"
                  className={cn(
                    "rounded-full border hover:bg-primary/10 hover:text-primary",
                    current.id === category.id && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  )}
                >
                  {category.name}
                </Button>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}