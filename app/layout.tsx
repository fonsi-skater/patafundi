import type { Metadata } from "next";
import "../styles/globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Patakazi — Verified Workers, Safe Payments, Real Reviews",
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
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
