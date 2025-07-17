"use client";

import { SiteHeader } from "@/components/site-header";
import { useBookingsStore } from "@/stores/bookings";
import { useBusinessStore } from "@/stores/business";
import React from "react";
import { StatCard } from "./stat-card";
import { StaffScheduleCard } from "./schedule-card";

type Props = {
  user: {
    id: string;
    name: string;
    emailVerified: boolean;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    image?: string | null | undefined | undefined;
  };
};
export const DashboardViewStaff = ({ user }: Props) => {
  const { activeBusinessId, businesses } = useBusinessStore();
  const { setBookings, bookings } = useBookingsStore();
  const [schedule, setSchedule] = React.useState(null);

  const activeBusiness = React.useMemo(() => {
    return businesses?.find((b) => b.id === activeBusinessId);
  }, [activeBusinessId, businesses]);

  React.useEffect(() => {
    if (!activeBusinessId) return;

    fetch(`/api/business/bookings?businessId=${activeBusinessId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch bookings");
        return res.json();
      })
      .then((data) => {
        setBookings(data.bookings);
      })
      .catch((err) => {
        console.error(err);
        setBookings([]);
      });
  }, [activeBusinessId, setBookings]);
  React.useEffect(() => {
    if (!activeBusinessId || !user.id) return;
    fetch("/api/business/staff/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        staffId: user.id,
        businessId: activeBusinessId,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          console.error("❌ Failed with status:", res.status);
          throw new Error("Failed to fetch schedule");
        }
        return res.json();
      })
      .then((data) => {
        setSchedule(data.staff);
      })
      .catch((err) => {
        console.error("❌ Error:", err);
      });
  }, [activeBusinessId, user.id]);

  return (
    <>
      <SiteHeader title="Dashboard" />
      <div className="flex flex-1 flex-col p-4">
        <h2 className="text-base font-medium mb-2">Welcome {user.name}</h2>
        {activeBusiness && (
          <p className="mb-2">Your active business: {activeBusiness.name}</p>
        )}
        {!activeBusiness && (
          <p className="mb-2 text-sm text-muted-foreground">
            You don&apos;t choose active business.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {schedule && <StaffScheduleCard schedule={schedule} />}
          {bookings && (
            <StatCard
              title="Bookings"
              value={bookings.length}
              url="/dashboard/bookings"
            />
          )}
        </div>
      </div>
    </>
  );
};
