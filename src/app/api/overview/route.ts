import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { bookings, businesses, user } from "@/schema";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [bookingsCountRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookings);

  const [usersCountRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(user);

  const [businessesCountRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(businesses);

  return NextResponse.json({
    bookingsCount: bookingsCountRow.count,
    usersCount: usersCountRow.count,
    businessesCount: businessesCountRow.count,
  });
}
