import { SiteHeader } from "@/components/site-header";
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
  return (
    <>
      <SiteHeader title="Business" />
      <div className="flex flex-1 flex-col p-4">Business</div>
    </>
  );
};

export default Page;
