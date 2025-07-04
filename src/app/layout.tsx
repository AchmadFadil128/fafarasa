import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900 min-h-screen`}
      >
        <nav className="w-full bg-green-700 text-white px-4 py-3 flex flex-wrap items-center justify-between shadow-md sticky top-0 z-20">
          <div className="font-bold text-lg tracking-wide">Fafa Rasa ERP</div>
          <div className="flex gap-2 flex-wrap mt-2 md:mt-0">
            <Link href="/dashboard" className="px-3 py-1 rounded hover:bg-green-800 transition">Dashboard</Link>
            <Link href="/producers" className="px-3 py-1 rounded hover:bg-green-800 transition">Produsen</Link>
            <Link href="/cakes" className="px-3 py-1 rounded hover:bg-green-800 transition">Kue</Link>
            <Link href="/stock-in" className="px-3 py-1 rounded hover:bg-green-800 transition">Stok Pagi</Link>
            <Link href="/stock-out" className="px-3 py-1 rounded hover:bg-green-800 transition">Stok Sore</Link>
            <Link href="/stock" className="px-3 py-1 rounded hover:bg-green-800 transition">Rekap Stok</Link>
          </div>
        </nav>
        <main className="p-2 sm:p-4 md:p-8 max-w-5xl mx-auto w-full">{children}</main>
      </body>
    </html>
  );
}
