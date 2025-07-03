import { create } from "zustand";

type Stats = {
  bookingsCount: number;
  usersCount: number;
  businessesCount: number;
};

type StatsState = {
  stats: Stats | null;
  setStats: (stats: Stats) => void;
  fetchStats: () => Promise<void>;
};

export const useStatsStore = create<StatsState>((set) => ({
  stats: null,
  setStats: (stats) => set({ stats }),
  fetchStats: async () => {
    const res = await fetch(`/api/overview/admin`);
    const data = await res.json();
    set({ stats: data });
  },
}));
