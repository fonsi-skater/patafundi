"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [tab, setTab] = useState<"workers" | "jobs">("workers");

  async function loadData(userEmail: string) {
    const [workersRes, jobsRes] = await Promise.all([
      fetch(`/api/admin/workers?email=${encodeURIComponent(userEmail)}`),
      fetch(`/api/admin/jobs?email=${encodeURIComponent(userEmail)}`),
    ]);

    if (workersRes.ok && jobsRes.ok) {
      setAuthorized(true);
      setWorkers((await workersRes.json()).workers);
      setJobs((await jobsRes.json()).jobs);
    }
    setLoading(false);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const userEmail = data.session?.user.email;
      setEmail(userEmail ?? null);
      if (userEmail) {
        loadData(userEmail);
      } else {
        setLoading(false);
      }
    });
  }, []);

  async function toggleVerified(workerId: string, current: boolean) {
    if (!email) return;
    await fetch("/api/admin/workers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, workerId, verified: !current }),
    });
    loadData(email);
  }

  if (loading) return <p className="section text-ink/50">Loading...</p>;

  if (!email) {
    return (
      <main className="min-h-screen bg-offwhite section text-center">
        <p className="text-ink/70 mb-4">Log in to access the admin panel.</p>
        <a href="/login" className="bg-navy text-white px-5 py-2.5 rounded-card text-sm font-semibold">
          Log In
        </a>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="min-h-screen bg-offwhite section text-center">
        <p className="text-ink/70">
          This account doesn't have admin access.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-offwhite">
      <section className="bg-navy px-6 md:px-16 py-14">
        <h1 className="text-white text-3xl font-bold">Admin</h1>
        <p className="text-white/60 text-sm mt-1">Fundi verification & job oversight</p>
      </section>

      <div className="section">
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("workers")}
          className={`px-4 py-2 rounded-card text-sm font-semibold ${
            tab === "workers" ? "bg-navy text-white" : "bg-white text-ink/60 border border-ink/10"
          }`}
        >
          Fundis ({workers.length})
        </button>
        <button
          onClick={() => setTab("jobs")}
          className={`px-4 py-2 rounded-card text-sm font-semibold ${
            tab === "jobs" ? "bg-navy text-white" : "bg-white text-ink/60 border border-ink/10"
          }`}
        >
          Jobs ({jobs.length})
        </button>
      </div>

      {tab === "workers" && (
        <div className="space-y-2">
          {workers.map((w) => (
            <div
              key={w.id}
              className="bg-white rounded-card p-4 border border-ink/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div>
                <p className="font-semibold text-ink text-sm">{w.fullName}</p>
                <p className="text-ink/50 text-xs">
                  {w.skillCategory} · {w.serviceArea} · {w.phone}
                </p>
              </div>
              <button
                onClick={() => toggleVerified(w.id, w.idVerified)}
                className={`text-xs font-semibold px-4 py-2 rounded-card ${
                  w.idVerified
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-gold hover:bg-gold-dark text-ink"
                }`}
              >
                {w.idVerified ? "✓ Verified — click to unverify" : "Verify this fundi"}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "jobs" && (
        <div className="space-y-2">
          {jobs.map((j) => (
            <a
              key={j.id}
              href={`/jobs/${j.id}`}
              className="block bg-white rounded-card p-4 border border-ink/10 hover:border-gold transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-ink text-sm">{j.title}</p>
                <span className="text-xs bg-ink/10 text-ink/60 px-2 py-0.5 rounded-full">
                  {j.status}
                </span>
              </div>
              <p className="text-ink/50 text-xs">
                {j.client.fullName} → {j.worker?.fullName ?? "unassigned"} · KES{" "}
                {j.price.toLocaleString()}
                {j.payment && ` · Payment: ${j.payment.status}`}
              </p>
            </a>
          ))}
        </div>
      )}
      </div>
    </main>
  );
}
