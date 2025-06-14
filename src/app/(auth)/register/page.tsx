import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import { RegisterView } from "@/components/views/register/register-view";

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) {
    return redirect("/dashboard");
  }
  return <RegisterView />;
};

export default Page;
