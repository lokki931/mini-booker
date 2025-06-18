// stores/business.ts
import { create } from "zustand";

export type Business = {
  id: string;
  name: string;
  plan: string;
};

type BusinessStore = {
  businesses: Business[] | null;
  activeBusinessId: string | null;
  setBusinesses: (b: Business[]) => void;
  setActiveBusiness: (id: string) => void;
  clearBusinesses: () => void;
};

export const useBusinessStore = create<BusinessStore>((set) => ({
  businesses: null,
  activeBusinessId: null,
  setBusinesses: (businesses) => set({ businesses }),
  setActiveBusiness: (id) => set({ activeBusinessId: id }),
  clearBusinesses: () => set({ businesses: null, activeBusinessId: null }),
}));
