import { BookingType, StudioRoom } from "@prisma/client";
import { z } from "zod";

export const createBookingSchema = z
  .object({
    studio: z.nativeEnum(StudioRoom),
    type: z.nativeEnum(BookingType).default(BookingType.SESSION),
    title: z.string().trim().min(2).max(200),
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    projectId: z.string().uuid().optional(),
    engineerId: z.string().uuid().optional(),
    notes: z.string().trim().max(2000).optional(),
  })
  .refine((data) => data.endAt > data.startAt, {
    message: "endAt must be after startAt",
    path: ["endAt"],
  });

export const updateBookingSchema = createBookingSchema;

export const listBookingsQuerySchema = z.object({
  studio: z.nativeEnum(StudioRoom).optional(),
  engineerId: z.string().uuid().optional(),
  from: z.coerce.date(),
  to: z.coerce.date(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type ListBookingsQuery = z.infer<typeof listBookingsQuerySchema>;
