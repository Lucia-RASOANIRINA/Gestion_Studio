import { findConflicts, isNotInPast, isValidSessionDuration, rangesOverlap } from "./planning-conflict";

describe("rangesOverlap", () => {
  it("detects overlapping ranges", () => {
    const result = rangesOverlap(
      new Date("2026-07-10T10:00:00Z"),
      new Date("2026-07-10T11:00:00Z"),
      new Date("2026-07-10T10:30:00Z"),
      new Date("2026-07-10T12:00:00Z")
    );
    expect(result).toBe(true);
  });

  it("does not flag back-to-back ranges as overlapping", () => {
    const result = rangesOverlap(
      new Date("2026-07-10T10:00:00Z"),
      new Date("2026-07-10T11:00:00Z"),
      new Date("2026-07-10T11:00:00Z"),
      new Date("2026-07-10T12:00:00Z")
    );
    expect(result).toBe(false);
  });

  it("does not flag disjoint ranges as overlapping", () => {
    const result = rangesOverlap(
      new Date("2026-07-10T08:00:00Z"),
      new Date("2026-07-10T09:00:00Z"),
      new Date("2026-07-10T11:00:00Z"),
      new Date("2026-07-10T12:00:00Z")
    );
    expect(result).toBe(false);
  });
});

describe("isValidSessionDuration", () => {
  it("accepts a 30 minute session", () => {
    expect(isValidSessionDuration(new Date("2026-07-10T10:00:00Z"), new Date("2026-07-10T10:30:00Z"))).toBe(true);
  });

  it("accepts a 15 minute session", () => {
    expect(isValidSessionDuration(new Date("2026-07-10T10:00:00Z"), new Date("2026-07-10T10:15:00Z"))).toBe(true);
  });

  it("rejects a duration that is not a multiple of 15 minutes", () => {
    expect(isValidSessionDuration(new Date("2026-07-10T10:00:00Z"), new Date("2026-07-10T10:20:00Z"))).toBe(false);
  });

  it("rejects a non-positive duration", () => {
    expect(isValidSessionDuration(new Date("2026-07-10T10:00:00Z"), new Date("2026-07-10T10:00:00Z"))).toBe(false);
    expect(isValidSessionDuration(new Date("2026-07-10T10:30:00Z"), new Date("2026-07-10T10:00:00Z"))).toBe(false);
  });
});

describe("isNotInPast", () => {
  const now = new Date("2026-07-05T12:00:00Z");

  it("accepts a future date", () => {
    expect(isNotInPast(new Date("2026-07-06T12:00:00Z"), now)).toBe(true);
  });

  it("rejects a past date", () => {
    expect(isNotInPast(new Date("2026-07-04T12:00:00Z"), now)).toBe(false);
  });
});

describe("findConflicts", () => {
  const existing = [
    {
      id: "booking-1",
      studio: "STUDIO_A",
      engineerId: "engineer-1",
      startAt: new Date("2026-07-10T10:00:00Z"),
      endAt: new Date("2026-07-10T12:00:00Z"),
    },
  ];

  it("flags an overlapping booking in the same studio", () => {
    const conflicts = findConflicts(
      {
        studio: "STUDIO_A",
        engineerId: "engineer-2",
        startAt: new Date("2026-07-10T11:00:00Z"),
        endAt: new Date("2026-07-10T13:00:00Z"),
      },
      existing
    );
    expect(conflicts.length).toBe(1);
  });

  it("flags an overlapping booking with the same engineer in a different studio", () => {
    const conflicts = findConflicts(
      {
        studio: "STUDIO_B",
        engineerId: "engineer-1",
        startAt: new Date("2026-07-10T11:00:00Z"),
        endAt: new Date("2026-07-10T13:00:00Z"),
      },
      existing
    );
    expect(conflicts.length).toBe(1);
  });

  it("does not flag a different studio and different engineer", () => {
    const conflicts = findConflicts(
      {
        studio: "STUDIO_B",
        engineerId: "engineer-2",
        startAt: new Date("2026-07-10T11:00:00Z"),
        endAt: new Date("2026-07-10T13:00:00Z"),
      },
      existing
    );
    expect(conflicts.length).toBe(0);
  });

  it("excludes the booking itself when editing", () => {
    const conflicts = findConflicts(
      {
        studio: "STUDIO_A",
        engineerId: "engineer-1",
        startAt: new Date("2026-07-10T10:00:00Z"),
        endAt: new Date("2026-07-10T12:00:00Z"),
      },
      existing,
      "booking-1"
    );
    expect(conflicts.length).toBe(0);
  });

  it("does not flag a non-overlapping time in the same studio", () => {
    const conflicts = findConflicts(
      {
        studio: "STUDIO_A",
        engineerId: "engineer-2",
        startAt: new Date("2026-07-10T12:00:00Z"),
        endAt: new Date("2026-07-10T13:00:00Z"),
      },
      existing
    );
    expect(conflicts.length).toBe(0);
  });
});
