"use client";

import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-green-50 via-white to-emerald-50 text-gray-900 min-h-screen`}
      >
        {/* Navigation Bar */}
        <nav className="fixed top-4 left-4 right-4 z-50">
          <div className="max-w-7xl mx-auto">
            <div className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-2xl shadow-2xl shadow-green-500/10 px-6 py-4">
              <div className="flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">F</span>
                  </div>
                  <div>
                    <h1 className="font-bold text-xl bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                      Fafa Rasa ERP
                    </h1>
                    <p className="text-xs text-gray-500 -mt-1">Management System</p>
                  </div>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center space-x-1">
                  <NavLink href="/dashboard">Dashboard</NavLink>
                  <NavLink href="/producers">Produsen</NavLink>
                  <NavLink href="/cakes">Kue</NavLink>
                  <NavLink href="/stock-in">Stok Pagi</NavLink>
                  <NavLink href="/stock-out">Stok Sore</NavLink>
                  <NavLink href="/stock">Rekap Stok</NavLink>
                  <NavLink href="/rekap-penjualan">Rekap</NavLink>
                </div>

                {/* Mobile Menu Button */}
                <button
                  className="lg:hidden p-2 rounded-xl bg-green-100 hover:bg-green-200 transition-colors"
                  onClick={() => setMobileMenuOpen((open) => !open)}
                  aria-label="Toggle menu"
                  aria-expanded={mobileMenuOpen}
                >
                  <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

              {/* Mobile Navigation (toggleable) */}
              {mobileMenuOpen && (
                <div className="lg:hidden mt-4 pt-4 border-t border-gray-200/50">
                  <div className="grid grid-cols-2 gap-2">
                    <MobileNavLink href="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</MobileNavLink>
                    <MobileNavLink href="/producers" onClick={() => setMobileMenuOpen(false)}>Produsen</MobileNavLink>
                    <MobileNavLink href="/cakes" onClick={() => setMobileMenuOpen(false)}>Kue</MobileNavLink>
                    <MobileNavLink href="/stock-in" onClick={() => setMobileMenuOpen(false)}>Stok Pagi</MobileNavLink>
                    <MobileNavLink href="/stock-out" onClick={() => setMobileMenuOpen(false)}>Stok Sore</MobileNavLink>
                    <MobileNavLink href="/stock" onClick={() => setMobileMenuOpen(false)}>Rekap Stok</MobileNavLink>
                    <MobileNavLink href="/rekap-penjualan" onClick={() => setMobileMenuOpen(false)}>Rekap Penjualan</MobileNavLink>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-28 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}

// Desktop Navigation Link Component
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-700 rounded-xl transition-all duration-300 hover:bg-green-50/80"
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </Link>
  );
}

// Mobile Navigation Link Component
function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-green-700 rounded-xl transition-all duration-300 hover:bg-green-50/80 text-center"
    >
      {children}
    </Link>
  );
} 