import dynamic from "next/dynamic";
import Hero from "@/components/homepage/Hero";
import TrustBadges from "@/components/homepage/TrustBadges";
import WhyDifferent from "@/components/homepage/WhyDifferent";
import Testimonials from "@/components/homepage/Testimonials";

// Leaflet touches `window` directly, which doesn't exist during Next.js's
// server-side build/render step. ssr: false tells Next.js to only ever
// render this component in the browser, never on the server.
const ServiceAreaMap = dynamic(
  () => import("@/components/homepage/ServiceAreaMap"),
  { ssr: false }
);

export default function HomePage() {
  return (
    <main>
      <Hero />
      <TrustBadges />
      <WhyDifferent />
      <Testimonials />
      <ServiceAreaMap />
    </main>
  );
}
