"use client";
import React, { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { useBusinessStore } from "@/stores/business";
import { useStaffStore } from "@/stores/staff";
import { AddToBusinessDrawer } from "./add-user-to-business";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [users, setUsers] = useState<TeamMember[] | []>([]);
  const [page, setPage] = useState(0);
  const USERS_PER_PAGE = 5;
  async function fetchUsersForBusiness(businessId: string) {
    const res = await fetch(`/api/business/team?businessId=${businessId}`);

    if (!res.ok) {
      throw new Error("Failed to fetch team");
    }

    const users = await res.json();
    return users;
  }

  function handleAddUser(id: string) {
    if (!effectiveBusinessId) return;
    setSelectedUserId(id);
    setDrawerOpen(true);
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

  const trimmedSearch = searchValue.trim().toLowerCase();

  const filteredUsers = React.useMemo(() => {
    if (trimmedSearch.length < 3) return users;
    return users.filter((user) =>
      user.email.toLowerCase().includes(trimmedSearch)
    );
  }, [users, trimmedSearch]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

  const paginatedUsers = React.useMemo(() => {
    const start = page * USERS_PER_PAGE;
    return filteredUsers.slice(start, start + USERS_PER_PAGE);
  }, [filteredUsers, page]);

  function handleNext() {
    if (page < totalPages - 1) setPage((p) => p + 1);
  }

  function handlePrev() {
    if (page > 0) setPage((p) => p - 1);
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
        <Card className="w-full shadow-md mx-auto rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search to email..."
              onChange={(e) => {
                setSearchValue(e.target.value);
              }}
            />
          </div>
          {paginatedUsers.length > 0 ? (
            <>
              {paginatedUsers.map((user) => (
                <Card
                  key={user.id}
                  className="mb-3 p-3 flex  justify-between shadow-sm hover:shadow transition rounded-xl"
                >
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p>{user.email}</p>
                  </div>
                  <div>
                    {user.isInBusiness ? (
                      <Button
                        variant="outline"
                        onClick={() => handleRemoveUser(user.id)}
                        disabled={loadingId === user.id}
                      >
                        {loadingId === user.id
                          ? "Removing..."
                          : "Remove from business"}
                      </Button>
                    ) : (
                      <Button onClick={() => handleAddUser(user.id)}>
                        Add to Business
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
              <div className="flex justify-between items-center pt-4">
                <Button onClick={handlePrev} disabled={page === 0}>
                  <ChevronLeft size={16} /> Prev
                </Button>
                <span className="text-sm">
                  Page {page + 1} of {totalPages}
                </span>
                <Button onClick={handleNext} disabled={page >= totalPages - 1}>
                  Next <ChevronRight size={16} />
                </Button>
              </div>
            </>
          ) : (
            <p>No users...</p>
          )}
        </Card>
      </div>
      {drawerOpen && effectiveBusinessId && selectedUserId && (
        <AddToBusinessDrawer
          isOpen={true}
          onClose={() => setDrawerOpen(false)}
          businessId={effectiveBusinessId}
          userId={selectedUserId}
          onAdded={async () => {
            const updated = await fetchUsersForBusiness(effectiveBusinessId);
            setUsers(updated);
            await fetchStaff(effectiveBusinessId);
          }}
        />
      )}
    </>
  );
};
