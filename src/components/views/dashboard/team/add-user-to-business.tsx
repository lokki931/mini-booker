"use client";
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  workStart: z.string().min(1, "Required"), // Format: HH:mm
  workEnd: z.string().min(1, "Required"), // Format: HH:mm
  workDays: z.array(z.number()).min(1, "Pick at least one day"),
});

type FormData = z.infer<typeof formSchema>;

export function AddToBusinessDrawer({
  isOpen,
  onClose,
  businessId,
  userId,
  onAdded,
}: {
  isOpen: boolean;
  onClose: () => void;
  businessId: string | null;
  userId: string | null;
  onAdded?: () => void;
}) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workStart: "",
      workEnd: "",
      workDays: [],
    },
  });

  const onSubmit = async (values: FormData) => {
    const res = await fetch("/api/business/team/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId,
        userId,
        ...values,
        workDays: JSON.stringify(values.workDays),
      }),
    });

    if (res.ok) {
      onClose();
      onAdded?.();
      form.reset();
    } else {
      console.error("Failed to add user to business");
    }
  };

  const days = [
    { label: "Sun", value: 0 },
    { label: "Mon", value: 1 },
    { label: "Tue", value: 2 },
    { label: "Wed", value: 3 },
    { label: "Thu", value: 4 },
    { label: "Fri", value: 5 },
    { label: "Sat", value: 6 },
  ];

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm px-4 py-4">
          <DrawerHeader>
            <DrawerTitle>Add Staff Member</DrawerTitle>
          </DrawerHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="workStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="workEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="workDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Days</FormLabel>
                    <div className="grid grid-cols-4 gap-2">
                      {days.map((day) => (
                        <label
                          key={day.value}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            checked={field.value?.includes(day.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...field.value, day.value]);
                              } else {
                                field.onChange(
                                  field.value.filter((v) => v !== day.value)
                                );
                              }
                            }}
                          />
                          {day.label}
                        </label>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DrawerFooter className="px-0 pt-2">
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
