import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { staffMembers, user } from "@/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return new Response("Unauthorized", { status: 403 });
  }

  const { businessId, userId } = await req.json();

  if (!businessId || !userId) {
    return new Response("Missing data", { status: 400 });
  }

  // 1. Видаляємо staff member
  await db
    .delete(staffMembers)
    .where(
      and(
        eq(staffMembers.businessId, businessId),
        eq(staffMembers.userId, userId)
      )
    );

  // 2. Отримуємо поточного користувача
  const [targetUser] = await db
    .select({ activeBusinessId: user.activeBusinessId })
    .from(user)
    .where(eq(user.id, userId));

  // 3. Якщо його activeBusinessId === businessId → занулюємо
  if (targetUser?.activeBusinessId === businessId) {
    await db
      .update(user)
      .set({ activeBusinessId: null })
      .where(eq(user.id, userId));
  }

  return new Response("Removed", { status: 200 });
}
