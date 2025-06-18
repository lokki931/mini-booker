"use client";

import * as React from "react";
import {
  ClipboardListIcon,
  DatabaseIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { BussinessSwitcher } from "./bussiness-switcher";
import { useBusinessStore } from "@/stores/business";
import { client } from "@/lib/auth-client";
import { ExtendedSession } from "@/lib/types";

const data = {
  navMainAdmin: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Bookings",
      url: "/dashboard/bookings",
      icon: DatabaseIcon,
    },
    {
      title: "Business",
      url: "/dashboard/business",
      icon: ClipboardListIcon,
    },
    {
      title: "Team",
      url: "/dashboard/team",
      icon: UsersIcon,
    },
  ],
  navMainStaff: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Bookings",
      url: "/dashboard/bookings",
      icon: DatabaseIcon,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: SettingsIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { businesses, setBusinesses } = useBusinessStore();
  const { data: session } = client.useSession() as {
    data: ExtendedSession | null;
  };

  const navLinks =
    session?.user?.role === "admin" ? data.navMainAdmin : data.navMainStaff;

  React.useEffect(() => {
    fetch("/api/business")
      .then((res) => res.json())
      .then((data) => {
        if (data.businesses) {
          setBusinesses(data.businesses);
        }
      });
  }, [setBusinesses]);
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <BussinessSwitcher bussiness={businesses || []} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navLinks} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
