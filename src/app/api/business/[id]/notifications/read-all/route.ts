import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifications } from "@/schema";
import { eq, and, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function PATCH(
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

  // 1️⃣ Оновлюємо всі непрочитані
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.businessId, businessId),
        eq(notifications.isRead, false)
      )
    );

  // 2️⃣ Вибираємо оновлені (тепер всі isRead = true)
  const updatedNotifications = await db.query.notifications.findMany({
    where: (n) => eq(n.businessId, businessId),
    orderBy: (n) => desc(n.createdAt),
  });

  return NextResponse.json(updatedNotifications);
}
