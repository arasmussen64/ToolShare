"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useToast } from "./Toast";
import Avatar from "./Avatar";

export default function Header() {
  const { currentUser, bookings, logout, hydrated } = useStore();
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const incoming = currentUser
    ? bookings.filter((b) => b.ownerId === currentUser.id && b.status === "pending").length
    : 0;

  function handleSignOut() {
    logout();
    setMenuOpen(false);
    toast("Signed out.", "info");
    router.push("/");
  }

  const links: { href: string; label: string; badge?: number; show: boolean }[] = [
    { href: "/", label: "Browse", show: true },
    { href: "/list", label: "List a Tool", show: true },
    { href: "/profile", label: "Dashboard", badge: incoming, show: !!currentUser },
  ];

  const desktopLink = (href: string, label: string, badge?: number) => {
    const active = pathname === href;
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? "page" : undefined}
        className={`relative rounded-lg px-3 py-2 text-sm font-medium transition ${
          active
            ? "bg-emerald-50 text-emerald-700"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        {label}
        {badge ? (
          <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            {badge}
          </span>
        ) : null}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-lg shadow-sm">
            🛠️
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Tool<span className="text-emerald-600">Share</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {links
            .filter((l) => l.show)
            .map((l) => desktopLink(l.href, l.label, l.badge))}
        </nav>

        <div className="flex items-center gap-2">
          {!hydrated ? (
            <div className="h-9 w-20 animate-pulse rounded-lg bg-slate-100" />
          ) : currentUser ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center gap-2"
                onClick={() => setMenuOpen(false)}
              >
                <Avatar user={currentUser} size="md" />
                <span className="hidden text-sm font-medium text-slate-700 md:block">
                  {currentUser.name.split(" ")[0]}
                </span>
              </Link>
              <button
                onClick={handleSignOut}
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 sm:block"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              Sign in
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 sm:hidden"
          >
            <span className="text-xl leading-none">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 sm:hidden">
          <div className="flex flex-col gap-1">
            {links
              .filter((l) => l.show)
              .map((l) => {
                const active = pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium ${
                      active
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {l.label}
                    {l.badge ? (
                      <span className="grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                        {l.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            {currentUser && (
              <button
                onClick={handleSignOut}
                className="mt-1 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-500 hover:bg-slate-100"
              >
                Sign out
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
