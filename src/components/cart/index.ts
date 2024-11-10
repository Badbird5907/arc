import { persistNSync } from "persist-and-sync";
import { create } from "zustand";

export type PlayerInfo = {
  name: string;
  uuid: string;
  bedrock: boolean;
}

type CartStore = {
  player: PlayerInfo | null;
  items: Record<string, number>;
  addItem: (id: string) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
}
export const useCart = create<CartStore>(
  persistNSync(
    (set) => ({
      items: {},
      player: null,
      setPlayer: (player: PlayerInfo) => set({ player }),
      addItem: id => set(state => ({ items: { ...state.items, [id]: (state.items[id] ?? 0) + 1 } })),
      removeItem: id => set(state => {
        const items = { ...state.items };
        delete items[id];
        return { items };
      }),
      setQuantity: (id, quantity) => set(state => ({ items: { ...state.items, [id]: quantity } }))
    }),
    { name: "cobalt-cart" }
  )
);