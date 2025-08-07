"use client";
import React from "react";
import { SiteHeader } from "@/components/site-header";

import { useBusinessStore } from "@/stores/business";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  type: string;
  message: string;
  createdAt: Date;
};

export const NotificationsView = () => {
  const { activeBusinessId } = useBusinessStore();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  async function getNotifications(businessId: string) {
    const res = await fetch(`/api/business/${businessId}/notifications`);

    if (!res.ok) throw new Error("Failed to fetch notifications");
    return res.json();
  }
  React.useEffect(() => {
    if (!activeBusinessId) return;

    const fetchNotifications = async () => {
      const data = await getNotifications(activeBusinessId); // API call
      setNotifications(data);
    };

    fetchNotifications();
  }, [activeBusinessId]);

  return (
    <>
      <SiteHeader title="Notifications" />
      <div className="flex flex-1 flex-col p-4">
        {notifications.length === 0 ? (
          <p className="text-gray-500">No Notifications...</p>
        ) : (
          <ul className="space-y-3">
            {notifications.map((notif) => (
              <li
                key={notif.id}
                className={cn(
                  "p-4 border rounded-lg transition-all"
                  // notif.isRead ? 'bg-white' : 'bg-blue-50 border-blue-300'
                )}
              >
                <p className="text-sm text-gray-600">
                  {new Date(notif.createdAt).toLocaleString()}
                </p>
                <h2 className="text-lg font-semibold">{notif.type}</h2>
                <p>{notif.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};
