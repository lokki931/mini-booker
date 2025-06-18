import { NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // BetterAuth або NextAuth
import { db } from "@/lib/db"; // Drizzle instance
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { user } from "@/schema";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = (await params).id;

  if (!id) {
    return NextResponse.json({ error: "Missing businessId" }, { status: 400 });
  }

  try {
    await db
      .update(user)
      .set({ activeBusinessId: id })
      .where(eq(user.id, session.user.id));

    return NextResponse.json({ id });
  } catch (error) {
    console.error("Failed to update active business", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
