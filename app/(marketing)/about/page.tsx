export default function AboutPage() {
  return (
    <main className="min-h-screen bg-offwhite">
      <section className="bg-navy px-6 md:px-16 py-20 text-center">
        <p className="text-gold text-xs font-semibold uppercase tracking-wide mb-2">
          About PataKazi
        </p>
        <h1 className="text-white text-3xl md:text-4xl font-bold max-w-2xl mx-auto">
          Bringing structure to Kenya's informal labor market
        </h1>
      </section>

      <section className="section max-w-2xl mx-auto space-y-6 text-ink/80 leading-relaxed">
        <p>
          A huge share of urban workers in Kenya rely on informal or freelance
          work — workers, artisans, and domestic workers who do skilled,
          essential work every day without a formal record of it. When a job
          goes well, that trust often lives only in word of mouth. When it
          doesn't, there's rarely any record to point to.
        </p>
        <p>
          PataKazi exists to fix that. Every worker on the platform is
          ID-verified. Every review comes from a client who actually paid for
          a completed job — not an anonymous rating. Every job has a simple
          digital contract before any money moves, and payment is held
          securely until the work is confirmed done.
        </p>
        <p>
          Over time, that adds up to something bigger than a booking app: a
          real, verifiable earnings history — the kind of record a worker can
          eventually use as proof of income with a bank or sacco, something
          most informal workers have never had access to.
        </p>
        <div className="grid sm:grid-cols-3 gap-6 pt-6">
          <div className="bg-white rounded-card p-5 border border-ink/10 text-center">
            <p className="text-2xl font-bold text-ink">100%</p>
            <p className="text-ink/50 text-sm">ID-verified workers</p>
          </div>
          <div className="bg-white rounded-card p-5 border border-ink/10 text-center">
            <p className="text-2xl font-bold text-ink">Secure</p>
            <p className="text-ink/50 text-sm">M-Pesa escrow payments</p>
          </div>
          <div className="bg-white rounded-card p-5 border border-ink/10 text-center">
            <p className="text-2xl font-bold text-ink">Real</p>
            <p className="text-ink/50 text-sm">Reviews from paid jobs only</p>
          </div>
        </div>
      </section>
    </main>
  );
}
