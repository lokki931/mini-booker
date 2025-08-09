"use client";

import { BellIcon, PlusCircleIcon, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { useAddBookingsStore } from "@/stores/add-bookings";
import { client } from "@/lib/auth-client";
import { ExtendedSession } from "@/lib/types";
import { useNotificationsStore } from "@/stores/notifications";
import { useBusinessStore } from "@/stores/business";
import React from "react";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
}) {
  const { data: session } = client.useSession() as {
    data: ExtendedSession | null;
  };
  const { activeBusinessId } = useBusinessStore();
  const { fetchNoReadNotifications, count } = useNotificationsStore();
  const openDrawer = useAddBookingsStore((s) => s.open);
  const pathname = usePathname();
  const router = useRouter();
  function handleLink(url: string) {
    router.push(url);
  }
  React.useEffect(() => {
    if (!activeBusinessId) return;
    fetchNoReadNotifications(activeBusinessId);
  }, [activeBusinessId, fetchNoReadNotifications]);
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              onClick={openDrawer}
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
            >
              <PlusCircleIcon />
              <span>Quick Create</span>
            </SidebarMenuButton>
            {session?.user.role === "admin" && (
              <Button
                size="icon"
                className="h-9 w-9 shrink-0 group-data-[collapsible=icon]:opacity-0 relative"
                variant="outline"
                onClick={() => handleLink("/dashboard/notifications")}
              >
                <BellIcon />
                <span className="absolute top-0 right-0.5">{count}</span>
                <span className="sr-only">Notifications</span>
              </Button>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                className={`${pathname === item.url && "text-green-600"}`}
                onClick={() => handleLink(item.url)}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
