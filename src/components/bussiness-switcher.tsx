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

type Business = {
  id: string;
  name: string;
  plan: string;
};

export function BussinessSwitcher({ bussiness }: { bussiness: Business[] }) {
  const { data: session } = client.useSession() as {
    data: ExtendedSession | null;
  };
  const { isMobile } = useSidebar();
  const [activeBusiness, setActiveBusiness] = React.useState<Business | null>(
    null
  );
  React.useEffect(() => {
    if (!session || !bussiness.length) return;

    const found = session.user.activeBusinessId
      ? bussiness.find((b) => b.id === session.user.activeBusinessId)
      : null;

    setActiveBusiness(found ?? bussiness[0]);
  }, [session, bussiness]);
  if (!activeBusiness) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {session?.user.role === "admin" ? (
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
                Bussiness
              </DropdownMenuLabel>
              {bussiness.map((bussiness) => (
                <DropdownMenuItem
                  key={bussiness.name}
                  onClick={() => setActiveBusiness(bussiness)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <GalleryVerticalEnd className="size-4 shrink-0" />
                  </div>
                  {bussiness.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Add bussiness
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {activeBusiness.name}
              </span>
              <span className="truncate text-xs">{activeBusiness.plan}</span>
            </div>
          </div>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
