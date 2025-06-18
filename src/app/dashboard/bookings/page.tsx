import { SiteHeader } from "@/components/site-header";
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
  return (
    <>
      {session.user.role !== "admin" ? (
        <>
          <SiteHeader title="Bookings staff" />
          <div className="flex flex-1 flex-col p-4">Bookings staff</div>
        </>
      ) : (
        <>
          <SiteHeader title="Bookings admin" />
          <div className="flex flex-1 flex-col p-4">Bookings admin</div>
        </>
      )}
    </>
  );
};

export default Page;
