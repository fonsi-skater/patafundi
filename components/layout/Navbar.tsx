import Link from "next/link";

const links = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Find a Fundi", href: "/search-workers" },
  { label: "Become a Fundi", href: "/register-worker" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-navy border-b border-white/10 flex items-center justify-between px-6 md:px-16 py-4">
      <Link href="/" className="text-white font-display font-bold text-xl tracking-tight">
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
          className="bg-gold hover:bg-gold-dark text-ink font-semibold text-sm px-4 py-2 rounded-card transition-colors"
        >
          Post a Job
        </Link>
      </div>
    </header>
  );
}
