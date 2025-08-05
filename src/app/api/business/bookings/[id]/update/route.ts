import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings } from "@/schema";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { and, eq, gte, lt, ne } from "drizzle-orm";
import { z } from "zod";

import { Resend } from "resend";
import * as React from "react";
import EmailTemplate from "@/components/email-template";
import EmailTemplateUser from "@/components/email-template -user";

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

  const bookingId = (await params).id;

  if (!bookingId) {
    return NextResponse.json({ error: "Missing booking id" }, { status: 400 });
  }

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
    duration,
    clientEmail,
  } = body;

  const bookingStart = new Date(bookingDate);
  const bookingEnd = new Date(bookingStart.getTime() + duration * 60 * 1000);

  const existingBooking = await db.query.bookings.findFirst({
    where: eq(bookings.id, bookingId),
  });

  if (!existingBooking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const isDateChanged =
    bookingStart.getTime() !==
      new Date(existingBooking.bookingDate).getTime() ||
    duration !== existingBooking.duration;
  const staff = await db.query.staffMembers.findFirst({
    where: (s) => and(eq(s.businessId, businessId), eq(s.userId, staffId)),
  });

  if (!staff) {
    return NextResponse.json(
      { error: "Staff member not found" },
      { status: 404 }
    );
  }
  const user = await db.query.user.findFirst({
    where: (u) => eq(u.id, staff.userId),
  });

  if (!user) {
    throw new Error("User not found");
  }

  const staffEmail = user.email;
  const staffName = user.name;

  if (isDateChanged) {
    const now = new Date();
    if (bookingStart < now) {
      return NextResponse.json(
        { error: "Booking date must be in the future" },
        { status: 400 }
      );
    }

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
          ),
          ne(b.id, bookingId) // виключаємо поточне бронювання
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

    const dayOfWeek = bookingStart.getDay();
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
      .padStart(2, "0")}:${bookingEnd
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

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
  }
  const isUpdated =
    existingBooking.clientName !== clientName ||
    existingBooking.clientPhone !== clientPhone ||
    existingBooking.service !== service ||
    existingBooking.duration !== duration ||
    existingBooking.staffId !== staffId ||
    new Date(existingBooking.bookingDate).getTime() !== bookingStart.getTime();
  await db
    .update(bookings)
    .set({
      clientName,
      clientPhone,
      clientEmail,
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
  if (isUpdated) {
    try {
      await resend.emails.send({
        from: "MiniBooker <onboarding@resend.dev>",
        to: [clientEmail],
        subject: `Update Booking ${clientName}`,
        react: EmailTemplate({
          firstName: clientName,
          serviceName: service,
          bookingDate: bookingStart.toISOString(),
        }) as React.ReactElement,
      });
      await resend.emails.send({
        from: "MiniBooker <onboarding@resend.dev>",
        to: [staffEmail],
        subject: `Update Booking Received`,
        react: EmailTemplateUser({
          firstName: staffName,
          serviceName: service,
          bookingDate: bookingStart.toISOString(),
        }) as React.ReactElement,
      });
    } catch (error) {
      console.error(error);
    }
  }

  return NextResponse.json({ updated });
}
