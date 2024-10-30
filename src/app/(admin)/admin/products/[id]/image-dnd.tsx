import { type Product } from "@/types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { CSS } from '@dnd-kit/utilities';
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useModifyProduct } from "@/components/admin/hooks";


export const ImageDndList = ({ product }: { product: Product }) => {
  const [images, setImages] = useState<string[]>(product.images);
  const [isDirty, setIsDirty] = useState(false);
  const [isPending, startTransition] = useTransition();
  const modifyProduct = useModifyProduct();
  useEffect(() => {
    if (isDirty) return;
    setImages(product.images);
  }, [product.images, isDirty]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setIsDirty(true);
      setImages((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={images} strategy={verticalListSortingStrategy}>
          {images.map((image, index) => (
            <SortableItem key={index} image={image} product={product} />
          ))}
        </SortableContext>
      </DndContext>
      <Button
        className="w-full mt-4"
        loading={isPending}
        onClick={async () => {
          startTransition(async () => {
            await modifyProduct.mutateAsync({
              id: product.id,
              data: {
                images
              }
            }).then(() => {
              setIsDirty(false);
              toast.success("Product Updated", {
                description: "Successfully saved image order!",
              });
            }).catch((e) => {
              console.error(e);
              toast.error("Error", {
                description: (e as { message?: string })?.message ?? "An unknown error occurred! Please try again later.",
              });
            });
          })
        }}
        disabled={!isDirty}
      >
        Save Order
      </Button>
    </div>
  )
}

function SortableItem(props: { image: string; product: Product }) {
  const { image, product } = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.image });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="border-2 border-dotted m-2 p-4 rounded-lg">
      <Image
        id={image}
        src={`/assets/products/${product.id}/${image}`}
        width={40}
        height={40}
        alt={`Image`}
        className="justify-self-center"
      />
    </div>
  );
}