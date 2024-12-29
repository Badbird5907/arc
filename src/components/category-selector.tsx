"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Check, Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface CategorySelectorProps {
  selectedCategoryIds: string[];
  onSelectionChange: (categoryIds: string[]) => void;
}

export const CategorySelector = ({
  selectedCategoryIds,
  onSelectionChange,
}: CategorySelectorProps) => {
  const [search, setSearch] = useState("");
  const { data: categories, isLoading } = api.categories.getCategories.useQuery();

  const toggleCategory = (categoryId: string) => {
    if (selectedCategoryIds.includes(categoryId)) {
      onSelectionChange(selectedCategoryIds.filter(id => id !== categoryId));
    } else {
      onSelectionChange([...selectedCategoryIds, categoryId]);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
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
            {(categories ?? [])
              .filter(category => 
                category.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((category) => (
                <Button
                  key={category.id}
                  variant="ghost"
                  className={cn(
                    "justify-start gap-2",
                    selectedCategoryIds.includes(category.id) && "bg-secondary"
                  )}
                  onClick={() => toggleCategory(category.id)}
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      selectedCategoryIds.includes(category.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {category.name}
                  <span className="ml-auto text-muted-foreground hover:text-foreground">
                    <Link href={`/admin/category/${category.id}`} target="_blank">
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