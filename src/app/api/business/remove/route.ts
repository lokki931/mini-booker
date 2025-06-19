import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { businesses, staffMembers, user } from "@/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function DELETE(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response("Unauthorized", { status: 403 });
  }

  const { businessId } = await req.json();

  // Перевірка, що користувач є власником
  const business = await db.query.businesses.findFirst({
    where: and(
      eq(businesses.id, businessId),
      eq(businesses.ownerId, session.user.id)
    ),
  });

  if (!business) {
    return new Response("Not allowed", { status: 403 });
  }

  // Занулити activeBusinessId у всіх, хто був у цьому бізнесі
  await db
    .update(user)
    .set({ activeBusinessId: null })
    .where(eq(user.activeBusinessId, businessId));

  // Видалити staff
  await db.delete(staffMembers).where(eq(staffMembers.businessId, businessId));

  // Видалити бізнес
  await db.delete(businesses).where(eq(businesses.id, businessId));

  return Response.json({ success: true });
}
