import { HomeView } from "@/components/views/home/home-view";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const Home = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) {
    return redirect("/dashboard");
  }
  return <HomeView />;
};
export default Home;
