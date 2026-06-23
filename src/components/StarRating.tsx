"use client";

interface StarRatingProps {
  value: number;
  size?: "sm" | "md" | "lg";
  /** When set, renders interactive buttons and calls onChange. */
  onChange?: (value: number) => void;
}

const SIZES = { sm: "text-sm", md: "text-base", lg: "text-2xl" };

export default function StarRating({ value, size = "md", onChange }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];
  const interactive = typeof onChange === "function";

  return (
    <div className={`inline-flex items-center gap-0.5 ${SIZES[size]}`}>
      {stars.map((s) => {
        const filled = s <= Math.round(value);
        const star = (
          <span className={filled ? "text-amber-400" : "text-slate-300"}>★</span>
        );
        if (!interactive) return <span key={s}>{star}</span>;
        return (
          <button
            key={s}
            type="button"
            onClick={() => onChange?.(s)}
            className="transition-transform hover:scale-110"
            aria-label={`${s} star${s > 1 ? "s" : ""}`}
          >
            {star}
          </button>
        );
      })}
    </div>
  );
}
