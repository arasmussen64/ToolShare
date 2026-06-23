"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { categoryOf } from "@/lib/categories";
import { formatCurrency } from "@/lib/helpers";
import ToolImage from "@/components/ToolImage";
import BookingWidget from "@/components/BookingWidget";
import Reviews from "@/components/Reviews";
import Avatar from "@/components/Avatar";

export default function ToolDetailPage() {
  const params = useParams<{ id: string }>();
  const { tools, users, currentUser } = useStore();
  const tool = tools.find((t) => t.id === params.id);

  if (!tool) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <p className="text-5xl">🔍</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Tool not found</h1>
        <p className="mt-1 text-slate-500">
          It may have been removed, or the link is incorrect.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white hover:bg-emerald-700"
        >
          Back to browse
        </Link>
      </div>
    );
  }

  const owner = users.find((u) => u.id === tool.ownerId);
  const cat = categoryOf(tool.category);
  const isOwner = currentUser?.id === tool.ownerId;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-24 lg:pb-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
      >
        ← Back to browse
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left: image + details */}
        <div className="lg:col-span-2">
          <div className="aspect-[16/10] overflow-hidden rounded-2xl border border-slate-200">
            <ToolImage
              image={tool.image}
              category={tool.category}
              emojiSize="text-8xl"
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              {cat.emoji} {cat.label}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              Condition: {tool.condition}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              📍 {tool.location}
            </span>
          </div>

          <h1 className="mt-3 text-3xl font-bold text-slate-900">{tool.title}</h1>
          <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-600">
            {tool.description}
          </p>

          {/* Owner */}
          {owner && (
            <div className="mt-6 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
              <Avatar user={owner} size="lg" />
              <div>
                <p className="font-semibold text-slate-900">{owner.name}</p>
                <p className="text-sm text-slate-500">
                  {owner.location} · Member since {owner.joinedYear}
                </p>
                <p className="mt-1 text-sm text-slate-600">{owner.bio}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: sticky booking */}
        <div className="lg:col-span-1">
          <div id="book" className="scroll-mt-20 lg:sticky lg:top-20">
            <BookingWidget tool={tool} />
            <p className="mt-3 text-center text-xs text-slate-400">
              You won&apos;t be charged — this is a demo. Deposit{" "}
              {formatCurrency(tool.deposit)} is illustrative only.
            </p>
          </div>
        </div>
      </div>

      {/* Reviews span full width below both columns */}
      <div className="lg:max-w-2xl">
        <Reviews toolId={tool.id} />
      </div>

      {/* Mobile sticky booking bar */}
      {!isOwner && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div>
              <span className="text-lg font-bold text-slate-900">
                {formatCurrency(tool.pricePerDay)}
              </span>
              <span className="text-sm text-slate-500">/day</span>
            </div>
            <a
              href="#book"
              className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              {currentUser ? "Request to book" : "Sign in to book"}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
