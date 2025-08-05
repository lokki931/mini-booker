// stores/bookings.ts
import { create } from "zustand";

export type Bookings = {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  service: string;
  bookingDate: Date;
  businessId: string;
  staffId: string;
  duration: number;
};

type BookingsStore = {
  bookings: Bookings[] | null;
  setBookings: (b: Bookings[]) => void;
  clearBusinesses: () => void;
};

export const useBookingsStore = create<BookingsStore>((set) => ({
  bookings: null,
  setBookings: (bookings) => set({ bookings }),
  clearBusinesses: () => set({ bookings: null }),
}));
