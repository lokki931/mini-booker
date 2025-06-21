import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { staffMembers } from "@/schema";
import { headers } from "next/headers";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";

const schema = z.object({
  businessId: z.string(),
  userId: z.string(),
  workStart: z.string(),
  workEnd: z.string(),
  workDays: z.string().transform((val) => JSON.parse(val).map(Number)),
});

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return new Response("Unauthorized", { status: 403 });
  }

  const body = await req.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return new Response("Invalid input", { status: 400 });
  }

  const { businessId, userId, workStart, workEnd, workDays } = result.data;
  // Чи вже доданий?
  const existing = await db.query.staffMembers.findFirst({
    where: (s) => and(eq(s.businessId, businessId), eq(s.userId, userId)),
  });

  if (existing) {
    return new Response("User already in business", { status: 409 });
  }

  // Додаємо
  await db.insert(staffMembers).values({
    businessId,
    userId,
    workStart,
    workEnd,
    workDays,
    id: nanoid(),
  });

  return new Response("User added to business", { status: 200 });
}
