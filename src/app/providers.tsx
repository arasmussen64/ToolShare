"use client";

import { StoreProvider } from "@/lib/store";
import { ToastProvider } from "@/components/Toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <StoreProvider>{children}</StoreProvider>
    </ToastProvider>
  );
}
