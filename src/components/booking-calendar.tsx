"use client";

import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay, addMinutes } from "date-fns";
import { enUS } from "date-fns/locale";
import { Bookings } from "@/stores/bookings";
import React from "react";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

type BookingCalendarProps = {
  bookings: Bookings[];
};
type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
};

export function BookingCalendar({ bookings }: BookingCalendarProps) {
  const [events, setEvents] = React.useState<CalendarEvent[]>([]);

  React.useEffect(() => {
    const parsed = bookings.map((booking) => {
      const start = new Date(booking.bookingDate);
      const end = addMinutes(start, booking.duration || 0);

      return {
        id: booking.id,
        title: `${booking.clientName} (${booking.service})`,
        start,
        end,
      };
    });

    setEvents(parsed);
  }, [bookings]);

  return (
    <div className="h-[80vh] p-4 bg-white dark:bg-zinc-900 rounded-xl shadow">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />
    </div>
  );
}
