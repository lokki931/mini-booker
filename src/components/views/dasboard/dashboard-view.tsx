"use client";

import { Button } from "@/components/ui/button";
import { client } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type Props = {
  user: {
    id: string;
    name: string;
    emailVerified: boolean;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    image?: string | null | undefined | undefined;
  };
};
export const DashboardView = ({ user }: Props) => {
  const router = useRouter();
  async function handleSignOut() {
    await client.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/"); // redirect to main page
        },
      },
    });
  }
  return (
    <div>
      Welcome {user.name}
      <Button onClick={handleSignOut}>Sign Out</Button>
    </div>
  );
};
