import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifications } from "@/schema";
import { eq, and, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return new Response("Unauthorized", { status: 403 });
  }

  const businessId = (await params).id;

  if (!businessId) {
    return NextResponse.json({ error: "Missing booking id" }, { status: 400 });
  }

  // ✅ Повертаємо кількість непрочитаних
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications) // або твоя таблиця
    .where(
      and(
        eq(notifications.businessId, businessId),
        eq(notifications.isRead, false)
      )
    );

  return NextResponse.json({ unreadCount: result.count });
}
