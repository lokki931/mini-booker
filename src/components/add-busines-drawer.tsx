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
import { useAddBusinessStore } from "@/stores/add-business";
import { useBusinessStore } from "@/stores/business";

const formSchema = z.object({
  name: z.string().min(2),
  plan: z.string().min(2),
});

type FormData = z.infer<typeof formSchema>;

export function AddBusinessDrawer() {
  const { isOpen, close } = useAddBusinessStore();
  const { businesses, setBusinesses, setActiveBusiness } = useBusinessStore();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      plan: "",
    },
  });

  const onSubmit = async (values: FormData) => {
    const res = await fetch("/api/business/add", {
      method: "POST",
      body: JSON.stringify({ name: values.name, plan: values.plan }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const json = await res.json();
    const { businessId, business } = json;

    if (res.ok && business && businessId) {
      setBusinesses([...(businesses ?? []), business]);
      setTimeout(() => {
        setActiveBusiness(businessId);
      }, 0);
      form.reset();
      close();
    } else {
      console.error("Error creating business");
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && close()}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Add Business</DrawerTitle>
            <DrawerDescription>Enter business details</DrawerDescription>
          </DrawerHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Types business</FormLabel>
                    <FormControl>
                      <Input placeholder="Types business" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Adding..." : "Add"}
              </Button>
            </form>
          </Form>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
