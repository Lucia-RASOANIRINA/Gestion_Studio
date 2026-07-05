export interface BookingTimeRange {
  id: string;
  studio: string;
  engineerId: string | null;
  startAt: Date;
  endAt: Date;
}

export interface BookingCandidate {
  studio: string;
  engineerId?: string | null;
  startAt: Date;
  endAt: Date;
}

const SESSION_DURATION_STEP_MINUTES = 15;

/** Deux plages horaires se chevauchent si l'une commence avant que l'autre finisse, dans les deux sens. */
export function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/** La durée de session doit être un multiple de 15 minutes (30 minutes est un multiple de 15). */
export function isValidSessionDuration(startAt: Date, endAt: Date): boolean {
  const durationMs = endAt.getTime() - startAt.getTime();
  if (durationMs <= 0) return false;
  const durationMinutes = durationMs / (60 * 1000);
  return Number.isInteger(durationMinutes) && durationMinutes % SESSION_DURATION_STEP_MINUTES === 0;
}

/** Une réservation ne peut jamais être prise dans le passé. */
export function isNotInPast(startAt: Date, now: Date = new Date()): boolean {
  return startAt.getTime() >= now.getTime();
}

/**
 * Un conflit existe si une réservation existante partage le même studio OU le
 * même ingénieur, et que les plages horaires se chevauchent. `excludeId`
 * permet d'exclure la réservation elle-même lors d'une modification.
 */
export function findConflicts(
  candidate: BookingCandidate,
  existing: BookingTimeRange[],
  excludeId?: string
): BookingTimeRange[] {
  return existing.filter((booking) => {
    if (excludeId && booking.id === excludeId) return false;
    if (!rangesOverlap(candidate.startAt, candidate.endAt, booking.startAt, booking.endAt)) return false;

    const sameStudio = booking.studio === candidate.studio;
    const sameEngineer =
      Boolean(candidate.engineerId) && Boolean(booking.engineerId) && booking.engineerId === candidate.engineerId;

    return sameStudio || sameEngineer;
  });
}
