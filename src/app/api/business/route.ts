import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { businesses, staffMembers } from "@/schema";
import { eq, inArray, or } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Знаходимо всі бізнеси, де юзер — staff
  const staffEntries = await db.query.staffMembers.findMany({
    where: eq(staffMembers.userId, userId),
  });

  const businessIdsAsStaff = staffEntries.map((s) => s.businessId);

  // Отримуємо всі бізнеси, де юзер — owner або staff
  const results = await db.query.businesses.findMany({
    where: or(
      eq(businesses.ownerId, userId),
      inArray(businesses.id, businessIdsAsStaff)
    ),
  });

  return NextResponse.json({ businesses: results });
}
