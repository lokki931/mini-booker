"use client";
import React from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { useAddBusinessStore } from "@/stores/add-business";
import { useBusinessStore } from "@/stores/business";
import { RemoveBusinessButton } from "./RemoveBusinessButton";

export const BusinessView = () => {
  const { businesses, setBusinesses } = useBusinessStore();
  const openDrawer = useAddBusinessStore((s) => s.open);

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
    <>
      <SiteHeader title="Business" />
      <div className="flex flex-1 flex-col p-4">
        {businesses ? (
          <div>
            <div>
              {businesses.map((b) => (
                <div key={b.id}>
                  {b.name} {b.plan} <RemoveBusinessButton businessId={b.id} />
                </div>
              ))}
            </div>
            <Button onClick={openDrawer}>Add Business</Button>
          </div>
        ) : (
          <p>No Business yet</p>
        )}
      </div>
    </>
  );
};
