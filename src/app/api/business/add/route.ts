import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { businesses, staffMembers, user } from "@/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, plan } = await req.json();

  if (!name || !plan) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const businessId = nanoid();

  const [data] = await db
    .insert(businesses)
    .values({
      id: businessId,
      name,
      plan,
      ownerId: session.user.id,
    })
    .returning();

  await db
    .update(user)
    .set({ activeBusinessId: businessId })
    .where(eq(user.id, session.user.id));

  await db.insert(staffMembers).values({
    id: nanoid(),
    userId: session.user.id,
    businessId,
  });

  return NextResponse.json({
    businessId,
    business: data,
  });
}
