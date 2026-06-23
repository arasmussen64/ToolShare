import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ToolShare — Rent tools from your neighbors",
  description:
    "A peer-to-peer marketplace to rent and lend tools of every kind — automotive, landscaping, power tools, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 text-slate-900">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-400">
              ToolShare — a demo peer-to-peer tool rental marketplace. All data is
              mock and stored locally in your browser.
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
