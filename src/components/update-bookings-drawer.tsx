"use client";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useBookingsStore } from "@/stores/bookings";
import { useBusinessStore } from "@/stores/business";
import { client } from "@/lib/auth-client";
import { ExtendedSession } from "@/lib/types";
import { DatePickerNew } from "./ui/date-picker-new";
import { useStaffStore } from "@/stores/staff";
import { CalendarEvent } from "./booking-calendar";

const formSchema = z.object({
  clientName: z.string().min(2),
  clientPhone: z.string().min(5),
  service: z.string().min(2),
  clientEmail: z
    .string()
    .min(1, { message: "This field has to be filled." })
    .email("This is not a valid email."),
  bookingDate: z.date({
    required_error: "Date is required",
  }),
  bookingTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time"),
  staffId: z.string(),
  duration: z.number().min(1, "Duration is required"),
});

type FormData = z.infer<typeof formSchema>;

type UpdateBookingsDrawerProps = {
  updatedEvent: CalendarEvent | null;
  setUpdatedEvent: React.Dispatch<React.SetStateAction<CalendarEvent | null>>;
};

export function UpdateBookingsDrawer({
  updatedEvent,
  setUpdatedEvent,
}: UpdateBookingsDrawerProps) {
  const { data: session } = client.useSession() as {
    data: ExtendedSession | null;
  };
  const { setBookings, bookings } = useBookingsStore();
  const { activeBusinessId } = useBusinessStore();
  const { staff, fetchStaff, setStaff } = useStaffStore();
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      clientPhone: "",
      clientEmail: "",
      service: "",
      bookingDate: new Date(),
      bookingTime: "",
      duration: 30,
    },
  });
  React.useEffect(() => {
    if (activeBusinessId && session?.user.role === "admin") {
      fetchStaff(activeBusinessId);
    } else if (session?.user) {
      setStaff([{ id: session.user.id, name: session.user.name }]);
    }
  }, [activeBusinessId, fetchStaff, session, setStaff]);
  React.useEffect(() => {
    if (updatedEvent) {
      form.reset({
        clientName: updatedEvent.clientName,
        clientPhone: updatedEvent.clientPhone,
        clientEmail: updatedEvent.clientEmail,
        service: updatedEvent.service,
        bookingDate: new Date(updatedEvent.bookingDate),
        bookingTime: (() => {
          const date = new Date(updatedEvent.bookingDate);
          const h = String(date.getHours()).padStart(2, "0");
          const m = String(date.getMinutes()).padStart(2, "0");
          return `${h}:${m}`;
        })(),
        staffId: updatedEvent.staffId,
        duration: updatedEvent.duration,
      });
    }
  }, [updatedEvent, form]);

  const onSubmit = async (values: FormData) => {
    if (!updatedEvent?.id) return;
    setError(null);

    const [hours, minutes] = values.bookingTime.split(":").map(Number);
    const fullDate = new Date(values.bookingDate);
    fullDate.setHours(hours);
    fullDate.setMinutes(minutes);

    const res = await fetch(
      `/api/business/bookings/${updatedEvent.id}/update`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: values.clientName,
          clientPhone: values.clientPhone,
          clientEmail: values.clientEmail,
          service: values.service,
          bookingDate: fullDate.toISOString(),
          bookingTime: values.bookingTime,
          staffId: values.staffId,
          businessId: activeBusinessId,
          duration: values.duration,
        }),
      }
    );

    const data = await res.json();
    if (res.ok) {
      setBookings(
        (bookings ?? []).map((b) =>
          b.id === data.updated.id ? data.updated : b
        )
      );
      setUpdatedEvent(null);
    } else {
      setError(data.error || "Failed to update booking");
    }
  };

  return (
    <Drawer open={!!updatedEvent} onOpenChange={() => setUpdatedEvent(null)}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm px-4 overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Update Bookings</DrawerTitle>
            <DrawerDescription>Enter update Bookings details</DrawerDescription>
          </DrawerHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="bookingDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Booking Date</FormLabel>
                    <DatePickerNew
                      value={field.value}
                      onChange={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bookingTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Booking Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Client Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clientPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Client Phone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clientEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Client Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="service"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service</FormLabel>
                    <FormControl>
                      <Input placeholder="Service" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="staffId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Staff</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Staff" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {staff.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && <div className="text-red-600 mb-4">{error}</div>}
              <DrawerFooter className="px-0 pt-0 pb-7">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Updating..." : "Update"}
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
