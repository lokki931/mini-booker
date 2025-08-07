import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings, notifications } from "@/schema";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { and, eq, gte, lt } from "drizzle-orm";
import { z } from "zod";

import { Resend } from "resend";
import * as React from "react";
import EmailTemplate from "@/components/email-template";
import EmailTemplateUser from "@/components/email-template-user";

const resend = new Resend(process.env.RESEND_API_KEY);

const schema = z.object({
  clientName: z.string(),
  clientPhone: z.string(),
  clientEmail: z
    .string()
    .min(1, { message: "This field has to be filled." })
    .email("This is not a valid email."),
  service: z.string(),
  bookingDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  businessId: z.string(),
  staffId: z.string(),
  duration: z.number(),
});

export async function POST(req: Request) {
  // Аутентифікація користувача
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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
    clientEmail,
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

  // Створення нового бронювання
  const [newBookings] = await db
    .insert(bookings)
    .values({
      id: nanoid(),
      clientName,
      clientPhone,
      clientEmail,
      service,
      bookingDate: bookingStart,
      duration,
      businessId,
      staffId,
    })
    .returning();
  await db.insert(notifications).values({
    businessId,
    type: "booking_create",
    message: `Booking for ${clientName} was created on ${bookingStart.toLocaleString()}`,
  });
  const user = await db.query.user.findFirst({
    where: (u) => eq(u.id, staff.userId),
  });

  if (!user) {
    throw new Error("User not found");
  }

  const staffEmail = user.email;
  const staffName = user.name;
  try {
    await resend.emails.send({
      from: "MiniBooker <onboarding@resend.dev>",
      to: [clientEmail],
      subject: `New Booking ${clientName}`,
      react: EmailTemplate({
        firstName: clientName,
        serviceName: service,
        bookingDate: bookingStart.toISOString(),
      }) as React.ReactElement,
    });
    await resend.emails.send({
      from: "MiniBooker <onboarding@resend.dev>",
      to: [staffEmail],
      subject: `New Booking Received`,
      react: EmailTemplateUser({
        firstName: staffName,
        serviceName: service,
        bookingDate: bookingStart.toISOString(),
      }) as React.ReactElement,
    });
  } catch (error) {
    console.error(error);
  }

  return NextResponse.json({ newBookings });
}
