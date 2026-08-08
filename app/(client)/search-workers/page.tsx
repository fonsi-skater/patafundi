import { prisma } from "@/lib/prisma";

const skillCategories = [
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Painting",
  "Cleaning & Domestic",
  "Masonry",
  "Appliance Repair",
  "Gardening & Landscaping",
];

export default async function SearchWorkersPage({
  searchParams,
}: {
  searchParams: { skill?: string; area?: string };
}) {
  const skill = searchParams.skill ?? "";
  const area = searchParams.area ?? "";

  const workers = await prisma.worker.findMany({
    where: {
      ...(skill ? { skillCategory: skill } : {}),
      ...(area ? { serviceArea: { contains: area, mode: "insensitive" } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-offwhite section">
      <h1 className="text-3xl font-bold text-ink mb-2">Find a Fundi</h1>
      <p className="text-ink/60 mb-6">
        {workers.length} verified {workers.length === 1 ? "fundi" : "fundis"} ready to work.
      </p>

      <form className="flex flex-wrap gap-3 mb-8 bg-white p-4 rounded-card border border-ink/10">
        <select
          name="skill"
          defaultValue={skill}
          className="border border-ink/15 rounded-card px-3 py-2 text-sm outline-none focus:border-gold"
        >
          <option value="">All skills</option>
          {skillCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

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
            ? "No fundis match that search — try clearing a filter."
            : "No fundis registered yet — be the first!"}{" "}
          {!skill && !area && (
            <a href="/register-worker" className="text-gold-dark underline">
              Register here
            </a>
          )}
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
              
                href={`/post-job?workerId=${worker.id}`}
                className="mt-4 inline-block bg-navy hover:bg-navy-light text-white text-xs font-semibold px-4 py-2 rounded-card transition-colors"
              >
                Request This Fundi
              </a>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}