"use client";
import React from "react";
import { SiteHeader } from "@/components/site-header";

import { useBusinessStore } from "@/stores/business";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNotificationsStore } from "@/stores/notifications";

export const NotificationsView = () => {
  const { activeBusinessId } = useBusinessStore();
  const {
    notifications,
    fetchNotifications,
    fetchNoReadNotifications,
    count,
    fetchReadAllNotifications,
  } = useNotificationsStore();
  async function hadndleReadAll() {
    if (!activeBusinessId) return;
    await fetchReadAllNotifications(activeBusinessId);
  }
  React.useEffect(() => {
    if (!activeBusinessId) return;

    fetchNotifications(activeBusinessId);
    fetchNoReadNotifications(activeBusinessId);
  }, [activeBusinessId, fetchNoReadNotifications, fetchNotifications]);

  return (
    <>
      <SiteHeader title="Notifications" />
      <div className="flex flex-1 flex-col p-4">
        {notifications.length === 0 ? (
          <p className="text-gray-500">No Notifications...</p>
        ) : (
          <div className="flex flex-col gap-2 items-end">
            <Button onClick={hadndleReadAll}>Read All {count}</Button>
            <ul className="space-y-3 w-full">
              {notifications.map((notif) => (
                <li
                  key={notif.id}
                  className={cn(
                    "p-4 border rounded-lg transition-all",
                    notif.isRead ? "bg-white" : "bg-blue-50 border-blue-300"
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
          </div>
        )}
      </div>
    </>
  );
};
