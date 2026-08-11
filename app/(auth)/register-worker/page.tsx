"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// These are just suggestions now — the field accepts any typed skill,
// so a worker can list "Car Wash," "Mama Fua," "Dog Trainer," or anything
// else that isn't in this list.
const skillSuggestions = [
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Painting",
  "Cleaning & Domestic",
  "Masonry",
  "Appliance Repair",
  "Gardening & Landscaping",
  "Car Wash",
  "Mama Fua (Laundry)",
  "Catering",
  "Slashing / Grass Cutting",
  "Dog Training / Pet Care",
  "Moving & Hauling",
  "Tailoring",
  "Welding",
  "Babysitting / Nanny",
  "Driving",
];

export default function RegisterWorkerPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    skillCategory: "",
    serviceArea: "",
    bio: "",
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

    // Step 1: create the login account with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (authError || !authData.user) {
      setError(authError?.message ?? "Could not create your account.");
      setLoading(false);
      return;
    }

    // Step 2: create the matching Worker profile row in our own database
    const res = await fetch("/api/workers/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authId: authData.user.id,
        fullName: form.fullName,
        phone: form.phone,
        skillCategory: form.skillCategory,
        serviceArea: form.serviceArea,
        bio: form.bio,
      }),
    });

    if (!res.ok) {
      const { error: apiError } = await res.json();
      setError(apiError ?? "Could not create your profile.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-navy flex items-center justify-center px-6 py-16">
      <div className="bg-navy-light rounded-card p-8 max-w-md w-full border border-white/10">
        <p className="text-gold text-xs font-semibold uppercase tracking-wide mb-1">
          Join Patakazi
        </p>
        <h1 className="text-white text-2xl font-display font-bold mb-6">
          Register as a Worker
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Full name">
            <input
              required
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              className="input"
              placeholder="Jane Wanjiku"
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

          <Field label="What work do you do?">
            <input
              required
              list="skill-suggestions"
              value={form.skillCategory}
              onChange={(e) => update("skillCategory", e.target.value)}
              className="input"
              placeholder="e.g. Car Wash, Mama Fua, Dog Trainer, Catering..."
            />
            <datalist id="skill-suggestions">
              {skillSuggestions.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </Field>

          <Field label="Service area">
            <input
              required
              value={form.serviceArea}
              onChange={(e) => update("serviceArea", e.target.value)}
              className="input"
              placeholder="e.g. Ruiru, Kiambu"
            />
          </Field>

          <Field label="Short bio (optional)">
            <textarea
              value={form.bio}
              onChange={(e) => update("bio", e.target.value)}
              className="input"
              rows={3}
              placeholder="Years of experience, specialties, etc."
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
            {loading ? "Creating your profile..." : "Create My Worker Profile"}
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
