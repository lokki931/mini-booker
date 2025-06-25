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
import { useAddBookingsStore } from "@/stores/add-bookings";
import { useBookingsStore } from "@/stores/bookings";
import { useBusinessStore } from "@/stores/business";
import { client } from "@/lib/auth-client";
import { ExtendedSession } from "@/lib/types";
import { usePathname, useRouter } from "next/navigation";
import { DatePickerNew } from "./ui/date-picker-new";
import { useStaffStore } from "@/stores/staff";

const formSchema = z.object({
  clientName: z.string().min(2),
  clientPhone: z.string().min(5),
  service: z.string().min(2),
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

export function AddBookingsDrawer() {
  const router = useRouter();
  const pathName = usePathname();
  const { data: session } = client.useSession() as {
    data: ExtendedSession | null;
  };
  const { isOpen, close } = useAddBookingsStore();
  const { bookings, setBookings } = useBookingsStore();
  const { activeBusinessId } = useBusinessStore();
  const { staff, fetchStaff, setStaff } = useStaffStore();
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      clientPhone: "",
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

  const onSubmit = async (values: FormData) => {
    setError(null);
    const {
      bookingDate,
      bookingTime,
      clientName,
      clientPhone,
      service,
      staffId,
      duration,
    } = values;

    const [hours, minutes] = bookingTime.split(":").map(Number);
    const fullDate = new Date(bookingDate);
    fullDate.setHours(hours);
    fullDate.setMinutes(minutes);

    const res = await fetch("/api/business/bookings/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName,
        clientPhone,
        service,
        staffId,
        bookingDate: fullDate.toISOString(),
        businessId: activeBusinessId,
        duration,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      if (pathName !== "/dashboard/bookings") {
        router.push("/dashboard/bookings");
      }
      setBookings([...(bookings ?? []), data.newBookings]);
      form.reset(); // очистка форми
      close(); // закриття drawer
    } else {
      setError(data.error || "Failed to add booking");
    }
  };
  function invateLink() {
    router.push("/dashboard/team");
    close();
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && close()}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm px-4 overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Add Bookings</DrawerTitle>
            <DrawerDescription>Enter Bookings details</DrawerDescription>
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
                    {session?.user.role === "admin" && (
                      <span>
                        no user -{" "}
                        <Button onClick={invateLink} variant="secondary">
                          invite
                        </Button>
                      </span>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && <div className="text-red-600 mb-4">{error}</div>}
              <DrawerFooter className="px-0 pt-0 pb-7">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Adding..." : "Add"}
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
