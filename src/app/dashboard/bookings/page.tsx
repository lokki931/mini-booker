import { BookingsView } from "@/components/views/dashboard/bookings/bookings-view";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/dashboard");
  }
  return <BookingsView />;
};

export default Page;
