// POST /api/bookings/add
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings } from "@/schema";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 403 });
  }
  const body = await req.json();
  const { clientName, clientPhone, service, bookingDate, businessId, staffId } =
    body;

  if (
    !clientName ||
    !clientPhone ||
    !service ||
    !bookingDate ||
    !businessId ||
    !staffId
  ) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const [newBookings] = await db
    .insert(bookings)
    .values({
      id: nanoid(),
      clientName,
      clientPhone,
      service,
      bookingDate: new Date(bookingDate),
      businessId,
      staffId,
    })
    .returning();

  return NextResponse.json({ newBookings });
}
