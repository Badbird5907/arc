"use client";

import { appConfig } from "@/app/app-config";
import { useCart } from "@/components/cart";
import { CartPopoverContent } from "@/components/header/cart/popover";
import { StoreLoginDialog } from "@/components/header/store/login";
import { PlayerSkinImage } from "@/components/player-skin";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

export function MainNav({ admin, store }: { admin?: boolean; store?: boolean }) {
  const pathname = usePathname();

  const player = useCart((state) => state.player);

  return (
    <div className="mr-4 hidden md:flex w-full">
      {admin && (
        <SidebarTrigger />
      )}
      <Link href="/" className="mr-6 flex items-center space-x-3">
        {appConfig.logo && (
          <Image src={appConfig.logo} width={32} height={32} alt={appConfig.title} className="self-center" />
        )}
        <span className="hidden font-bold sm:inline-block">{appConfig.title}</span>
      </Link>
      <nav className="flex items-center gap-6 text-sm">
        {appConfig.nav.map((item) => {
          const isActive = item.checkExact ? item.link === pathname : pathname.startsWith(item.link);
          const className = item.className
            ? typeof item.className === "function"
              ? item.className(isActive)
              : item.className
            : cn(
              "transition-colors hover:text-foreground/80",
              isActive ? "text-foreground" : "text-foreground/60"
            );

          return (
            <Link key={item.link} href={item.link} className={className}>
              {item.title}
            </Link>
          );
        })}
      </nav>
      {store && (
        <div className="flex flex-row ml-auto">
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
            <StoreLoginDialog mr />
          )}
        </div>
      )}
    </div>
  );
}