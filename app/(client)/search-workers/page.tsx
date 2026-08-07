import { prisma } from "@/lib/prisma";

// Server Component  this runs on the server at request time and queries
// the real database directly. No API route needed for a simple read.
export default async function SearchWorkersPage() {
  const workers = await prisma.worker.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-offwhite section">
      <h1 className="text-3xl font-bold text-ink mb-2">Find a Fundi</h1>
      <p className="text-ink/60 mb-8">
        {workers.length} verified {workers.length === 1 ? "fundi" : "fundis"} ready to work.
      </p>

      {workers.length === 0 ? (
        <p className="text-ink/50">
          No fundis registered yet  be the first!{" "}
          <a href="/register-worker" className="text-gold-dark underline">
            Register here
          </a>
          .
        </p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {workers.map((worker) => (
            <div
              key={worker.id}
              className="bg-white rounded-card p-6 border border-ink/10 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-ink">{worker.fullName}</h3>
                {worker.idVerified && (
                  <span className="text-xs bg-gold/20 text-gold-dark px-2 py-0.5 rounded-full font-semibold">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-sm text-navy font-medium mb-1">{worker.skillCategory}</p>
              <p className="text-xs text-ink/50 mb-3">{worker.serviceArea}</p>
              {worker.bio && (
                <p className="text-sm text-ink/70 leading-relaxed">{worker.bio}</p>
              )}
              <p className="text-xs text-ink/40 mt-4">{worker.phone}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}