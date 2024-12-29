"use client";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { api } from "@/trpc/react";
import { Filter } from "lucide-react"
import { ProductSelector } from "@/components/product-selector";
import { CategorySelector } from "@/components/category-selector";
import { useState, useMemo } from "react";
import { toast } from "sonner";

export const EditCouponFilters = ({ couponId }: { couponId: string }) => {
  const { data, isLoading } = api.coupons.getProductAndCategoryFilters.useQuery({ couponId });
  const utils = api.useUtils();

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  const updateProductsMutation = api.coupons.updateProductFilters.useMutation({
    onSuccess: () => {
      utils.coupons.getProductAndCategoryFilters.invalidate({ couponId });
      setIsDirty(false);
      toast.success("Filters updated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to update filters", {
        description: error.message
      });
    }
  });

  const updateCategoriesMutation = api.coupons.updateCategoryFilters.useMutation({
    onSuccess: () => {
      utils.coupons.getProductAndCategoryFilters.invalidate({ couponId });
      setIsDirty(false);
      toast.success("Filters updated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to update filters", {
        description: error.message
      });
    }
  });

  const productFilters = useMemo(() => {
    return data?.productFilters.map(p => p.productId) ?? [];
  }, [data]);

  const categoryFilters = useMemo(() => {
    return data?.categoryFilters.map(c => c.categoryId) ?? [];
  }, [data]);

  // update local state when data changes
  useMemo(() => {
    setSelectedProducts(productFilters);
    setSelectedCategories(categoryFilters);
  }, [productFilters, categoryFilters]);

  const handleProductsChange = (productIds: string[]) => {
    setSelectedProducts(productIds);
    setIsDirty(true);
  };

  const handleCategoriesChange = (categoryIds: string[]) => {
    setSelectedCategories(categoryIds);
    setIsDirty(true);
  };

  const handleSave = () => {
    // Save both product and category filters
    Promise.all([
      updateProductsMutation.mutate({
        couponId,
        productIds: selectedProducts,
      }),
      updateCategoriesMutation.mutate({
        couponId,
        categoryIds: selectedCategories,
      })
    ]);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Filter />
          <span>Edit Filters</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Filters</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          If filters are not set, all products will be eligible for this coupon.
          <br />
          If products or categories are selected, only products that match the selected filters will be eligible for this coupon.
        </DialogDescription>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductSelector
                selectedProductIds={selectedProducts}
                onSelectionChange={handleProductsChange}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <CategorySelector
                selectedCategoryIds={selectedCategories}
                onSelectionChange={handleCategoriesChange}
              />
            </CardContent>
          </Card>
        </div>

        <Button
          onClick={handleSave}
          className="w-full"
          disabled={!isDirty}
          loading={updateProductsMutation.isPending || updateCategoriesMutation.isPending}
        >
          Save Changes
        </Button>
      </DialogContent>
    </Dialog>
  )
}