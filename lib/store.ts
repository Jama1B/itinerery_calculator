import { create } from "zustand";

interface ClientStore {
  adults: number;
  children: number;
  setAdults: (count: number) => void;
  setChildren: (count: number) => void;
  getTotalClients: () => number;
  // Adding vehicle management
  useManualVehicles: boolean;
  vehicleCount: number;
  setUseManualVehicles: (value: boolean) => void;
  setVehicleCount: (count: number) => void;
  getVehicleCount: (clientCount: number) => number;
}

// Vehicle capacity constant
const VEHICLE_CAPACITY = 7;

export const useClientStore = create<ClientStore>((set, get) => ({
  adults: 2,
  children: 0,
  setAdults: (count) => set({ adults: count }),
  setChildren: (count) => set({ children: count }),
  getTotalClients: () => get().adults + get().children,

  // Vehicle management
  useManualVehicles: false,
  vehicleCount: 1,
  setUseManualVehicles: (value) => set({ useManualVehicles: value }),
  setVehicleCount: (count) => set({ vehicleCount: count }),
  getVehicleCount: (clientCount) => {
    // If manual vehicles is enabled, return the set count
    // Otherwise calculate based on client count
    return get().useManualVehicles
      ? get().vehicleCount
      : Math.ceil(clientCount / VEHICLE_CAPACITY);
  },
}));
