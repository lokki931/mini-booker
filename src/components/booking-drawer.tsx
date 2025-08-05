import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { CalendarEvent } from "./booking-calendar";
import { client } from "@/lib/auth-client";
import { ExtendedSession } from "@/lib/types";
import { RemoveBooking } from "./remove-booking";

type BookingDrawerProps = {
  selectedEvent: CalendarEvent | null;
  setSelectedEvent: React.Dispatch<React.SetStateAction<CalendarEvent | null>>;
  setUpdatedEvent: React.Dispatch<React.SetStateAction<CalendarEvent | null>>;
};

export const BookingDrawer = ({
  selectedEvent,
  setSelectedEvent,
  setUpdatedEvent,
}: BookingDrawerProps) => {
  const { data: session } = client.useSession() as {
    data: ExtendedSession | null;
  };
  const [staffName, setStaffName] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!selectedEvent?.staffId) return;

    fetch(`/api/business/bookings/staff?staffId=${selectedEvent.staffId}`)
      .then((res) => res.json())
      .then((data) => {
        setStaffName(data.name);
      })
      .catch(() => {
        setStaffName("not found");
      });
  }, [selectedEvent]);
  return (
    <Drawer open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>
              {selectedEvent?.clientName} — {selectedEvent?.service}
            </DrawerTitle>
            <DrawerDescription>
              {selectedEvent?.start.toLocaleString()} —{" "}
              {selectedEvent?.end.toLocaleString()}
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-col gap-3">
            <p>
              <strong>Phone:</strong> {selectedEvent?.clientPhone}
            </p>
            <p>
              <strong>Email:</strong> {selectedEvent?.clientEmail}
            </p>
            <p>
              <strong>Duration:</strong> {selectedEvent?.duration} хв
            </p>
            <p>
              <strong>Staff:</strong> {staffName || "—"}
            </p>
          </div>

          <DrawerFooter>
            {session?.user.role === "admin" && (
              <>
                <Button
                  onClick={() => {
                    setSelectedEvent(null);
                    setUpdatedEvent(selectedEvent);
                  }}
                >
                  Update
                </Button>
                <RemoveBooking
                  setSelectedEvent={setSelectedEvent}
                  selectedEvent={selectedEvent}
                >
                  Cancel
                </RemoveBooking>
              </>
            )}
            <Button variant="secondary" onClick={() => setSelectedEvent(null)}>
              Close
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
