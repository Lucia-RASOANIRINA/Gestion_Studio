import crypto from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../common/errors/AppError";
import { findConflicts, isNotInPast, isValidSessionDuration } from "./planning-conflict";
import type { CreateBookingInput, ListBookingsQuery, UpdateBookingInput } from "./planning.validation";

/** Code unique du ticket électronique de réservation (ex. GS-T-A1B2C3). */
export function generateTicketCode(): string {
  return `GS-T-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

const bookingInclude = {
  project: { select: { id: true, title: true, reference: true } },
  engineer: { select: { id: true, firstName: true, lastName: true } },
} satisfies Prisma.BookingInclude;

export async function listEngineers() {
  return prisma.user.findMany({
    where: {
      isActive: true,
      roles: { some: { role: { name: { in: ["sound_engineer", "freelancer"] } } } },
    },
    select: { id: true, firstName: true, lastName: true },
    orderBy: { firstName: "asc" },
  });
}

export async function listBookings(query: ListBookingsQuery) {
  const where: Prisma.BookingWhereInput = {
    startAt: { lt: query.to },
    endAt: { gt: query.from },
    ...(query.studio ? { studio: query.studio } : {}),
    ...(query.engineerId ? { engineerId: query.engineerId } : {}),
  };

  return prisma.booking.findMany({
    where,
    orderBy: { startAt: "asc" },
    include: bookingInclude,
  });
}

export async function getBookingById(id: string) {
  return prisma.booking.findUnique({ where: { id }, include: bookingInclude });
}

async function assertNoConflict(
  input: { studio: string; engineerId?: string | null; startAt: Date; endAt: Date },
  excludeId?: string
) {
  const overlapping = await prisma.booking.findMany({
    where: {
      startAt: { lt: input.endAt },
      endAt: { gt: input.startAt },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true, studio: true, engineerId: true, startAt: true, endAt: true },
  });

  const conflicts = findConflicts(input, overlapping, excludeId);
  if (conflicts.length > 0) {
    throw AppError.conflict("errors.booking_conflict", { conflictingBookingIds: conflicts.map((c) => c.id) });
  }
}

function assertValidTiming(startAt: Date, endAt: Date) {
  if (!isValidSessionDuration(startAt, endAt)) {
    throw AppError.badRequest("errors.invalid_booking_duration");
  }
  if (!isNotInPast(startAt)) {
    throw AppError.badRequest("errors.booking_in_past");
  }
}

export async function createBooking(input: CreateBookingInput, createdById?: string) {
  assertValidTiming(input.startAt, input.endAt);
  await assertNoConflict(input);

  // Ticket électronique généré automatiquement à la création de la réservation.
  return prisma.booking.create({
    data: { ...input, createdById, ticketCode: generateTicketCode() },
    include: bookingInclude,
  });
}

export async function updateBooking(id: string, input: UpdateBookingInput) {
  assertValidTiming(input.startAt, input.endAt);
  await assertNoConflict(input, id);

  return prisma.booking.update({
    where: { id },
    data: input,
    include: bookingInclude,
  });
}

export async function deleteBooking(id: string) {
  await prisma.booking.delete({ where: { id } });
}

function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function bookingToIcs(booking: {
  id: string;
  title: string;
  startAt: Date;
  endAt: Date;
  notes: string | null;
}): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Gestion Studio//Planning//FR",
    "BEGIN:VEVENT",
    `UID:${booking.id}@gestion-studio`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(booking.startAt)}`,
    `DTEND:${formatIcsDate(booking.endAt)}`,
    `SUMMARY:${booking.title}`,
    ...(booking.notes ? [`DESCRIPTION:${booking.notes.replace(/\n/g, "\\n")}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
