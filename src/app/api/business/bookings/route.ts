import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { bookings, businesses, staffMembers } from "@/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("businessId");

  if (!businessId) {
    return new Response("Missing businessId", { status: 400 });
  }

  const userId = session.user.id;
  const role = session.user.role;

  // Перевірка прав доступу
  if (role === "admin") {
    const isOwner = await db.query.businesses.findFirst({
      where: and(eq(businesses.id, businessId), eq(businesses.ownerId, userId)),
    });

    const isStaff = await db.query.staffMembers.findFirst({
      where: and(
        eq(staffMembers.userId, userId),
        eq(staffMembers.businessId, businessId)
      ),
    });

    if (!isOwner && !isStaff) {
      return new Response("Forbidden", { status: 403 });
    }

    // Повертаємо всі бронювання для бізнесу
    const results = await db.query.bookings.findMany({
      where: eq(bookings.businessId, businessId),
    });

    return NextResponse.json({ bookings: results });
  }

  // Якщо role === "staff"
  const isStaff = await db.query.staffMembers.findFirst({
    where: and(
      eq(staffMembers.userId, userId),
      eq(staffMembers.businessId, businessId)
    ),
  });

  if (!isStaff) {
    return new Response("Forbidden", { status: 403 });
  }

  // Повертаємо тільки свої записи
  const results = await db.query.bookings.findMany({
    where: and(
      eq(bookings.businessId, businessId),
      eq(bookings.staffId, userId)
    ),
  });

  return NextResponse.json({ bookings: results });
}
