// api/business/bookings/[id]/remove
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings } from "@/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = (await params).id;

  if (!id) {
    return NextResponse.json({ error: "Missing booking id" }, { status: 400 });
  }
  await db.delete(bookings).where(eq(bookings.id, id));
  return NextResponse.json({ success: true });
}
