import { SelectProduct } from "@/components/select-product";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { type Delivery, type Product } from "@/types";
import { CopyIcon } from "lucide-react";
import { useState } from "react";

export const CopyDelivery = ({ setDelivery }: { setDelivery: (delivery: Delivery[]) => void }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <CopyIcon className="w-4 h-4" />
          Copy from
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Copy from
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <span>Copy a delivery from another product.</span>
        </DialogDescription>
        <SelectProduct onSelect={(product) => {
          setSelectedProduct(product);
        }} />
        <DialogClose asChild>
          <Button type="button" onClick={() => {
            if (selectedProduct) {
              setDelivery(selectedProduct.delivery ?? []);
            }
          }} disabled={!selectedProduct}>Copy</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}