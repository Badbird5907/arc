"use client";

import { appConfig } from "@/app/app-config";
import { useCart } from "@/components/cart";
import { CartPopoverContent } from "@/components/header/cart/popover";
import { StoreLoginDialog } from "@/components/header/store/login";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTitle, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { PlayerSkinImage } from "@/components/player-skin";
import { api } from "@/trpc/react";

export function MobileNav({ store }: { store?: boolean }) {
  const player = useCart((state) => state.player);
  const [open, setOpen] = React.useState(false);

  const { data: categoryTree } = api.categories.getCategoryTree.useQuery({}, {
    enabled: !!store
  });

  const sortedData = React.useMemo(() => {
    if (!Array.isArray(categoryTree)) return [];
    // check sortPriority first, then name. Higher sortPriority comes first
    return categoryTree.filter((category) => category.featured)
      .sort((a, b) => {
        console.log(`Sorting: ${a.name} vs ${b.name}`)
        if (a.sortPriority === b.sortPriority) {
          console.log(` -> locale: ${a.name.localeCompare(b.name)}`)
          return a.name.localeCompare(b.name);
        }
        console.log(` -> sortPriority: ${a.sortPriority - b.sortPriority}`)
        return (a.sortPriority - b.sortPriority);
      }).reverse();
  }, [categoryTree])


  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
            <svg
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5">
              <path
                d="M3 5H11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"></path>
              <path
                d="M3 12H16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"></path>
              <path
                d="M3 19H21"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"></path>
            </svg>
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pr-0 pl-0">
          <SheetHeader>
            <SheetTitle>
              <MobileLink href="/" className="flex items-center justify-center" onOpenChange={setOpen}>
                <span className="font-bold">{appConfig.title}</span>
              </MobileLink>
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
            {store ? (
              <div className="flex flex-col space-y-3">
                <div className="flex flex-row flex-wrap gap-4 justify-center">
                  {appConfig.nav?.map((item) => (
                    <MobileLink key={item.link} href={item.link} onOpenChange={setOpen} className="flex flex-col items-center gap-2">
                      {item.icon && <item.icon size={24} />}
                      {item.title}
                    </MobileLink>
                  ))}
                </div>
                {sortedData.map((category) => {
                  return (
                    <div key={category.id} className="flex flex-col items-center justify-center h-24 bg-cover bg-center rounded-md mx-2" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(/assets/categories/${category.id}/${category.bannerImage})` }}>
                      <p className="text-white">{category.name}</p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                {appConfig.nav?.map(
                  (item) =>
                    item.link && (
                      <MobileLink key={item.link} href={item.link} onOpenChange={setOpen}>
                        {item.title}
                      </MobileLink>
                    )
                )}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
      {store && (
        <div className="flex flex-row ml-auto md:hidden">
          {!!player ? (
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex flex-row items-center gap-2">
                  <PlayerSkinImage
                    name={player.name}
                    renderConfig={{
                      name: "pixel",
                      crop: "face"
                    }}
                    height={40}
                    width={40}
                    className="rounded-md"
                  />
                  <div className="flex flex-col">
                    <p>{player.name}</p>
                    <p className="text-xs flex items-center gap-1">
                      <ShoppingCart size={16} />
                      Cart
                    </p>
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent>
                <CartPopoverContent />
              </PopoverContent>
            </Popover>
          ) : (
            <StoreLoginDialog />
          )}
        </div>
      )}
    </>
  );
}

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  href: string;
}

function MobileLink({ href, onOpenChange, className, children, ...props }: MobileLinkProps) {
  const router = useRouter();
  return (
    <Link
      href={href}
      onClick={() => {
        router.push(href.toString());
        onOpenChange?.(false);
      }}
      className={cn(className)}
      {...props}>
      {children}
    </Link>
  );
}