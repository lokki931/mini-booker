import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings } from "@/schema";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { and, eq, gte, lt } from "drizzle-orm";

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
  const bookingEnd = new Date(bookingStart.getTime() + duration * 60 * 1000);

  // Перевірка перетину з існуючими бронюваннями
  const existingBookings = await db.query.bookings.findMany({
    where: (b) =>
      and(
        eq(b.staffId, staffId),
        eq(b.businessId, businessId),
        gte(
          b.bookingDate,
          new Date(bookingStart.getTime() - 1000 * 60 * 60 * 12)
        ),
        lt(
          b.bookingDate,
          new Date(bookingStart.getTime() + 1000 * 60 * 60 * 12)
        )
      ),
  });

  const isOverlapping = existingBookings.some((booking) => {
    const existingStart = new Date(booking.bookingDate);
    const existingEnd = new Date(
      existingStart.getTime() + booking.duration * 60 * 1000
    );

    return bookingStart < existingEnd && bookingEnd > existingStart;
  });

  if (isOverlapping) {
    return NextResponse.json(
      { error: "Time slot is already booked" },
      { status: 409 }
    );
  }

  // Перевірка робочих годин
  const staff = await db.query.staffMembers.findFirst({
    where: (s) => and(eq(s.businessId, businessId), eq(s.userId, staffId)),
  });

  if (!staff) {
    return NextResponse.json(
      { error: "Staff member not found" },
      { status: 404 }
    );
  }

  const dayOfWeek = bookingStart.getDay(); // 0 - Sunday, 1 - Monday, ...
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

  // Створення нового бронювання
  const [newBookings] = await db
    .insert(bookings)
    .values({
      id: nanoid(),
      clientName,
      clientPhone,
      service,
      bookingDate: bookingStart,
      duration, // додано!
      businessId,
      staffId,
    })
    .returning();

  return NextResponse.json({ newBookings });
}
