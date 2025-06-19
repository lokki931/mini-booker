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
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { client } from "@/lib/auth-client";
import { ExtendedSession } from "@/lib/types";
import { usePathname, useRouter } from "next/navigation";

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
});

type FormData = z.infer<typeof formSchema>;

export function AddBookingsDrawer() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = client.useSession() as {
    data: ExtendedSession | null;
  };
  const { isOpen, close } = useAddBookingsStore();
  const { bookings, setBookings } = useBookingsStore();
  const { activeBusinessId } = useBusinessStore();
  const [staff, setStaff] = React.useState<{ id: string; name: string }[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      clientPhone: "",
      service: "",
      bookingDate: new Date(),
      bookingTime: "",
    },
  });
  React.useEffect(() => {
    if (!activeBusinessId) return;
    if (
      session?.user.role !== "admin" &&
      session?.user.id &&
      session?.user.name
    ) {
      setStaff([{ id: session.user.id, name: session.user.name }]);
    } else {
      fetch(`/api/business/staff?businessId=${activeBusinessId}`)
        .then((res) => res.json())
        .then(setStaff);
    }
  }, [activeBusinessId]);

  const onSubmit = async (values: FormData) => {
    const {
      bookingDate,
      bookingTime,
      clientName,
      clientPhone,
      service,
      staffId,
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
      }),
    });
    const data = await res.json();
    if (res.ok) {
      if (pathname !== "/dashboard/bookings") {
        router.push("/dashboard/bookings");
      }
      setBookings([...(bookings ?? []), data.newBookings]);
      form.reset(); // очистка форми
      close(); // закриття drawer
    } else {
      console.error("Failed to add booking");
    }
  };

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
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Select date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

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
