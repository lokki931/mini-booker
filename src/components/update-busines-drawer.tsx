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
import { Business, useBusinessStore } from "@/stores/business";

const formSchema = z.object({
  name: z.string().min(2),
  plan: z.string().min(2),
});

type FormData = z.infer<typeof formSchema>;

type Props = {
  business: Business;
  setBusiness: React.Dispatch<React.SetStateAction<Business | null>>;
};

export function UpdateBusinessDrawer({ business, setBusiness }: Props) {
  const { businesses, setBusinesses } = useBusinessStore();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      plan: "",
    },
  });

  const onSubmit = async (values: FormData) => {
    if (!business?.id) return;
    const res = await fetch(`/api/business/${business.id}/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name,
        plan: values.plan,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setBusinesses(
        (businesses ?? []).map((b) =>
          b.id === data.updated.id ? data.updated : b
        )
      );
      setBusiness(null);
    } else {
      console.log(data.error || "Failed to update booking");
    }
  };
  React.useEffect(() => {
    if (business) {
      form.reset({
        name: business.name,
        plan: business.plan,
      });
    }
  }, [business, form]);

  return (
    <Drawer open={!!business} onOpenChange={() => setBusiness(null)}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Update Business</DrawerTitle>
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
