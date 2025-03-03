import { create } from "zustand";

interface ClientStore {
  clients: number;
  setClients: (count: number) => void;
}

export const useClientStore = create<ClientStore>((set) => ({
  clients: 2,
  setClients: (count) => set({ clients: count }),
}));
