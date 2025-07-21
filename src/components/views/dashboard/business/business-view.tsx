"use client";
import React from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { useAddBusinessStore } from "@/stores/add-business";
import { Business, useBusinessStore } from "@/stores/business";
import { RemoveBusinessButton } from "./RemoveBusinessButton";
import { UpdateBusinessDrawer } from "@/components/update-busines-drawer";

export const BusinessView = () => {
  const [updatedBusiness, setUpdatedBusiness] = React.useState<Business | null>(
    null
  );
  const { businesses } = useBusinessStore();
  const openDrawer = useAddBusinessStore((s) => s.open);

  return (
    <>
      <SiteHeader title="Business" />
      <div className="flex flex-1 flex-col p-4 items-start">
        <Button onClick={openDrawer} className="mb-6">
          Add Business
        </Button>
        {businesses ? (
          <>
            {businesses.map((b) => (
              <div
                key={b.id}
                className="flex justify-between mb-4 items-center w-full bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border hover:shadow-md transition"
              >
                <div className="mr-2">
                  <h3 className="text-lg font-semibold text-zinc-800 dark:text-white">
                    {b.name}
                  </h3>
                  <p className="text-sm text-zinc-500">{b.plan}</p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Button onClick={() => setUpdatedBusiness(b)}>Update</Button>
                  <RemoveBusinessButton businessId={b.id} />
                </div>
              </div>
            ))}
          </>
        ) : (
          <p>No Business yet</p>
        )}
      </div>
      {updatedBusiness && (
        <UpdateBusinessDrawer
          business={updatedBusiness}
          setBusiness={setUpdatedBusiness}
        />
      )}
    </>
  );
};
