import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError";
import { recordAuditLog } from "../../common/audit/recordAuditLog";
import * as planningService from "./planning.service";
import type { ListBookingsQuery } from "./planning.validation";

export async function listEngineersHandler(_req: Request, res: Response) {
  const engineers = await planningService.listEngineers();
  res.json({ items: engineers });
}

export async function listBookingsHandler(req: Request, res: Response) {
  const bookings = await planningService.listBookings(req.validatedQuery as ListBookingsQuery);
  res.json({ items: bookings });
}

export async function getBookingHandler(req: Request, res: Response) {
  const booking = await planningService.getBookingById(req.params.id);
  if (!booking) {
    throw AppError.notFound();
  }
  res.json(booking);
}

export async function createBookingHandler(req: Request, res: Response) {
  const booking = await planningService.createBooking(req.body, req.user?.sub);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "planning.create",
    entity: "Booking",
    entityId: booking.id,
    ipAddress: req.ip,
  });
  res.status(201).json(booking);
}

export async function updateBookingHandler(req: Request, res: Response) {
  const existing = await planningService.getBookingById(req.params.id);
  if (!existing) {
    throw AppError.notFound();
  }
  const booking = await planningService.updateBooking(req.params.id, req.body);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "planning.update",
    entity: "Booking",
    entityId: booking.id,
    ipAddress: req.ip,
  });
  res.json(booking);
}

export async function deleteBookingHandler(req: Request, res: Response) {
  const existing = await planningService.getBookingById(req.params.id);
  if (!existing) {
    throw AppError.notFound();
  }
  await planningService.deleteBooking(req.params.id);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "planning.delete",
    entity: "Booking",
    entityId: req.params.id,
    ipAddress: req.ip,
  });
  res.status(204).send();
}

export async function getBookingIcsHandler(req: Request, res: Response) {
  const booking = await planningService.getBookingById(req.params.id);
  if (!booking) {
    throw AppError.notFound();
  }
  const ics = planningService.bookingToIcs(booking);
  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="booking-${booking.id}.ics"`);
  res.send(ics);
}
