"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore, DEMO_USER_ID } from "@/lib/store";
import Avatar from "@/components/Avatar";

export default function LoginPage() {
  const { users, login, createAccount } = useStore();
  const router = useRouter();
  const [mode, setMode] = useState<"pick" | "create">("pick");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");

  function signInAs(userId: string) {
    login(userId);
    router.push("/profile");
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    createAccount(name, email, location);
    router.push("/profile");
  }

  // Demo account first, then the other seed personas.
  const demo = users.find((u) => u.id === DEMO_USER_ID);
  const others = users.filter((u) => u.id !== DEMO_USER_ID);

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="text-center">
        <span className="grid mx-auto h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-2xl shadow">
          🛠️
        </span>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Welcome to ToolShare</h1>
        <p className="mt-1 text-slate-500">
          This is a demo — pick an account to explore, no password needed.
        </p>
      </div>

      <div className="mt-6 flex rounded-xl bg-slate-100 p-1 text-sm font-medium">
        <button
          onClick={() => setMode("pick")}
          className={`flex-1 rounded-lg py-2 transition ${
            mode === "pick" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
          }`}
        >
          Use a demo account
        </button>
        <button
          onClick={() => setMode("create")}
          className={`flex-1 rounded-lg py-2 transition ${
            mode === "create" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
          }`}
        >
          Create your own
        </button>
      </div>

      {mode === "pick" ? (
        <div className="mt-5 space-y-2">
          {demo && (
            <button
              onClick={() => signInAs(demo.id)}
              className="flex w-full items-center gap-3 rounded-xl border-2 border-emerald-500 bg-emerald-50 p-3 text-left transition hover:bg-emerald-100"
            >
              <Avatar user={demo} size="md" />
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{demo.name}</p>
                <p className="text-xs text-slate-500">
                  Recommended — has sample rentals
                </p>
              </div>
              <span className="text-emerald-600">→</span>
            </button>
          )}
          {others.map((u) => (
            <button
              key={u.id}
              onClick={() => signInAs(u.id)}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:bg-slate-50"
            >
              <Avatar user={u} size="md" />
              <div className="flex-1">
                <p className="font-medium text-slate-900">{u.name}</p>
                <p className="text-xs text-slate-500">{u.location}</p>
              </div>
              <span className="text-slate-400">→</span>
            </button>
          ))}
        </div>
      ) : (
        <form
          onSubmit={handleCreate}
          className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-white p-5"
        >
          <label className="block">
            <span className="text-sm font-medium text-slate-600">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jordan Smith"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-600">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-600">Location</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </label>
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Create account & continue
          </button>
        </form>
      )}
    </div>
  );
}
