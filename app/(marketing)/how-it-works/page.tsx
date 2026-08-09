export default function HowItWorksPage() {
  const clientSteps = [
    { title: "Search", desc: "Filter fundis by skill and location near you." },
    { title: "Request", desc: "Describe the job and request a specific fundi." },
    { title: "Sign", desc: "Both of you confirm a simple digital contract." },
    { title: "Pay securely", desc: "Pay via M-Pesa — funds are held until the job is done." },
    { title: "Confirm & review", desc: "Confirm completion to release payment, then leave a review." },
  ];

  const workerSteps = [
    { title: "Register", desc: "Create a profile with your skill and service area." },
    { title: "Get requests", desc: "Clients find you and request jobs directly." },
    { title: "Sign the contract", desc: "Agree on scope and price before starting work." },
    { title: "Get paid", desc: "Payment is confirmed and held before you start — no chasing clients for money." },
    { title: "Build your record", desc: "Every completed job adds to your rating and earnings history." },
  ];

  return (
    <main className="min-h-screen bg-offwhite">
      <section className="bg-navy px-6 md:px-16 py-20 text-center">
        <h1 className="text-white text-3xl md:text-4xl font-bold">How PataFundi Works</h1>
        <p className="text-white/60 mt-3 max-w-xl mx-auto">
          A simple, secure flow for both sides — verified fundis, protected payments.
        </p>
      </section>

      <section className="section grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
        <div>
          <h2 className="text-xl font-bold text-ink mb-6">For Clients</h2>
          <div className="space-y-5">
            {clientSteps.map((step, i) => (
              <div key={step.title} className="flex gap-4">
                <span className="text-gold font-display font-bold text-lg">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-semibold text-ink text-sm">{step.title}</p>
                  <p className="text-ink/60 text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <a
            href="/search-workers"
            className="inline-block mt-6 bg-gold hover:bg-gold-dark text-ink text-sm font-semibold px-5 py-2.5 rounded-card"
          >
            Find a Fundi
          </a>
        </div>

        <div>
          <h2 className="text-xl font-bold text-ink mb-6">For Fundis</h2>
          <div className="space-y-5">
            {workerSteps.map((step, i) => (
              <div key={step.title} className="flex gap-4">
                <span className="text-navy font-display font-bold text-lg">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-semibold text-ink text-sm">{step.title}</p>
                  <p className="text-ink/60 text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <a
            href="/register-worker"
            className="inline-block mt-6 bg-navy hover:bg-navy-light text-white text-sm font-semibold px-5 py-2.5 rounded-card"
          >
            Join as a Fundi
          </a>
        </div>
      </section>
    </main>
  );
}
