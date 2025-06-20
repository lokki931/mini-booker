"use client";
import React, { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { useBusinessStore } from "@/stores/business";
import { useStaffStore } from "@/stores/staff";

type TeamMember = {
  id: string;
  email: string;
  name: string;
  isInBusiness: boolean;
};

export const TeamView = ({ userActiveId }: { userActiveId: string | null }) => {
  const { activeBusinessId } = useBusinessStore();
  const { fetchStaff } = useStaffStore();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [effectiveBusinessId, setEffectiveBusinessId] = useState<string | null>(
    null
  );
  const [users, setUsers] = useState<TeamMember[] | []>([]);
  async function fetchUsersForBusiness(businessId: string) {
    const res = await fetch(`/api/business/team?businessId=${businessId}`);

    if (!res.ok) {
      throw new Error("Failed to fetch team");
    }

    const users = await res.json();
    return users;
  }

  async function handleAddUser(id: string) {
    setLoadingId(id);
    await fetch("/api/business/team/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId: effectiveBusinessId,
        userId: id,
      }),
    });

    if (effectiveBusinessId) {
      const updatedUsers = await fetchUsersForBusiness(effectiveBusinessId);
      setUsers(updatedUsers);
      await fetchStaff(effectiveBusinessId);
    }
    setLoadingId(null);
  }
  async function handleRemoveUser(id: string) {
    setLoadingId(id);
    const res = await fetch("/api/business/team/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId: effectiveBusinessId,
        userId: id,
      }),
    });

    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isInBusiness: false } : u))
      );
    }
    setLoadingId(null);
  }

  React.useEffect(() => {
    setEffectiveBusinessId(activeBusinessId || userActiveId);
  }, [activeBusinessId, userActiveId]);

  React.useEffect(() => {
    if (!effectiveBusinessId) return;

    fetchUsersForBusiness(effectiveBusinessId)
      .then(setUsers)
      .catch((err) => console.error("Team fetch error", err));
  }, [effectiveBusinessId]);

  return (
    <>
      <SiteHeader title="Team" />
      <div className="flex flex-1 flex-col p-4">
        {users.map((user) => (
          <div key={user.id}>
            {user.email}
            {user.isInBusiness ? (
              <Button
                variant="outline"
                onClick={() => handleRemoveUser(user.id)}
                disabled={loadingId === user.id}
              >
                {loadingId === user.id ? "Removing..." : "Remove to business"}
              </Button>
            ) : (
              <Button
                onClick={() => handleAddUser(user.id)}
                disabled={loadingId === user.id}
              >
                {loadingId === user.id ? "Adding..." : "Add to Business"}
              </Button>
            )}
          </div>
        ))}
      </div>
    </>
  );
};
