import { create } from "zustand";

type StaffMember = {
  id: string;
  name: string;
};

type StaffState = {
  staff: StaffMember[];
  setStaff: (staff: StaffMember[]) => void;
  fetchStaff: (businessId: string) => Promise<void>;
};

export const useStaffStore = create<StaffState>((set) => ({
  staff: [],
  setStaff: (staff) => set({ staff }),
  fetchStaff: async (businessId) => {
    const res = await fetch(`/api/business/staff?businessId=${businessId}`);
    const data = await res.json();
    set({ staff: data });
  },
}));
