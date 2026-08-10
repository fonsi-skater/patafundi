"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Find a Fundi", href: "/search-workers" },
  { label: "Become a Fundi", href: "/register-worker" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-navy border-b border-white/10">
      <div className="flex items-center justify-between px-6 md:px-16 py-4">
        <Link href="/" className="flex items-center gap-2 text-white font-display font-bold text-xl tracking-tight">
          <img src="/logo-mark.svg" alt="PataFundi" className="w-8 h-8" />
          Pata<span className="text-gold">Fundi</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm text-white/80">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-gold transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex text-white/80 hover:text-white text-sm transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/register-client"
            className="hidden sm:inline-flex bg-gold hover:bg-gold-dark text-ink font-semibold text-sm px-4 py-2 rounded-card transition-colors"
          >
            Post a Job
          </Link>

          {/* Mobile menu toggle — only visible below md, since the full
              nav + buttons above are hidden there */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden text-white p-1"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown panel */}
      {open && (
        <div className="md:hidden bg-navy-light border-t border-white/10 px-6 py-4 flex flex-col gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-white/90 text-sm hover:text-gold transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="text-white/80 text-sm hover:text-white transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/register-client"
              onClick={() => setOpen(false)}
              className="bg-gold hover:bg-gold-dark text-ink font-semibold text-sm px-4 py-2.5 rounded-card text-center transition-colors"
            >
              Post a Job
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
