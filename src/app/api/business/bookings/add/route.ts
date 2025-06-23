// POST /api/bookings/add
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings } from "@/schema";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { and, eq, lt, gte } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const {
    clientName,
    clientPhone,
    service,
    bookingDate,
    businessId,
    staffId,
    duration, // в хвилинах
  } = body;

  if (
    !clientName ||
    !clientPhone ||
    !service ||
    !bookingDate ||
    !businessId ||
    !staffId ||
    !duration
  ) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const bookingStart = new Date(bookingDate);
  const bookingEnd = new Date(bookingStart);
  bookingEnd.setMinutes(bookingStart.getMinutes() + duration);

  // Перевірка перетину з існуючими бронюваннями
  const overlapping = await db.query.bookings.findFirst({
    where: (b) =>
      and(
        eq(b.staffId, staffId),
        eq(b.businessId, businessId),
        lt(b.bookingDate, bookingEnd),
        gte(b.bookingDate, bookingStart)
      ),
  });

  if (overlapping) {
    return NextResponse.json(
      { error: "Time slot is already booked" },
      { status: 409 }
    );
  }

  // Перевірка чи час у робочих годинах
  const staff = await db.query.staffMembers.findFirst({
    where: (s) => and(eq(s.businessId, businessId), eq(s.userId, staffId)),
  });

  if (!staff) {
    return NextResponse.json(
      { error: "Staff member not found" },
      { status: 404 }
    );
  }

  const dayOfWeek = bookingStart.getDay(); // 0 - Sunday ... 6 - Saturday
  const startTimeStr = `${bookingStart
    .getHours()
    .toString()
    .padStart(2, "0")}:${bookingStart
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
  const endTimeStr = `${bookingEnd
    .getHours()
    .toString()
    .padStart(2, "0")}:${bookingEnd.getMinutes().toString().padStart(2, "0")}`;

  if (!Array.isArray(staff.workDays) || !staff.workDays.includes(dayOfWeek)) {
    return NextResponse.json(
      { error: "Staff not working this day" },
      { status: 400 }
    );
  }

  if (
    !staff.workStart ||
    !staff.workEnd ||
    startTimeStr < staff.workStart ||
    endTimeStr > staff.workEnd
  ) {
    return NextResponse.json(
      { error: "Outside of working hours" },
      { status: 400 }
    );
  }

  const [newBookings] = await db
    .insert(bookings)
    .values({
      id: nanoid(),
      clientName,
      clientPhone,
      service,
      bookingDate: bookingStart,
      businessId,
      staffId,
    })
    .returning();

  return NextResponse.json({ newBookings });
}
