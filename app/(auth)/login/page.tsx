"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      setError(authError?.message ?? "Login failed.");
      setLoading(false);
      return;
    }

    // Figure out if this login belongs to a worker or a client, and send
    // each to the page that's actually relevant to them — a worker should
    // land on their own dashboard, not the page for hiring other workers.
    const workerCheck = await fetch(`/api/workers/me?authId=${authData.user.id}`);
    router.push(workerCheck.ok ? "/dashboard" : "/search-workers");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-navy flex items-center justify-center px-6 py-16">
      <div className="bg-navy-light rounded-card p-8 max-w-md w-full border border-white/10">
        <h1 className="text-white text-2xl font-display font-bold mb-6">
          Log In
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white/70 text-xs block mb-1">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-white/70 text-xs block mb-1">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Your password"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-card px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold hover:bg-gold-dark disabled:opacity-50 text-ink font-semibold text-sm py-3 rounded-card transition-colors"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="text-white/50 text-xs mt-6 text-center">
          No account?{" "}
          <a href="/register-client" className="text-gold underline">
            Register as a client
          </a>{" "}
          or{" "}
          <a href="/register-worker" className="text-gold underline">
            as a worker
          </a>
        </p>
      </div>
    </main>
  );
}
