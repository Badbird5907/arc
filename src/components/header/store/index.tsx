import { MainStoreNav } from "@/components/header/store/main";

export function StoreHeader() {
  return (
    <header className="hidden md:block px-4 absolute top-0 z-10 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center w-full place-content-center">
        <MainStoreNav />
      </div>
    </header>
  );
}
