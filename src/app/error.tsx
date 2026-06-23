"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("ToolShare encountered an error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-5xl">🧰</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">
        Something went wrong
      </h1>
      <p className="mt-1 text-slate-500">
        An unexpected error occurred. You can try again or head back to browsing.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white hover:bg-emerald-700"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-xl bg-white px-5 py-2.5 font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
        >
          Back to browse
        </Link>
      </div>
    </div>
  );
}
