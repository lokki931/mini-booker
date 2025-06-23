// GET /api/business/staff?businessId=xxx
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { staffMembers, user, businesses } from "@/schema";
import { eq, and, ne } from "drizzle-orm";
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

  if (!businessId) return new Response("Missing businessId", { status: 400 });

  // Отримати adminId з таблиці business
  const businessData = await db.query.businesses.findFirst({
    where: eq(businesses.id, businessId),
    columns: {
      ownerId: true,
    },
  });

  if (!businessData) {
    return new Response("Business not found", { status: 404 });
  }

  const result = await db
    .select({
      id: user.id,
      name: user.email,
    })
    .from(user)
    .innerJoin(staffMembers, eq(user.id, staffMembers.userId))
    .where(
      and(
        eq(staffMembers.businessId, businessId),
        ne(user.id, businessData.ownerId)
      )
    );

  return Response.json(result);
}
