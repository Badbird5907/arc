"use client";

import { withStorageDOMEvents } from "@/lib/utils/persist";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type PlayerInfo = {
  name: string;
  uuid: string;
  bedrock: boolean;
}

export type CartStore = {
  player: PlayerInfo | null;
  items: Record<string, { quantity: number; subscription: boolean }>;

  coupons: Record<string, string>; // <code, id>

  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  addItem: (id: string, quantity?: number, subscription?: boolean) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  setPlayer: (player: PlayerInfo | null) => void;
  addCoupon: (code: string) => void;
  removeCoupon: (code: string) => void;
  clear: () => void;
}
export const useCart = create<CartStore>()(
  persist(
    immer((set) => ({
      items: {},
      coupons: {},
      player: null,
      _hasHydrated: false,
      setHasHydrated: (value) => set({ _hasHydrated: value }),
      setPlayer: (player: PlayerInfo | null) => set({ player }),
      addItem: (id, qty, sub) => {
        return set((state: CartStore) => ({
          items: {
            ...state.items,
            [id]: { quantity: (state.items[id]?.quantity ?? 0) + (qty ?? 1), subscription: sub ?? false }
          }
        }))
      },
      removeItem: id => set((state: CartStore) => {
        const items = { ...state.items };
        delete items[id];
        const obj: Partial<CartStore> = { items };
        return obj;
      }),
      setQuantity: (id, quantity) => set((state: CartStore) => ({ items: { ...state.items, [id]: quantity } })),
      addCoupon: (code) => set((state: CartStore) => ({ coupons: { ...state.coupons, [code]: code } })),
      removeCoupon: (code) => set((state: CartStore) => {
        const coupons = { ...state.coupons };
        delete coupons[code];
        return { coupons };
      }),
      clear: () => set({ items: {}, player: null, coupons: {} }) // to me in the morning; the zustand store is broken
    })),
    {
			name: `arc-cart`,
			storage: createJSONStorage(() => localStorage),
      partialize: (state: CartStore) => ({
        items: state.items,
        player: state.player,
        coupons: state.coupons
      }),
      onRehydrateStorage: (state) => {
        return () => state.setHasHydrated(true);
      }
		}
  )
);


withStorageDOMEvents(useCart);