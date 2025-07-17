// api/business/staff/schedule/route.ts

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { staffMembers } from "@/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 400 });
  }
  const { staffId, businessId } = await req.json();

  if (!staffId || !businessId) {
    return NextResponse.json(
      { error: "Missing staffId or businessId" },
      { status: 400 }
    );
  }

  try {
    const [staff] = await db
      .select({
        workStart: staffMembers.workStart,
        workEnd: staffMembers.workEnd,
        workDays: staffMembers.workDays,
      })
      .from(staffMembers)
      .where(
        and(
          eq(staffMembers.userId, staffId),
          eq(staffMembers.businessId, businessId)
        )
      );

    if (!staff) {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ staff });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
