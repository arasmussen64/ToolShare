"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { reviewStats, formatDate } from "@/lib/helpers";
import { useToast } from "./Toast";
import StarRating from "./StarRating";

export default function Reviews({ toolId }: { toolId: string }) {
  const { reviews, currentUser, addReview } = useStore();
  const { toast } = useToast();
  const { avg, count, list } = reviewStats(reviews, toolId);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    addReview(toolId, rating, comment);
    setComment("");
    setRating(5);
    toast("Review posted — thanks for the feedback!");
  }

  return (
    <section className="mt-8">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold text-slate-900">Reviews</h2>
        {count > 0 && (
          <span className="flex items-center gap-1 text-sm text-slate-600">
            <span className="text-amber-400">★</span>
            <span className="font-medium">{avg}</span>
            <span className="text-slate-400">· {count}</span>
          </span>
        )}
      </div>

      {currentUser && (
        <form
          onSubmit={submit}
          className="mt-4 rounded-2xl border border-slate-200 bg-white p-4"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600">Your rating</span>
            <StarRating value={rating} size="lg" onChange={setRating} />
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="Share how the rental went…"
            className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={!comment.trim()}
            className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            Post review
          </button>
        </form>
      )}

      <div className="mt-4 space-y-3">
        {list.length === 0 ? (
          <p className="text-slate-500">No reviews yet. Be the first!</p>
        ) : (
          list.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-900">{r.authorName}</span>
                <span className="text-xs text-slate-400">{formatDate(r.date)}</span>
              </div>
              <div className="mt-1">
                <StarRating value={r.rating} size="sm" />
              </div>
              <p className="mt-2 text-sm text-slate-600">{r.comment}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
