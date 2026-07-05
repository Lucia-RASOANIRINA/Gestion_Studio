export type StudioRoom = "STUDIO_A" | "STUDIO_B" | "STUDIO_C" | "MOBILE";
export type BookingType = "SESSION" | "UNAVAILABILITY";

export const STUDIO_ROOMS: StudioRoom[] = ["STUDIO_A", "STUDIO_B", "STUDIO_C", "MOBILE"];
export const BOOKING_TYPES: BookingType[] = ["SESSION", "UNAVAILABILITY"];

export interface BookingProjectRef {
  id: string;
  title: string;
  reference: string;
}

export interface BookingEngineerRef {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Booking {
  id: string;
  studio: StudioRoom;
  type: BookingType;
  title: string;
  startAt: string;
  endAt: string;
  notes: string | null;
  project: BookingProjectRef | null;
  engineer: BookingEngineerRef | null;
  createdAt: string;
  updatedAt: string;
}

export interface BookingFormValue {
  studio: StudioRoom;
  type: BookingType;
  title: string;
  startAt: string;
  endAt: string;
  projectId?: string;
  engineerId?: string;
  notes?: string;
}
