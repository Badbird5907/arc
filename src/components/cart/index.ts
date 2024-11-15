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
  items: Record<string, number>;
  subscriptionItem: string | null; // our cart can only have one subscription item
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  addItem: (id: string, quantity?: number, subscription?: boolean) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  setPlayer: (player: PlayerInfo | null) => void;
}
export const useCart = create<CartStore>()(
  persist(
    immer((set) => ({
      items: {},
      player: null,
      _hasHydrated: false,
      setHasHydrated: (value) => set({ _hasHydrated: value }),
      setPlayer: (player: PlayerInfo | null) => set({ player }),
      subscriptionItem: null,
      addItem: (id, qty, sub) => set((state: CartStore) => {
        if (sub) {
          return { items: { ...state.items, [id]: (state.items[id] ?? 0) + (qty ?? 1) }, subscriptionItem: id };
        }
        return { items: { ...state.items, [id]: (state.items[id] ?? 0) + (qty ?? 1) } };
      }),
      removeItem: id => set((state: CartStore) => {
        const items = { ...state.items };
        delete items[id];
        const obj: Partial<CartStore> = { items };
        if (state.subscriptionItem === id) {
          obj.subscriptionItem = null;
        }
        return obj;
      }),
      setQuantity: (id, quantity) => set((state: CartStore) => ({ items: { ...state.items, [id]: quantity } }))
    })),
    {
			name: "cobalt-cart",
			storage: createJSONStorage(() => localStorage),
      partialize: (state: CartStore) => ({ items: state.items, player: state.player }),
      onRehydrateStorage: (state) => {
        return () => state.setHasHydrated(true);
      }
		}
  )
);


withStorageDOMEvents(useCart);