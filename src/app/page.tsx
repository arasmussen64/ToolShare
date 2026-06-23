"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/categories";
import type { CategoryId } from "@/lib/types";
import ToolCard from "@/components/ToolCard";

type SortKey = "recent" | "priceLow" | "priceHigh";

export default function BrowsePage() {
  const { tools, currentUser } = useStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [sort, setSort] = useState<SortKey>("recent");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = tools.filter((t) => {
      const matchesCat = category === "all" || t.category === category;
      const matchesQuery =
        q === "" ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
    list = [...list].sort((a, b) => {
      if (sort === "priceLow") return a.pricePerDay - b.pricePerDay;
      if (sort === "priceHigh") return b.pricePerDay - a.pricePerDay;
      return b.createdAt.localeCompare(a.createdAt);
    });
    return list;
  }, [tools, query, category, sort]);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-br from-emerald-600 to-teal-700">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center text-white">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Rent tools &amp; equipment from your neighbors
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-emerald-50">
            From a cordless drill to a full-size backhoe — borrow what you need for
            the job, and earn from the gear sitting idle in your garage or yard.
          </p>
          <div className="mx-auto mt-7 flex max-w-xl items-center gap-2 rounded-2xl bg-white p-2 shadow-lg">
            <span className="pl-3 text-xl">🔍</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search tools and equipment"
              placeholder="Search drills, mowers, excavators, skid steers…"
              className="flex-1 bg-transparent px-2 py-2 text-slate-900 outline-none placeholder:text-slate-400"
            />
            {!currentUser && (
              <Link
                href="/login"
                className="hidden rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 sm:block"
              >
                Get started
              </Link>
            )}
          </div>
          <p className="mt-4 text-sm font-medium text-emerald-50">
            🛠️ {tools.length} tools &amp; machines · {CATEGORIES.length} categories ·
            from $7/day
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Category pills — horizontal scroll on mobile, wrap on larger screens */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setCategory("all")}
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
              category === "all"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
            }`}
          >
            All tools
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                category === c.id
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
              }`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        {/* Result header + sort */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {filtered.length} {filtered.length === 1 ? "tool" : "tools"} available
          </p>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sort tools"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="recent">Newest first</option>
            <option value="priceLow">Price: low to high</option>
            <option value="priceHigh">Price: high to low</option>
          </select>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-5xl">🧰</p>
            <p className="mt-4 text-lg font-medium text-slate-700">No tools found</p>
            <p className="mt-1 text-slate-500">
              Try a different search or category.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
