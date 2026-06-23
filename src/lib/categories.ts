import type { CategoryId } from "./types";

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
  /** Tailwind gradient classes for the placeholder tile. */
  gradient: string;
}

export const CATEGORIES: Category[] = [
  { id: "automotive", label: "Automotive", emoji: "🔧", gradient: "from-rose-400 to-red-500" },
  { id: "landscaping", label: "Landscaping", emoji: "🌿", gradient: "from-emerald-400 to-green-600" },
  { id: "power", label: "Power Tools", emoji: "🪚", gradient: "from-amber-400 to-orange-600" },
  { id: "hand", label: "Hand Tools", emoji: "🔨", gradient: "from-slate-400 to-slate-600" },
  { id: "construction", label: "Construction", emoji: "🏗️", gradient: "from-yellow-400 to-amber-600" },
  { id: "heavy", label: "Heavy Equipment", emoji: "🚜", gradient: "from-orange-500 to-amber-700" },
  { id: "painting", label: "Painting", emoji: "🎨", gradient: "from-sky-400 to-blue-600" },
  { id: "cleaning", label: "Cleaning", emoji: "🧽", gradient: "from-cyan-400 to-teal-600" },
  { id: "plumbing", label: "Plumbing", emoji: "🚿", gradient: "from-blue-400 to-indigo-600" },
  { id: "electrical", label: "Electrical", emoji: "⚡", gradient: "from-violet-400 to-purple-600" },
  { id: "outdoor", label: "Outdoor & Camping", emoji: "🏕️", gradient: "from-lime-400 to-emerald-600" },
];

export const CATEGORY_MAP: Record<CategoryId, Category> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<CategoryId, Category>
);

export function categoryOf(id: CategoryId): Category {
  return CATEGORY_MAP[id] ?? CATEGORIES[0];
}
