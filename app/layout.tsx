import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "PataFundi — Verified Fundis, Safe Payments, Real Reviews",
  description:
    "Find trusted, verified artisans and domestic workers near you. Rated by real clients, protected by secure payments.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
