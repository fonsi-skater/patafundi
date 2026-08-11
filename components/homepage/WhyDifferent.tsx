import { whyDifferent } from "@/lib/mock-data";

export default function WhyDifferent() {
  return (
    <section className="section bg-offwhite">
      <div className="max-w-xl mb-12">
        <p className="text-gold-dark text-xs font-semibold uppercase tracking-wide mb-2">
          You take a risk every time you hire a stranger
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-ink">
          Here's why PataKazi is different
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {whyDifferent.map((item, i) => (
          <div key={item.title} className="flex gap-4 border-b border-ink/10 pb-6">
            <span className="text-gold font-display font-bold text-lg">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="font-semibold text-ink mb-1">{item.title}</h3>
              <p className="text-ink/60 text-sm leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
