import { featuredCategories } from "@/lib/mock-data";

export default function Hero() {
  return (
    <section className="relative bg-navy overflow-hidden">
      <div className="absolute inset-0 bg-[url('/hero-fundi.jpg')] bg-cover bg-center opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/40" />

      <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center px-6 md:px-16 pt-32 pb-16 md:pt-40 md:pb-24">
        <div>
          <h1 className="text-white text-4xl md:text-6xl font-bold leading-tight">
            TRUSTED FUNDIS.
            <br />
            VERIFIED. INSURED.
            <br />
            READY TO WORK.
          </h1>
          <p className="text-white/70 mt-6 max-w-md text-sm md:text-base">
            PataFundi connects you with ID-verified artisans and domestic workers
            near you — real reviews, secure M-Pesa payment, and a contract on
            record for every job.
          </p>

          <div className="flex flex-wrap gap-2 mt-8">
            {featuredCategories.slice(0, 4).map((cat) => (
              <span
                key={cat}
                className="text-xs text-white/80 border border-white/20 rounded-full px-3 py-1.5"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-navy-light rounded-card p-6 md:p-8 shadow-2xl border border-white/10 max-w-md md:justify-self-end w-full">
          <p className="text-gold text-xs font-semibold tracking-wide uppercase mb-1">
            PataFundi
          </p>
          <h3 className="text-white text-xl font-display font-semibold mb-6">
            Find a Fundi Near You
          </h3>

          <form className="space-y-4">
            <div>
              <label className="text-white/70 text-xs block mb-1">What do you need done?</label>
              <input
                type="text"
                placeholder="e.g. Fix a leaking pipe"
                className="w-full bg-white/5 border border-white/15 rounded-card px-4 py-2.5 text-white placeholder:text-white/30 text-sm outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="text-white/70 text-xs block mb-1">Your location</label>
              <input
                type="text"
                placeholder="e.g. Ruiru, Kiambu"
                className="w-full bg-white/5 border border-white/15 rounded-card px-4 py-2.5 text-white placeholder:text-white/30 text-sm outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="text-white/70 text-xs block mb-1">Phone number</label>
              <input
                type="tel"
                placeholder="0700 000 000"
                className="w-full bg-white/5 border border-white/15 rounded-card px-4 py-2.5 text-white placeholder:text-white/30 text-sm outline-none focus:border-gold"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gold hover:bg-gold-dark text-ink font-semibold text-sm py-3 rounded-card transition-colors"
            >
              Find Verified Fundis
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
