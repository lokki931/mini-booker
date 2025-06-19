import { BusinessView } from "@/components/views/dashboard/business/business-view";
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
  return <BusinessView />;
};

export default Page;
