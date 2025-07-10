import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings } from "@/schema";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { and, eq, gte, lt } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  clientName: z.string(),
  clientPhone: z.string(),
  service: z.string(),
  bookingDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  businessId: z.string(),
  staffId: z.string(),
  duration: z.number(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Аутентифікація користувача
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const bookingId = (await params).id;

  if (!bookingId) {
    return NextResponse.json({ error: "Missing booking id" }, { status: 400 });
  }
  // Отримання даних з тіла запиту
  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return new Response("Invalid input", { status: 400 });
  }
  const {
    clientName,
    clientPhone,
    service,
    bookingDate,
    businessId,
    staffId,
    duration, // в хвилинах
  } = body;
  // Обчислення часу початку та завершення бронювання
  const bookingStart = new Date(bookingDate);

  const now = new Date();
  if (bookingStart < now) {
    return NextResponse.json(
      { error: "Booking date must be in the future" },
      { status: 400 }
    );
  }
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
  // Шукає бронювання цього працівника і бізнесу у межах ±12 годин.
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
  // Отримує працівника, щоб перевірити його графік роботи.
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
  // Перетворює дату в день тижня, час початку і завершення.
  if (!Array.isArray(staff.workDays) || !staff.workDays.includes(dayOfWeek)) {
    return NextResponse.json(
      { error: "Staff not working this day" },
      { status: 400 }
    );
  }
  // Якщо працівник не працює цього дня → помилка
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

  await db
    .update(bookings)
    .set({
      clientName,
      clientPhone,
      service,
      bookingDate: bookingStart,
      duration,
      businessId,
      staffId,
    })
    .where(eq(bookings.id, bookingId));

  const [updated] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId));
  return NextResponse.json({ updated });
}
