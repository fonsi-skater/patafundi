import { Star } from "lucide-react";
import { testimonials } from "@/lib/mock-data";

export default function Testimonials() {
  return (
    <section className="bg-navy section">
      <h2 className="text-white text-2xl md:text-3xl font-display font-bold text-center mb-12">
        Trusted by clients and fundis across the country
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div key={t.name} className="bg-navy-light rounded-card p-6 border border-white/10">
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-gold text-gold" />
              ))}
            </div>
            <p className="text-white/80 text-sm leading-relaxed mb-5">"{t.quote}"</p>
            <div>
              <p className="text-white text-sm font-semibold">{t.name}</p>
              <p className="text-white/50 text-xs">{t.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
