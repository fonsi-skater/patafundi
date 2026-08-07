import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/homepage/Hero";
import TrustBadges from "@/components/homepage/TrustBadges";
import WhyDifferent from "@/components/homepage/WhyDifferent";
import Testimonials from "@/components/homepage/Testimonials";
import ServiceAreaMap from "@/components/homepage/ServiceAreaMap";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <TrustBadges />
      <WhyDifferent />
      <Testimonials />
      <ServiceAreaMap />
      <Footer />
    </main>
  );
}
