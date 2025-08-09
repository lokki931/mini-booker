import { create } from "zustand";

type Notification = {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
};

type notificationsState = {
  notifications: Notification[];
  count: number;
  setNotifications: (notifications: Notification[]) => void;
  fetchNotifications: (businessId: string) => Promise<void>;
  fetchNoReadNotifications: (businessId: string) => Promise<void>;
  fetchReadAllNotifications: (businessId: string) => Promise<void>;
};

export const useNotificationsStore = create<notificationsState>((set) => ({
  notifications: [],
  count: 0,
  setNotifications: (notifications) => set({ notifications }),
  fetchNotifications: async (businessId) => {
    const res = await fetch(`/api/business/${businessId}/notifications`);
    const data = await res.json();
    set({ notifications: data });
  },
  fetchNoReadNotifications: async (businessId) => {
    const res = await fetch(
      `/api/business/${businessId}/notifications/no-read`
    );
    const data = await res.json();
    set({ count: data.unreadCount });
  },
  fetchReadAllNotifications: async (businessId) => {
    const res = await fetch(
      `/api/business/${businessId}/notifications/read-all`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      }
    );
    const data = await res.json();
    set({ notifications: data, count: 0 });
  },
}));
