import { create } from "zustand";

interface ClientStore {
  adults: number;
  children: number;
  setAdults: (count: number) => void;
  setChildren: (count: number) => void;
  getTotalClients: () => number;
}

export const useClientStore = create<ClientStore>((set, get) => ({
  adults: 2,
  children: 0,
  setAdults: (count) => set({ adults: count }),
  setChildren: (count) => set({ children: count }),
  getTotalClients: () => get().adults + get().children,
}));
