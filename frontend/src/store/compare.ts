import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Listing } from "@/types";

interface CompareStore {
  items: Listing[];
  add: (listing: Listing) => void;
  remove: (id: number) => void;
  clear: () => void;
  has: (id: number) => boolean;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      items: [],
      add: (listing) => {
        if (get().items.length >= 3) return;
        if (get().has(listing.id)) return;
        set((s) => ({ items: [...s.items, listing] }));
      },
      remove: (id) => set((s) => ({ items: s.items.filter((l) => l.id !== id) })),
      clear: () => set({ items: [] }),
      has: (id) => get().items.some((l) => l.id === id),
    }),
    { name: "autoch-compare" }
  )
);
