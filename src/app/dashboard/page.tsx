import { DashboardView } from "@/components/views/dashboard/dashboard-view";
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
  return <DashboardView user={session.user} />;
};

export default Page;
