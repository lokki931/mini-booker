"use client";

import { SiteHeader } from "@/components/site-header";

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
export const DashboardView = ({ user }: Props) => {
  return (
    <>
      <SiteHeader title="Dashboard" />
      <div className="flex flex-1 flex-col p-4">Welcome {user.name}</div>
    </>
  );
};
