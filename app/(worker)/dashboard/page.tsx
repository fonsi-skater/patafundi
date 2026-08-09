"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function WorkerDashboardPage() {
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const [notAWorker, setNotAWorker] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const authId = data.session?.user.id;
      if (!authId) {
        setNotLoggedIn(true);
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/workers/me?authId=${authId}`);
      if (!res.ok) {
        setNotAWorker(true);
        setLoading(false);
        return;
      }
      const { worker } = await res.json();
      setWorker(worker);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="section text-ink/50">Loading dashboard...</p>;

  if (notLoggedIn) {
    return (
      <main className="min-h-screen bg-offwhite section text-center">
        <p className="text-ink/70 mb-4">Log in to see your dashboard.</p>
        <a
          href="/login"
          className="bg-navy text-white px-5 py-2.5 rounded-card text-sm font-semibold"
        >
          Log In
        </a>
      </main>
    );
  }

  if (notAWorker) {
    return (
      <main className="min-h-screen bg-offwhite section text-center">
        <p className="text-ink/70 mb-4">
          This account isn't registered as a fundi.
        </p>
        <a
          href="/register-worker"
          className="bg-navy text-white px-5 py-2.5 rounded-card text-sm font-semibold"
        >
          Register as a Fundi
        </a>
      </main>
    );
  }

  const releasedPayments = worker.jobs
    .map((j: any) => j.payment)
    .filter((p: any) => p?.status === "released");

  const totalEarned = releasedPayments.reduce(
    (sum: number, p: any) => sum + (p.amount - p.platformFee),
    0
  );

  const heldPayments = worker.jobs
    .map((j: any) => j.payment)
    .filter((p: any) => p?.status === "held");
  const totalHeld = heldPayments.reduce((sum: number, p: any) => sum + p.amount, 0);

  const avgRating =
    worker.reviews.length > 0
      ? (
          worker.reviews.reduce((s: number, r: any) => s + r.rating, 0) /
          worker.reviews.length
        ).toFixed(1)
      : null;

  const statusLabels: Record<string, string> = {
    pending: "Awaiting Contract",
    contracted: "Contracted — Awaiting Payment",
    in_progress: "In Progress",
    awaiting_confirmation: "Awaiting Client Confirmation",
    completed: "Completed",
  };

  const statusColors: Record<string, string> = {
    pending: "bg-ink/10 text-ink/60",
    contracted: "bg-blue-50 text-blue-600",
    in_progress: "bg-gold/20 text-gold-dark",
    awaiting_confirmation: "bg-orange-50 text-orange-600",
    completed: "bg-green-50 text-green-700",
  };

  return (
    <main className="min-h-screen bg-offwhite section">
      <h1 className="text-3xl font-bold text-ink mb-1">
        Welcome back, {worker.fullName.split(" ")[0]}
      </h1>
      <p className="text-ink/60 mb-8">
        {worker.skillCategory} · {worker.serviceArea}
      </p>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-white rounded-card p-5 border border-ink/10">
          <p className="text-ink/50 text-xs uppercase tracking-wide mb-1">
            Total Earned
          </p>
          <p className="text-2xl font-bold text-ink">
            KES {totalEarned.toLocaleString()}
          </p>
          <p className="text-ink/40 text-xs mt-1">
            After platform fee, across {releasedPayments.length} completed jobs
          </p>
        </div>

        <div className="bg-white rounded-card p-5 border border-ink/10">
          <p className="text-ink/50 text-xs uppercase tracking-wide mb-1">
            Held / In Progress
          </p>
          <p className="text-2xl font-bold text-ink">
            KES {totalHeld.toLocaleString()}
          </p>
          <p className="text-ink/40 text-xs mt-1">
            Released once client confirms
          </p>
        </div>

        <div className="bg-white rounded-card p-5 border border-ink/10">
          <p className="text-ink/50 text-xs uppercase tracking-wide mb-1">
            Rating
          </p>
          <p className="text-2xl font-bold text-ink">
            {avgRating ? `${avgRating} ★` : "No reviews yet"}
          </p>
          <p className="text-ink/40 text-xs mt-1">
            From {worker.reviews.length} client{worker.reviews.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-ink mb-4">Job History</h2>

      {worker.jobs.length === 0 ? (
        <p className="text-ink/50">
          No jobs yet.{" "}
          <a href="/search-workers" className="text-gold-dark underline">
            Your profile is live
          </a>{" "}
          — clients can find and request you.
        </p>
      ) : (
        <div className="space-y-3">
          {worker.jobs.map((job: any) => (
            <a
              key={job.id}
              href={`/jobs/${job.id}`}
              className="block bg-white rounded-card p-4 border border-ink/10 hover:border-gold transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-ink text-sm">{job.title}</p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[job.status] ?? "bg-ink/10 text-ink/60"}`}
                >
                  {statusLabels[job.status] ?? job.status}
                </span>
              </div>
              <p className="text-ink/50 text-xs">
                {job.client.fullName} · KES {job.price.toLocaleString()}
              </p>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
