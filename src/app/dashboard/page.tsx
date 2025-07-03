import { DashboardViewAdmin } from "@/components/views/dashboard/dashboard-view-admin";
import { DashboardViewStaff } from "@/components/views/dashboard/dashboard-view-staff";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return redirect("/");
  }
  if (session.user.role === "admin") {
    return <DashboardViewAdmin user={session.user} />;
  }
  return <DashboardViewStaff user={session.user} />;
};

export default Page;
