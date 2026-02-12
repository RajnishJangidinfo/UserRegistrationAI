"use client"

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { usePathname } from "next/navigation";
import { CartProvider } from "@/context/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isStandalonePage = pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/books/add" ||
    (/^\/books\/\d+$/.test(pathname));

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <CartProvider>
          <div className="flex min-h-screen">
            {!isStandalonePage && <Sidebar />}
            <main className={isStandalonePage ? "flex-1 transition-all duration-300" : "flex-1 md:pl-64 transition-all duration-300"}>
              {children}
            </main>
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
