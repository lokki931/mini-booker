"use client";

import * as React from "react";
import { ChevronsUpDown, GalleryVerticalEnd, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { client } from "@/lib/auth-client";
import { ExtendedSession } from "@/lib/types";
import { Button } from "./ui/button";
import { useBusinessStore, Business } from "@/stores/business";
import { useAddBusinessStore } from "@/stores/add-business";
import { AddBusinessDrawer } from "./add-busines-drawer";

export function BussinessSwitcher({ bussiness }: { bussiness: Business[] }) {
  const { data: session } = client.useSession() as {
    data: ExtendedSession | null;
  };
  const { isMobile } = useSidebar();

  const { activeBusinessId, setBusinesses, setActiveBusiness, businesses } =
    useBusinessStore();
  const openDrawer = useAddBusinessStore((s) => s.open);
  const activeBusiness = React.useMemo(() => {
    return businesses?.find((b) => b.id === activeBusinessId);
  }, [activeBusinessId, businesses]);

  async function handleSet(activeId: string) {
    const res = await fetch(`/api/business/active/${activeId}`, {
      method: "POST",
    });
    const json = await res.json();
    const { id } = json;
    if (res.ok) {
      setActiveBusiness(id);
    } else {
      console.error("Invalid response from API");
    }
  }
  console.log(activeBusinessId);

  React.useEffect(() => {
    if (!session || !bussiness.length) return;

    setBusinesses(bussiness);

    const found = session.user.activeBusinessId
      ? bussiness.find((b) => b.id === session.user.activeBusinessId)
      : bussiness[0];

    if (found) {
      setActiveBusiness(found.id);
    }
  }, [session, bussiness, setBusinesses, setActiveBusiness]);

  if (!activeBusiness) {
    return (
      <div className="flex gap-2">
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <GalleryVerticalEnd className="size-4" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          {session?.user.role === "admin" ? (
            <>
              <Button variant="secondary" onClick={openDrawer}>
                Add Business
              </Button>
              <AddBusinessDrawer />
            </>
          ) : (
            !businesses?.length && (
              <div className="text-sm text-muted-foreground">
                No businesses yet
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {activeBusiness.name}
                  </span>
                  <span className="truncate text-xs">
                    {activeBusiness.plan}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Businesses
              </DropdownMenuLabel>
              {businesses?.map((b) => (
                <DropdownMenuItem
                  key={b.id}
                  onClick={() => handleSet(b.id)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <GalleryVerticalEnd className="size-4 shrink-0" />
                  </div>
                  {b.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              {session?.user.role === "admin" && (
                <DropdownMenuItem className="gap-2 p-2" onClick={openDrawer}>
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">
                    Add business
                  </div>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <AddBusinessDrawer />
    </>
  );
}
