"use client";

import React from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import type { View } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay, addMinutes } from "date-fns";
import { enUS } from "date-fns/locale";

import { Bookings } from "@/stores/bookings";

import { BookingDrawer } from "./booking-drawer";

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
export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  clientName: string;
  clientPhone: string;
  service: string;
  bookingDate: Date;
  businessId: string;
  staffId: string;
  duration: number;
};

export function BookingCalendar({ bookings }: BookingCalendarProps) {
  const [events, setEvents] = React.useState<CalendarEvent[] | []>([]);
  const [selectedEvent, setSelectedEvent] =
    React.useState<CalendarEvent | null>(null);
  const [view, setView] = React.useState<View>("week");
  const [date, setDate] = React.useState(new Date());

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  React.useEffect(() => {
    const parsed = bookings.map((b) => {
      const start = new Date(b.bookingDate);
      const end = addMinutes(start, b.duration);

      return {
        id: b.id,
        title: `${b.clientName} (${b.service})`,
        start,
        end,
        clientName: b.clientName,
        clientPhone: b.clientPhone,
        service: b.service,
        bookingDate: new Date(b.bookingDate),
        businessId: b.businessId,
        staffId: b.staffId,
        duration: b.duration,
      };
    });

    setEvents(parsed);
  }, [bookings]);

  return (
    <div className="h-[700px] p-4 bg-white dark:bg-zinc-900 rounded-xl shadow">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        date={date}
        onNavigate={handleNavigate}
        onView={handleViewChange}
        views={["month", "week", "day", "agenda"]}
        defaultDate={new Date()}
        style={{ height: 700 }}
        onSelectEvent={(event) => setSelectedEvent(event)}
      />
      <BookingDrawer
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
      />
    </div>
  );
}
