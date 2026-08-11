import { prisma } from "@/lib/prisma";
import PortfolioThumbnails from "@/components/search/PortfolioThumbnails";

export default async function SearchWorkersPage({
  searchParams,
}: {
  searchParams: { skill?: string; area?: string };
}) {
  const skill = searchParams.skill ?? "";
  const area = searchParams.area ?? "";

  const workers = await prisma.worker.findMany({
    where: {
      ...(skill ? { skillCategory: { contains: skill, mode: "insensitive" } } : {}),
      ...(area ? { serviceArea: { contains: area, mode: "insensitive" } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  // Skill suggestions now come from whatever workers have actually typed at
  // registration — not a fixed list — so new categories show up here
  // automatically as people join with new kinds of work.
  const allWorkers = await prisma.worker.findMany({
    select: { skillCategory: true },
    distinct: ["skillCategory"],
  });
  const skillOptions = allWorkers.map((w) => w.skillCategory).sort();

  // Boosted (active featuredUntil) first, then premium, then everyone else —
  // this is where the "Boost Listing" and "Go Premium" payments actually
  // pay off for the worker who bought them.
  const now = new Date();
  const sortedWorkers = [...workers].sort((a, b) => {
    const aBoosted = a.featuredUntil && new Date(a.featuredUntil) > now;
    const bBoosted = b.featuredUntil && new Date(b.featuredUntil) > now;
    if (aBoosted !== bBoosted) return aBoosted ? -1 : 1;
    if (a.isPremium !== b.isPremium) return a.isPremium ? -1 : 1;
    return 0;
  });

  return (
    <main className="min-h-screen bg-offwhite">
      <section className="bg-navy px-6 md:px-16 py-14">
        <h1 className="text-white text-3xl font-bold mb-2">Find a Worker</h1>
        <p className="text-white/60">
          {workers.length} verified {workers.length === 1 ? "worker" : "workers"} ready to work.
        </p>
      </section>

      <div className="section">
      <form className="flex flex-wrap gap-3 mb-8 bg-white p-4 rounded-card border border-ink/10">
        <input
          type="text"
          name="skill"
          list="skill-options"
          defaultValue={skill}
          placeholder="Any skill — car wash, plumbing, catering..."
          className="border border-ink/15 rounded-card px-3 py-2 text-sm outline-none focus:border-gold flex-1 min-w-[200px]"
        />
        <datalist id="skill-options">
          {skillOptions.map((cat) => (
            <option key={cat} value={cat} />
          ))}
        </datalist>

        <input
          type="text"
          name="area"
          defaultValue={area}
          placeholder="Location, e.g. Ruiru"
          className="border border-ink/15 rounded-card px-3 py-2 text-sm outline-none focus:border-gold flex-1 min-w-[160px]"
        />

        <button
          type="submit"
          className="bg-navy text-white text-sm font-semibold px-5 py-2 rounded-card"
        >
          Search
        </button>

        {(skill || area) && (
          <a
            href="/search-workers"
            className="text-ink/50 text-sm underline self-center"
          >
            Clear filters
          </a>
        )}
      </form>

      {workers.length === 0 ? (
        <p className="text-ink/50">
          {skill || area
            ? "No workers match that search — try clearing a filter."
            : "No workers registered yet — be the first!"}{" "}
          {!skill && !area && (
            <a href="/register-worker" className="text-gold-dark underline">
              Register here
            </a>
          )}
        </p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {sortedWorkers.map((worker) => {
            const isBoosted = worker.featuredUntil && new Date(worker.featuredUntil) > now;
            return (
            <div
              key={worker.id}
              className={`bg-white rounded-card p-6 border shadow-sm ${
                isBoosted ? "border-gold ring-1 ring-gold/40" : "border-ink/10"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                {worker.profilePicUrl ? (
                  <img
                    src={worker.profilePicUrl}
                    alt={worker.fullName}
                    className="w-10 h-10 rounded-full object-cover border border-ink/10"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center font-bold text-sm">
                    {worker.fullName.charAt(0)}
                  </div>
                )}
                <div className="flex items-center justify-between flex-1 flex-wrap gap-1">
                  <h3 className="font-semibold text-ink">{worker.fullName}</h3>
                  <div className="flex gap-1">
                    {isBoosted && (
                      <span className="text-xs bg-gold text-ink px-2 py-0.5 rounded-full font-semibold">
                        Boosted
                      </span>
                    )}
                    {worker.isPremium && (
                      <span className="text-xs bg-navy text-white px-2 py-0.5 rounded-full font-semibold">
                        Premium
                      </span>
                    )}
                    {worker.idVerified && (
                      <span className="text-xs bg-gold/20 text-gold-dark px-2 py-0.5 rounded-full font-semibold">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm text-navy font-medium mb-1">{worker.skillCategory}</p>
              <p className="text-xs text-ink/50 mb-3">{worker.serviceArea}</p>
              {worker.bio && (
                <p className="text-sm text-ink/70 leading-relaxed">{worker.bio}</p>
              )}
              <PortfolioThumbnails images={worker.portfolioImages} />
              <p className="text-xs text-ink/40 mt-4">{worker.phone}</p>
              <a
                href={`/post-job?workerId=${worker.id}`}
                className="mt-4 inline-block bg-navy hover:bg-navy-light text-white text-xs font-semibold px-4 py-2 rounded-card transition-colors"
              >
                Request This Worker
              </a>
            </div>
            );
          })}
        </div>
      )}
      </div>
    </main>
  );
}
