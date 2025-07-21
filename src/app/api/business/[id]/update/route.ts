import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { businesses } from "@/schema";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  name: z.string(),
  plan: z.string(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const businessId = (await params).id;

  if (!businessId) {
    return NextResponse.json({ error: "Missing booking id" }, { status: 400 });
  }

  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return new Response("Invalid input", { status: 400 });
  }

  const { name, plan } = body;

  await db
    .update(businesses)
    .set({
      name,
      plan,
    })
    .where(eq(businesses.id, businessId));

  const [updated] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, businessId));

  return NextResponse.json({ updated });
}
