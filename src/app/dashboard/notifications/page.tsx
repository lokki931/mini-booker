import { NotificationsView } from "@/components/views/dashboard/notifications/notification-view";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return redirect("/dashboard");
  }
  return <NotificationsView />;
};

export default Page;
