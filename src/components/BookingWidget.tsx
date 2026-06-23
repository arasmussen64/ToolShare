"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Tool } from "@/lib/types";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";
import {
  bookingDays,
  conflictingBookings,
  formatCurrency,
  formatDate,
  todayISO,
} from "@/lib/helpers";

export default function BookingWidget({ tool }: { tool: Tool }) {
  const { currentUser, bookings, requestBooking } = useStore();
  const { toast } = useToast();
  const router = useRouter();

  const today = todayISO();
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(today);
  const [done, setDone] = useState<null | { days: number; total: number }>(null);

  const isOwner = currentUser?.id === tool.ownerId;

  // Upcoming holds on this tool, for showing the renter what's taken.
  const upcoming = useMemo(
    () =>
      bookings
        .filter(
          (b) =>
            b.toolId === tool.id &&
            (b.status === "pending" || b.status === "confirmed") &&
            b.endDate >= today
        )
        .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [bookings, tool.id, today]
  );

  const validRange = start <= end && start >= today;
  const conflicts = useMemo(
    () => (validRange ? conflictingBookings(bookings, tool.id, start, end) : []),
    [bookings, tool.id, start, end, validRange]
  );

  const days = useMemo(
    () => (validRange ? bookingDays(start, end) : 0),
    [start, end, validRange]
  );

  const total = days * tool.pricePerDay;

  function handleSubmit() {
    if (!currentUser || !validRange || conflicts.length > 0) return;
    const booking = requestBooking({ toolId: tool.id, startDate: start, endDate: end });
    if (booking) {
      setDone({ days: booking.days, total: booking.totalPrice });
    } else {
      // The store rejected it (e.g. a booking landed first). Keep the user informed.
      toast("Those dates are no longer available — please pick another range.", "error");
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-4xl">✅</p>
        <h3 className="mt-2 text-lg font-semibold text-emerald-900">
          Request sent!
        </h3>
        <p className="mt-1 text-sm text-emerald-800">
          {done.days} {done.days === 1 ? "day" : "days"} ·{" "}
          {formatCurrency(done.total)} total. The owner will review your request.
        </p>
        <button
          onClick={() => router.push("/profile")}
          className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white hover:bg-emerald-700"
        >
          View my rentals
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-slate-900">
          {formatCurrency(tool.pricePerDay)}
        </span>
        <span className="text-slate-500">/ day</span>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        {formatCurrency(tool.deposit)} refundable deposit
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-medium text-slate-500">Start</span>
          <input
            type="date"
            min={today}
            value={start}
            onChange={(e) => {
              setStart(e.target.value);
              if (e.target.value > end) setEnd(e.target.value);
            }}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-500">End</span>
          <input
            type="date"
            min={start}
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </label>
      </div>

      {validRange && days > 0 && (
        <div className="mt-4 space-y-1 border-t border-slate-100 pt-4 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>
              {formatCurrency(tool.pricePerDay)} × {days}{" "}
              {days === 1 ? "day" : "days"}
            </span>
            <span>{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      )}

      {/* Conflict / validity messaging */}
      {!validRange && (
        <p className="mt-3 text-sm text-rose-600">
          Please pick a valid date range starting today or later.
        </p>
      )}
      {validRange && conflicts.length > 0 && (
        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          ⚠️ Those dates overlap an existing booking ({formatDate(conflicts[0].startDate)} –{" "}
          {formatDate(conflicts[0].endDate)}). Try different dates.
        </p>
      )}

      {/* Action */}
      <div className="mt-4">
        {!currentUser ? (
          <Link
            href="/login"
            className="block w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-center font-semibold text-white hover:bg-emerald-700"
          >
            Sign in to book
          </Link>
        ) : isOwner ? (
          <p className="rounded-lg bg-slate-100 px-3 py-2.5 text-center text-sm text-slate-500">
            This is your tool — manage requests in your dashboard.
          </p>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!validRange || conflicts.length > 0}
            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Request to book
          </button>
        )}
      </div>

      {/* Existing holds */}
      {upcoming.length > 0 && (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Currently booked
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {upcoming.map((b) => (
              <li key={b.id} className="flex items-center gap-2">
                <span className="text-slate-400">📅</span>
                {formatDate(b.startDate)} – {formatDate(b.endDate)}
                <span className="text-xs text-slate-400">({b.status})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
