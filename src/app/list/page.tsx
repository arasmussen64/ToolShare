"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { CATEGORIES, categoryOf } from "@/lib/categories";
import type { CategoryId, Tool } from "@/lib/types";
import ToolImage from "@/components/ToolImage";
import { useToast } from "@/components/Toast";
import { processImageFile } from "@/lib/image";

const CONDITIONS: Tool["condition"][] = ["New", "Like New", "Good", "Fair"];

export default function ListToolPage() {
  const { currentUser, addTool } = useStore();
  const { toast } = useToast();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CategoryId>("power");
  const [description, setDescription] = useState("");
  const [pricePerDay, setPricePerDay] = useState("15");
  const [deposit, setDeposit] = useState("40");
  const [location, setLocation] = useState(currentUser?.location ?? "");
  const [condition, setCondition] = useState<Tool["condition"]>("Good");
  const [photo, setPhoto] = useState<string>("");

  const [processing, setProcessing] = useState(false);

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing(true);
    try {
      setPhoto(await processImageFile(file));
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't process that image.", "error");
    } finally {
      setProcessing(false);
      e.target.value = ""; // allow re-selecting the same file
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;
    const tool = addTool({
      title: title.trim(),
      category,
      description: description.trim(),
      pricePerDay: Math.max(0, Number(pricePerDay) || 0),
      deposit: Math.max(0, Number(deposit) || 0),
      location: location.trim() || currentUser.location,
      condition,
      image: photo || categoryOf(category).emoji,
    });
    if (tool) {
      toast("Listing published!");
      router.push(`/tools/${tool.id}`);
    }
  }

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-5xl">🔐</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Sign in to list a tool</h1>
        <p className="mt-1 text-slate-500">
          You need an account to share your tools with the community.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white hover:bg-emerald-700"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const valid = title.trim().length > 2 && description.trim().length > 5;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900">List a tool</h1>
      <p className="mt-1 text-slate-500">
        Share a tool with your neighbors and earn a little on the side.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Main fields */}
        <div className="space-y-5 md:col-span-2">
          <Field label="Tool name">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cordless Impact Driver"
              className={inputClass}
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryId)}
                className={inputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Condition">
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as Tool["condition"])}
                className={inputClass}
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="What's included? Any tips or quirks renters should know?"
              className={inputClass}
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Price per day ($)">
              <input
                type="number"
                min="0"
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Refundable deposit ($)">
              <input
                type="number"
                min="0"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Pickup location">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State"
              className={inputClass}
            />
          </Field>
        </div>

        {/* Preview + photo */}
        <div className="md:col-span-1">
          <span className="text-sm font-medium text-slate-600">Preview</span>
          <div className="mt-1 aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200">
            <ToolImage image={photo} category={category} />
          </div>
          <label className="mt-3 block cursor-pointer rounded-lg border border-dashed border-slate-300 bg-white px-3 py-3 text-center text-sm text-slate-500 hover:border-emerald-400 hover:text-emerald-600">
            {processing
              ? "Processing…"
              : photo
                ? "Change photo"
                : "📷 Upload a photo (optional)"}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              disabled={processing}
              className="hidden"
            />
          </label>
          {photo && (
            <button
              type="button"
              onClick={() => setPhoto("")}
              className="mt-2 w-full text-xs text-slate-400 hover:text-rose-500"
            >
              Remove photo (use category icon)
            </button>
          )}

          <button
            type="submit"
            disabled={!valid}
            className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Publish listing
          </button>
        </div>
      </form>
    </div>
  );
}

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}
