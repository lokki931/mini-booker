"use client";

import { SiteHeader } from "@/components/site-header";
import { useStatsStore } from "@/stores/stats";
import React from "react";
import { StatCard } from "./stat-card";

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

  React.useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <>
      <SiteHeader title="Dashboard" />
      <div className="flex flex-1 flex-col p-4">
        <h2 className="text-base font-medium">Welcome {user.name}</h2>
        {stats && (
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
