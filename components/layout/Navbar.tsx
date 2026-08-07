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
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-16 py-6">
      <div className="text-white font-display font-bold text-xl tracking-tight">
        Pata<span className="text-gold">Fundi</span>
      </div>

      <nav className="hidden md:flex items-center gap-8 text-sm text-white/90">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-gold transition-colors">
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <Link
          href="/register-client"
          className="hidden sm:inline-flex bg-gold hover:bg-gold-dark text-ink font-semibold text-sm px-5 py-2.5 rounded-card transition-colors"
        >
          Post a Job
        </Link>
      </div>
    </header>
  );
}
