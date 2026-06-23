import { describe, it, expect } from "vitest";
import {
  bookingDays,
  bookingTotal,
  conflictingBookings,
  formatCurrency,
  hasActiveBookings,
  rangesOverlap,
  reviewStats,
} from "../helpers";
import type { Booking, Review } from "../types";

describe("bookingDays", () => {
  it("counts a single day inclusively", () => {
    expect(bookingDays("2026-07-04", "2026-07-04")).toBe(1);
  });

  it("counts a multi-day range inclusively", () => {
    expect(bookingDays("2026-07-04", "2026-07-06")).toBe(3);
  });

  it("is DST-safe across a spring-forward boundary", () => {
    // US DST started 2026-03-08; a naive local-time diff would yield 2.x days.
    expect(bookingDays("2026-03-07", "2026-03-09")).toBe(3);
  });

  it("returns 0 for an inverted range", () => {
    expect(bookingDays("2026-07-06", "2026-07-04")).toBe(0);
  });
});

describe("bookingTotal", () => {
  it("multiplies inclusive days by the daily price", () => {
    expect(bookingTotal(35, "2026-07-04", "2026-07-06")).toBe(105);
  });
});

describe("rangesOverlap", () => {
  it("detects overlapping ranges", () => {
    expect(rangesOverlap("2026-07-04", "2026-07-08", "2026-07-07", "2026-07-09")).toBe(true);
  });
  it("treats touching endpoints as overlap (same-day handoff blocked)", () => {
    expect(rangesOverlap("2026-07-04", "2026-07-06", "2026-07-06", "2026-07-08")).toBe(true);
  });
  it("returns false for disjoint ranges", () => {
    expect(rangesOverlap("2026-07-04", "2026-07-05", "2026-07-06", "2026-07-07")).toBe(false);
  });
});

describe("conflictingBookings", () => {
  const base = (over: Partial<Booking>): Booking => ({
    id: "b",
    toolId: "t1",
    renterId: "u1",
    ownerId: "u2",
    startDate: "2026-07-04",
    endDate: "2026-07-06",
    days: 3,
    totalPrice: 100,
    status: "confirmed",
    createdAt: "2026-06-01T00:00:00.000Z",
    ...over,
  });

  it("flags an overlapping pending/confirmed booking on the same tool", () => {
    const bookings = [base({ id: "b1", status: "confirmed" })];
    expect(conflictingBookings(bookings, "t1", "2026-07-05", "2026-07-07")).toHaveLength(1);
  });

  it("ignores declined/cancelled/completed bookings", () => {
    const bookings = [
      base({ id: "b1", status: "declined" }),
      base({ id: "b2", status: "cancelled" }),
      base({ id: "b3", status: "completed" }),
    ];
    expect(conflictingBookings(bookings, "t1", "2026-07-05", "2026-07-07")).toHaveLength(0);
  });

  it("ignores bookings for other tools", () => {
    const bookings = [base({ id: "b1", toolId: "t2" })];
    expect(conflictingBookings(bookings, "t1", "2026-07-05", "2026-07-07")).toHaveLength(0);
  });

  it("honors the ignoreId parameter", () => {
    const bookings = [base({ id: "b1" })];
    expect(conflictingBookings(bookings, "t1", "2026-07-05", "2026-07-07", "b1")).toHaveLength(0);
  });
});

describe("hasActiveBookings", () => {
  const base = (over: Partial<Booking>): Booking => ({
    id: "b",
    toolId: "t1",
    renterId: "u1",
    ownerId: "u2",
    startDate: "2026-07-04",
    endDate: "2026-07-06",
    days: 3,
    totalPrice: 100,
    status: "confirmed",
    createdAt: "2026-06-01T00:00:00.000Z",
    ...over,
  });

  it("is true when a pending or confirmed booking exists for the tool", () => {
    expect(hasActiveBookings([base({ status: "pending" })], "t1")).toBe(true);
    expect(hasActiveBookings([base({ status: "confirmed" })], "t1")).toBe(true);
  });

  it("is false when only inactive bookings exist", () => {
    expect(
      hasActiveBookings(
        [base({ status: "completed" }), base({ status: "cancelled" }), base({ status: "declined" })],
        "t1"
      )
    ).toBe(false);
  });

  it("is false for a different tool", () => {
    expect(hasActiveBookings([base({ toolId: "t2", status: "confirmed" })], "t1")).toBe(false);
  });
});

describe("reviewStats", () => {
  const reviews: Review[] = [
    { id: "r1", toolId: "t1", authorId: "u", authorName: "A", rating: 5, comment: "", date: "2026-01-01" },
    { id: "r2", toolId: "t1", authorId: "u", authorName: "B", rating: 4, comment: "", date: "2026-01-02" },
    { id: "r3", toolId: "t2", authorId: "u", authorName: "C", rating: 1, comment: "", date: "2026-01-03" },
  ];

  it("averages only the matching tool's reviews, rounded to 1 decimal", () => {
    expect(reviewStats(reviews, "t1")).toMatchObject({ avg: 4.5, count: 2 });
  });

  it("returns zeroed stats when there are no reviews", () => {
    expect(reviewStats(reviews, "missing")).toMatchObject({ avg: 0, count: 0 });
  });
});

describe("formatCurrency", () => {
  it("formats without decimals and with thousands separators", () => {
    expect(formatCurrency(1500)).toBe("$1,500");
    expect(formatCurrency(7)).toBe("$7");
  });
});
