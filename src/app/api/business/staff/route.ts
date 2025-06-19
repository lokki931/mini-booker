// GET /api/business/staff?businessId=xxx
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { staffMembers, user } from "@/schema";
import { eq } from "drizzle-orm";
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

  const result = await db
    .select({
      id: user.id,
      name: user.email,
    })
    .from(user)
    .innerJoin(staffMembers, eq(user.id, staffMembers.userId))
    .where(eq(staffMembers.businessId, businessId));

  return Response.json(result);
}
