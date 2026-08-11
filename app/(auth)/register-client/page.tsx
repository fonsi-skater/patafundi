"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RegisterClientPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (authError || !authData.user) {
      setError(authError?.message ?? "Could not create your account.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/clients/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authId: authData.user.id,
        fullName: form.fullName,
        phone: form.phone,
      }),
    });

    if (!res.ok) {
      const { error: apiError } = await res.json();
      setError(apiError ?? "Could not create your profile.");
      setLoading(false);
      return;
    }

    router.push("/search-workers");
  }

  return (
    <main className="min-h-screen bg-navy flex items-center justify-center px-6 py-16">
      <div className="bg-navy-light rounded-card p-8 max-w-md w-full border border-white/10">
        <p className="text-gold text-xs font-semibold uppercase tracking-wide mb-1">
          Join Patakazi
        </p>
        <h1 className="text-white text-2xl font-display font-bold mb-6">
          Create a Client Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Full name">
            <input
              required
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              className="input"
              placeholder="John Kamau"
            />
          </Field>

          <Field label="Phone number">
            <input
              required
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="input"
              placeholder="0700 000 000"
            />
          </Field>

          <Field label="Email">
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="input"
              placeholder="you@example.com"
            />
          </Field>

          <Field label="Password">
            <input
              required
              type="password"
              minLength={6}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              className="input"
              placeholder="At least 6 characters"
            />
          </Field>

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
            {loading ? "Creating your account..." : "Create My Account"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-white/70 text-xs block mb-1">{label}</label>
      {children}
    </div>
  );
}
