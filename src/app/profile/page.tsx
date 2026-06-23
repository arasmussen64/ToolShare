"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import type { Booking, BookingStatus, CategoryId } from "@/lib/types";
import { formatCurrency, formatDate, STATUS_STYLES } from "@/lib/helpers";
import Avatar from "@/components/Avatar";
import ToolImage from "@/components/ToolImage";
import { useToast } from "@/components/Toast";
import type { BookingStatus as BStatus } from "@/lib/types";

type Tab = "rentals" | "requests" | "listings";

const STATUS_TOAST: Partial<Record<BStatus, string>> = {
  confirmed: "Booking confirmed — the renter has been notified.",
  declined: "Request declined.",
  completed: "Marked as completed.",
  cancelled: "Booking cancelled.",
};

export default function ProfilePage() {
  const { currentUser, tools, bookings, users, setBookingStatus, hydrated } =
    useStore();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("rentals");

  const updateStatus = (id: string, status: BStatus) => {
    setBookingStatus(id, status);
    const msg = STATUS_TOAST[status];
    if (msg) toast(msg, status === "declined" ? "error" : "success");
  };

  const myRentals = useMemo(
    () =>
      currentUser
        ? bookings
            .filter((b) => b.renterId === currentUser.id)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        : [],
    [bookings, currentUser]
  );
  const incoming = useMemo(
    () =>
      currentUser
        ? bookings
            .filter((b) => b.ownerId === currentUser.id)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        : [],
    [bookings, currentUser]
  );
  const myListings = useMemo(
    () => (currentUser ? tools.filter((t) => t.ownerId === currentUser.id) : []),
    [tools, currentUser]
  );

  const pendingRequests = incoming.filter((b) => b.status === "pending").length;

  if (!hydrated) {
    return <div className="mx-auto max-w-5xl px-4 py-10 text-slate-400">Loading…</div>;
  }

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-5xl">👋</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">You&apos;re signed out</h1>
        <p className="mt-1 text-slate-500">Sign in to see your rentals and listings.</p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white hover:bg-emerald-700"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const toolFor = (b: Booking) => tools.find((t) => t.id === b.toolId);
  const userFor = (id: string) => users.find((u) => u.id === id);

  const tabBtn = (key: Tab, label: string, badge?: number) => (
    <button
      onClick={() => setTab(key)}
      className={`relative rounded-lg px-4 py-2 text-sm font-medium transition ${
        tab === key
          ? "bg-slate-900 text-white"
          : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
      }`}
    >
      {label}
      {badge ? (
        <span className="ml-2 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
          {badge}
        </span>
      ) : null}
    </button>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Profile header */}
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center">
        <Avatar user={currentUser} size="lg" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{currentUser.name}</h1>
          <p className="text-sm text-slate-500">
            📍 {currentUser.location} · Member since {currentUser.joinedYear}
          </p>
          <p className="mt-1 text-sm text-slate-600">{currentUser.bio}</p>
        </div>
        <Link
          href="/list"
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          + List a tool
        </Link>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {tabBtn("rentals", `My Rentals (${myRentals.length})`)}
        {tabBtn("requests", "Incoming Requests", pendingRequests)}
        {tabBtn("listings", `My Listings (${myListings.length})`)}
      </div>

      <div className="mt-5">
        {tab === "rentals" && (
          <BookingList
            empty="You haven't rented anything yet. Browse tools to get started."
            bookings={myRentals}
            render={(b) => {
              const tool = toolFor(b);
              const owner = userFor(b.ownerId);
              return (
                <BookingCard
                  key={b.id}
                  booking={b}
                  toolTitle={tool?.title ?? "Removed tool"}
                  toolId={b.toolId}
                  toolImage={tool?.image ?? "🧰"}
                  toolCategory={tool?.category ?? "hand"}
                  subtitle={`Owner: ${owner?.name ?? "Unknown"}`}
                  actions={
                    b.status === "pending" || b.status === "confirmed" ? (
                      <ActionBtn
                        label="Cancel"
                        tone="ghost"
                        onClick={() => updateStatus(b.id, "cancelled")}
                      />
                    ) : null
                  }
                />
              );
            }}
          />
        )}

        {tab === "requests" && (
          <BookingList
            empty="No booking requests yet. Once someone requests one of your tools, it'll show up here."
            bookings={incoming}
            render={(b) => {
              const tool = toolFor(b);
              const renter = userFor(b.renterId);
              return (
                <BookingCard
                  key={b.id}
                  booking={b}
                  toolTitle={tool?.title ?? "Removed tool"}
                  toolId={b.toolId}
                  toolImage={tool?.image ?? "🧰"}
                  toolCategory={tool?.category ?? "hand"}
                  subtitle={`Requested by: ${renter?.name ?? "Unknown"}`}
                  actions={
                    <>
                      {b.status === "pending" && (
                        <>
                          <ActionBtn
                            label="Confirm"
                            tone="primary"
                            onClick={() => updateStatus(b.id, "confirmed")}
                          />
                          <ActionBtn
                            label="Decline"
                            tone="danger"
                            onClick={() => updateStatus(b.id, "declined")}
                          />
                        </>
                      )}
                      {b.status === "confirmed" && (
                        <ActionBtn
                          label="Mark completed"
                          tone="ghost"
                          onClick={() => updateStatus(b.id, "completed")}
                        />
                      )}
                    </>
                  }
                />
              );
            }}
          />
        )}

        {tab === "listings" && (
          <>
            {myListings.length === 0 ? (
              <EmptyState text="You haven't listed any tools yet.">
                <Link
                  href="/list"
                  className="mt-4 inline-block rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white hover:bg-emerald-700"
                >
                  List your first tool
                </Link>
              </EmptyState>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {myListings.map((t) => {
                  const reqs = bookings.filter(
                    (b) => b.toolId === t.id && b.status === "pending"
                  ).length;
                  return (
                    <Link
                      key={t.id}
                      href={`/tools/${t.id}`}
                      className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-3 transition hover:shadow-md"
                    >
                      <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl">
                        <ToolImage
                          image={t.image}
                          category={t.category}
                          emojiSize="text-3xl"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-slate-900">
                          {t.title}
                        </p>
                        <p className="text-sm text-slate-500">
                          {formatCurrency(t.pricePerDay)}/day
                        </p>
                        {reqs > 0 && (
                          <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                            {reqs} pending request{reqs > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function BookingList({
  bookings,
  render,
  empty,
}: {
  bookings: Booking[];
  render: (b: Booking) => React.ReactNode;
  empty: string;
}) {
  if (bookings.length === 0) return <EmptyState text={empty} />;
  return <div className="space-y-3">{bookings.map(render)}</div>;
}

function BookingCard({
  booking,
  toolTitle,
  toolId,
  toolImage,
  toolCategory,
  subtitle,
  actions,
}: {
  booking: Booking;
  toolTitle: string;
  toolId: string;
  toolImage: string;
  toolCategory: CategoryId;
  subtitle: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
      <Link href={`/tools/${toolId}`} className="h-16 w-20 shrink-0 overflow-hidden rounded-xl">
        <ToolImage image={toolImage} category={toolCategory} emojiSize="text-2xl" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            href={`/tools/${toolId}`}
            className="truncate font-semibold text-slate-900 hover:text-emerald-700"
          >
            {toolTitle}
          </Link>
          <StatusBadge status={booking.status} />
        </div>
        <p className="text-sm text-slate-500">{subtitle}</p>
        <p className="mt-0.5 text-sm text-slate-600">
          {formatDate(booking.startDate)} – {formatDate(booking.endDate)} ·{" "}
          {booking.days} {booking.days === 1 ? "day" : "days"} ·{" "}
          <span className="font-medium text-slate-900">
            {formatCurrency(booking.totalPrice)}
          </span>
        </p>
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

function ActionBtn({
  label,
  onClick,
  tone,
}: {
  label: string;
  onClick: () => void;
  tone: "primary" | "danger" | "ghost";
}) {
  const styles = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700",
    danger: "bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100",
    ghost: "bg-slate-100 text-slate-600 hover:bg-slate-200",
  };
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${styles[tone]}`}
    >
      {label}
    </button>
  );
}

function EmptyState({ text, children }: { text: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
      <p className="text-4xl">🗂️</p>
      <p className="mt-3 text-slate-500">{text}</p>
      {children}
    </div>
  );
}
