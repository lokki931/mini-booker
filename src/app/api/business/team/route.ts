import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { staffMembers, user } from "@/schema";
import { eq, ne } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return new Response("Unauthorized", { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("businessId");

  if (!businessId) {
    return new Response("No active business", { status: 400 });
  }

  // Отримуємо всіх юзерів окрім себе
  const users = await db
    .select()
    .from(user)
    .where(ne(user.id, session.user.id));

  // Отримуємо userId, які вже є у staffMembers цього бізнесу
  const staff = await db
    .select({ userId: staffMembers.userId })
    .from(staffMembers)
    .where(eq(staffMembers.businessId, businessId));

  const staffIds = new Set(staff.map((s) => s.userId));

  // Додаємо isInBusiness до кожного юзера
  const result = users.map((u) => ({
    ...u,
    isInBusiness: staffIds.has(u.id),
  }));

  return Response.json(result);
}
