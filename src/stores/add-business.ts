import { create } from "zustand";

interface DrawerState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useAddBusinessStore = create<DrawerState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
