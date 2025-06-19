"use client";

import React from "react";
import { SiteHeader } from "@/components/site-header";
import { useAddBookingsStore } from "@/stores/add-bookings";
import { useBookingsStore } from "@/stores/bookings";
import { useBusinessStore } from "@/stores/business";
import { Button } from "@/components/ui/button";
import { AddBookingsDrawer } from "@/components/add-bookings-drawer";

export const BookingsView = () => {
  const { activeBusinessId } = useBusinessStore();
  const { bookings, setBookings } = useBookingsStore();
  const openDrawer = useAddBookingsStore((s) => s.open);

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
      <SiteHeader title="Bookings" />
      <div className="flex flex-1 flex-col p-4">
        <Button onClick={openDrawer} className="mb-4 w-fit">
          + Add Booking
        </Button>
        {bookings?.length ? (
          bookings.map((b) => (
            <div key={b.id}>
              {b.clientName} — {b.service}
            </div>
          ))
        ) : (
          <div className="text-muted-foreground">No Bookings</div>
        )}
      </div>
      <AddBookingsDrawer />
    </>
  );
};
