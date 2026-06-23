"use client";

import Link from "next/link";
import type { Tool } from "@/lib/types";
import { categoryOf } from "@/lib/categories";
import { formatCurrency, reviewStats } from "@/lib/helpers";
import { useStore } from "@/lib/store";
import ToolImage from "./ToolImage";

export default function ToolCard({ tool }: { tool: Tool }) {
  const { reviews, users } = useStore();
  const { avg, count } = reviewStats(reviews, tool.id);
  const cat = categoryOf(tool.category);
  const owner = users.find((u) => u.id === tool.ownerId);

  return (
    <Link
      href={`/tools/${tool.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <ToolImage image={tool.image} category={tool.category} />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur">
          {cat.emoji} {cat.label}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 font-semibold text-slate-900 group-hover:text-emerald-700">
          {tool.title}
        </h3>
        <p className="mt-0.5 text-sm text-slate-500">📍 {tool.location}</p>
        <div className="mt-2 flex items-center gap-1 text-sm">
          {count > 0 ? (
            <>
              <span className="text-amber-400">★</span>
              <span className="font-medium text-slate-700">{avg}</span>
              <span className="text-slate-400">({count})</span>
            </>
          ) : (
            <span className="text-slate-400">No reviews yet</span>
          )}
        </div>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <span className="text-lg font-bold text-slate-900">
              {formatCurrency(tool.pricePerDay)}
            </span>
            <span className="text-sm text-slate-500">/day</span>
          </div>
          {owner && (
            <span className="text-xs text-slate-400">by {owner.name.split(" ")[0]}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
