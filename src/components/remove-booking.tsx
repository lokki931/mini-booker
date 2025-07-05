"use client";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useBookingsStore } from "@/stores/bookings";
import { Trash2 } from "lucide-react";
import { CalendarEvent } from "./booking-calendar";

type RemoveBookingProps = {
  children: React.ReactNode;
  selectedEvent: CalendarEvent | null;
  setSelectedEvent: React.Dispatch<React.SetStateAction<CalendarEvent | null>>;
};

export const RemoveBooking = ({
  children,
  selectedEvent,
  setSelectedEvent,
}: RemoveBookingProps) => {
  const { setBookings, bookings } = useBookingsStore();
  async function handleCancel(id: string) {
    fetch(`/api/business/bookings/${id}/remove`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Delete failed");
        const updated = (bookings ?? []).filter((b) => b.id !== id);
        setBookings(updated);
        setSelectedEvent(null);
      })
      .catch((err) => {
        throw new Error(err.message);
      });
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 size-4" />
          {children}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this booking. You cannot undo this
            action.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (selectedEvent?.id) {
                handleCancel(selectedEvent.id);
              }
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
