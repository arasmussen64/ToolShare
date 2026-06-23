import type { Booking, Review } from "./types";

export function formatCurrency(n: number): string {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function formatDate(iso: string): string {
  // iso may be a yyyy-mm-dd date or a full ISO string.
  const d = iso.length <= 10 ? new Date(iso + "T00:00:00") : new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function reviewStats(reviews: Review[], toolId: string) {
  const list = reviews.filter((r) => r.toolId === toolId);
  if (list.length === 0) return { avg: 0, count: 0, list };
  const avg = list.reduce((s, r) => s + r.rating, 0) / list.length;
  return { avg: Math.round(avg * 10) / 10, count: list.length, list };
}

/** Bookings that hold the tool (pending/confirmed) and overlap the range. */
export function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}

export function conflictingBookings(
  bookings: Booking[],
  toolId: string,
  start: string,
  end: string,
  ignoreId?: string
): Booking[] {
  return bookings.filter(
    (b) =>
      b.toolId === toolId &&
      b.id !== ignoreId &&
      (b.status === "pending" || b.status === "confirmed") &&
      rangesOverlap(start, end, b.startDate, b.endDate)
  );
}

export const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 ring-amber-200",
  confirmed: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  declined: "bg-rose-100 text-rose-700 ring-rose-200",
  cancelled: "bg-slate-100 text-slate-600 ring-slate-200",
  completed: "bg-sky-100 text-sky-800 ring-sky-200",
};
