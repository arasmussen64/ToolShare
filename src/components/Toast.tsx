"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

type ToastType = "success" | "info" | "error";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, string> = {
  success: "✅",
  info: "ℹ️",
  error: "⚠️",
};

const RING: Record<ToastType, string> = {
  success: "ring-emerald-200",
  info: "ring-slate-200",
  error: "ring-rose-200",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = counter.current++;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end"
        aria-live="polite"
        role="status"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-lg ring-1 ${RING[t.type]} animate-[toastIn_0.2s_ease-out]`}
          >
            <span className="text-base">{ICONS[t.type]}</span>
            <span className="flex-1">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
