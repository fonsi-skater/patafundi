"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function PostJobForm() {
  const params = useSearchParams();
  const router = useRouter();
  const workerId = params.get("workerId") ?? "";

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", price: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
      setCheckingAuth(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const authId = sessionData.session?.user.id;

    if (!authId) {
      setError("You need to be logged in to post a job.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/jobs/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authId, workerId, ...form }),
    });

    if (!res.ok) {
      const { error: apiError } = await res.json();
      setError(apiError ?? "Could not post this job.");
      setLoading(false);
      return;
    }

    const { job } = await res.json();
    setCreatedJobId(job.id);
    setSuccess(true);
    setLoading(false);
  }

  if (checkingAuth) {
    return <p className="text-ink/50 section">Checking your account...</p>;
  }

  if (!loggedIn) {
    return (
      <main className="min-h-screen bg-offwhite section text-center">
        <p className="text-ink/70 mb-4">You need to log in to post a job.</p>
        <a
          href={`/login`}
          className="bg-navy text-white px-5 py-2.5 rounded-card text-sm font-semibold"
        >
          Log In
        </a>
      </main>
    );
  }

  if (success) {
    return (
      <main className="min-h-screen bg-offwhite section text-center">
        <h1 className="text-2xl font-bold text-ink mb-2">Job posted!</h1>
        <p className="text-ink/60 mb-6">
          A contract has been generated. Both you and the fundi need to
          confirm it before any payment moves.
        </p>
        <a
          href={`/jobs/${createdJobId}`}
          className="bg-gold hover:bg-gold-dark text-ink font-semibold text-sm px-5 py-2.5 rounded-card inline-block"
        >
          View Contract
        </a>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-offwhite section flex justify-center">
      <div className="bg-white rounded-card p-8 max-w-md w-full border border-ink/10 shadow-sm">
        <h1 className="text-2xl font-bold text-ink mb-1">Describe the Job</h1>
        <p className="text-ink/50 text-sm mb-6">
          This creates a job request for the fundi you selected.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-ink/70 text-xs block mb-1">Job title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full border border-ink/15 rounded-card px-4 py-2.5 text-sm outline-none focus:border-gold"
              placeholder="e.g. Fix leaking kitchen pipe"
            />
          </div>

          <div>
            <label className="text-ink/70 text-xs block mb-1">Description</label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="w-full border border-ink/15 rounded-card px-4 py-2.5 text-sm outline-none focus:border-gold"
              placeholder="What needs to be done, when, and any other details"
            />
          </div>

          <div>
            <label className="text-ink/70 text-xs block mb-1">
              Budget (KES)
            </label>
            <input
              required
              type="number"
              min={1}
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              className="w-full border border-ink/15 rounded-card px-4 py-2.5 text-sm outline-none focus:border-gold"
              placeholder="e.g. 2000"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-card px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !workerId}
            className="w-full bg-gold hover:bg-gold-dark disabled:opacity-50 text-ink font-semibold text-sm py-3 rounded-card transition-colors"
          >
            {loading ? "Posting..." : "Post This Job"}
          </button>
          {!workerId && (
            <p className="text-red-500 text-xs">
              No fundi selected — go back to search and choose one first.
            </p>
          )}
        </form>
      </div>
    </main>
  );
}

export default function PostJobPage() {
  return (
    <Suspense fallback={<p className="section">Loading...</p>}>
      <PostJobForm />
    </Suspense>
  );
}