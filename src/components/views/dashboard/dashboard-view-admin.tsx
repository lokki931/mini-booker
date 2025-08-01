"use client";

import { SiteHeader } from "@/components/site-header";
import { useStatsStore } from "@/stores/stats";
import React from "react";
import { StatCard } from "./stat-card";
import { useBusinessStore } from "@/stores/business";

type Props = {
  user: {
    id: string;
    name: string;
    emailVerified: boolean;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    image?: string | null | undefined | undefined;
  };
};
export const DashboardViewAdmin = ({ user }: Props) => {
  const { stats, fetchStats } = useStatsStore();
  const { activeBusinessId, businesses } = useBusinessStore();
  React.useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  const activeBusiness = React.useMemo(() => {
    return businesses?.find((b) => b.id === activeBusinessId);
  }, [activeBusinessId, businesses]);

  return (
    <>
      <SiteHeader title="Dashboard" />
      <div className="flex flex-1 flex-col p-4">
        <h2 className="text-base font-medium mb-2">Welcome {user.name}</h2>
        {activeBusiness && (
          <p className="mb-2">Your active business: {activeBusiness.name}</p>
        )}
        {!activeBusiness && (
          <p className="mb-2 text-sm text-muted-foreground">
            You don&apos;t choose active business.
          </p>
        )}
        {!stats ? (
          <p>Loading stats...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <StatCard
              title="Bookings"
              value={stats.bookingsCount}
              url="/dashboard/bookings"
            />
            <StatCard
              title="Users"
              value={stats.usersCount}
              url="/dashboard/team"
            />
            <StatCard
              title="Business"
              value={stats.businessesCount}
              url="/dashboard/business"
            />
          </div>
        )}
      </div>
    </>
  );
};
