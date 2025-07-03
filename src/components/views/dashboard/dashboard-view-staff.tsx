"use client";

import { SiteHeader } from "@/components/site-header";
import { useBookingsStore } from "@/stores/bookings";
import { useBusinessStore } from "@/stores/business";
import React from "react";
import { StatCard } from "./stat-card";

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
  const { activeBusinessId } = useBusinessStore();
  const { setBookings, bookings } = useBookingsStore();

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
  return (
    <>
      <SiteHeader title="Dashboard" />
      <div className="flex flex-1 flex-col p-4">
        <h2 className="text-base font-medium">Welcome {user.name}</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
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
