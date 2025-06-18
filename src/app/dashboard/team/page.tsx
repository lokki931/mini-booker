import { TeamView } from "@/components/views/dashboard/team/team-view";
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
  return <TeamView userActiveId={session.user.activeBusinessId ?? null} />;
};

export default Page;
