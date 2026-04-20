"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import LogoutButton from "../components/LogoutButton";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession(); // ✅ ambil session di client

  return (
    <>
      <nav className="fixed top-4 left-4 right-4 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="air-card px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#ff385c]">
                  <span className="text-white font-bold text-xl">F</span>
                </div>
                <div>
                  <h1 className="font-bold text-xl text-[#222222] tracking-[-0.18px]">
                    Fafa Rasa ERP
                  </h1>
                  <p className="text-xs text-[#6a6a6a] -mt-1">Management System</p>
                </div>
              </div>

              <div className="hidden lg:flex items-center space-x-1">
                <NavLink href="/dashboard">Dashboard</NavLink>
                <NavLink href="/producers">Produsen</NavLink>
                <NavLink href="/cakes">Kue</NavLink>
                <NavLink href="/stock-in">Stok Pagi</NavLink>
                <NavLink href="/stock-out">Stok Sore</NavLink>
                <NavLink href="/stock">Rekap Stok</NavLink>
                <NavLink href="/rekap-penjualan">Rekap</NavLink>
                <NavLink href="/change-credential">Admin</NavLink>
                {session && <LogoutButton />}
              </div>

              <button
                className="lg:hidden p-2 rounded-full bg-[#f2f2f2] hover:shadow-md transition-all"
                onClick={() => setMobileMenuOpen((open) => !open)}
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                <svg className="w-6 h-6 text-[#222222]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {mobileMenuOpen && (
              <div className="lg:hidden mt-4 pt-4 border-t border-[#ececec]">
                <div className="grid grid-cols-2 gap-2">
                  <MobileNavLink href="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</MobileNavLink>
                  <MobileNavLink href="/producers" onClick={() => setMobileMenuOpen(false)}>Produsen</MobileNavLink>
                  <MobileNavLink href="/cakes" onClick={() => setMobileMenuOpen(false)}>Kue</MobileNavLink>
                  <MobileNavLink href="/stock-in" onClick={() => setMobileMenuOpen(false)}>Stok Pagi</MobileNavLink>
                  <MobileNavLink href="/stock-out" onClick={() => setMobileMenuOpen(false)}>Stok Sore</MobileNavLink>
                  <MobileNavLink href="/stock" onClick={() => setMobileMenuOpen(false)}>Rekap Stok</MobileNavLink>
                  <MobileNavLink href="/rekap-penjualan" onClick={() => setMobileMenuOpen(false)}>Rekap Penjualan</MobileNavLink>
                  <MobileNavLink href="/change-credential" onClick={() => setMobileMenuOpen(false)}>Admin</MobileNavLink>
                  {session && <LogoutButton />}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative px-4 py-2 text-sm font-medium text-[#222222] hover:text-[#ff385c] rounded-full transition-all duration-300 hover:bg-[#f2f2f2]"
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 rounded-full bg-[#f2f2f2] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </Link>
  );
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-3 text-sm font-medium text-[#222222] hover:text-[#ff385c] rounded-full transition-all duration-300 hover:bg-[#f2f2f2] text-center"
    >
      {children}
    </Link>
  );
}
