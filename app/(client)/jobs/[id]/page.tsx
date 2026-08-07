"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function JobContractPage() {
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<any>(null);
  const [authId, setAuthId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadJob() {
    const res = await fetch(`/api/jobs/${jobId}`);
    const data = await res.json();
    setJob(data.job);
    setLoading(false);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthId(data.session?.user.id ?? null);
    });
    loadJob();
  }, [jobId]);

  async function handleSign() {
    if (!authId) {
      setError("You need to be logged in to sign this contract.");
      return;
    }
    setSigning(true);
    setError(null);

    const res = await fetch("/api/contracts/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, authId }),
    });

    if (!res.ok) {
      const { error: apiError } = await res.json();
      setError(apiError ?? "Could not sign.");
      setSigning(false);
      return;
    }

    await loadJob();
    setSigning(false);
  }

  if (loading) return <p className="section text-ink/50">Loading contract...</p>;
  if (!job) return <p className="section text-ink/50">Job not found.</p>;

  const isClient = job.client.authId === authId;
  const isWorker = job.worker?.authId === authId;
  const youSigned = isClient
    ? job.contract.signedByClient
    : isWorker
    ? job.contract.signedByWorker
    : false;
  const bothSigned = job.contract.signedByClient && job.contract.signedByWorker;

  return (
    <main className="min-h-screen bg-offwhite section flex justify-center">
      <div className="bg-white rounded-card p-8 max-w-lg w-full border border-ink/10 shadow-sm">
        <p className="text-gold-dark text-xs font-semibold uppercase tracking-wide mb-1">
          Job Contract
        </p>
        <h1 className="text-2xl font-bold text-ink mb-6">{job.title}</h1>

        <div className="space-y-3 text-sm mb-6">
          <div className="flex justify-between border-b border-ink/10 pb-2">
            <span className="text-ink/50">Client</span>
            <span className="text-ink font-medium">{job.client.fullName}</span>
          </div>
          <div className="flex justify-between border-b border-ink/10 pb-2">
            <span className="text-ink/50">Fundi</span>
            <span className="text-ink font-medium">{job.worker?.fullName ?? "—"}</span>
          </div>
          <div className="flex justify-between border-b border-ink/10 pb-2">
            <span className="text-ink/50">Agreed price</span>
            <span className="text-ink font-medium">
              KES {job.contract.agreedPrice.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-ink/50 block mb-1">Scope of work</span>
            <p className="text-ink/80">{job.contract.scope}</p>
          </div>
        </div>

        <div className="flex gap-4 text-xs mb-6">
          <span
            className={
              job.contract.signedByClient ? "text-green-600" : "text-ink/40"
            }
          >
            {job.contract.signedByClient ? "✓" : "○"} Client signed
          </span>
          <span
            className={
              job.contract.signedByWorker ? "text-green-600" : "text-ink/40"
            }
          >
            {job.contract.signedByWorker ? "✓" : "○"} Fundi signed
          </span>
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-card px-3 py-2 mb-4">
            {error}
          </p>
        )}

        {bothSigned ? (
          <p className="bg-green-50 text-green-700 border border-green-200 rounded-card px-4 py-3 text-sm font-medium">
            Contract fully signed. This job is ready for payment.
          </p>
        ) : !isClient && !isWorker ? (
          <p className="text-ink/50 text-sm">
            You're not a party to this contract.
          </p>
        ) : youSigned ? (
          <p className="text-ink/50 text-sm">
            You've signed. Waiting on the other party.
          </p>
        ) : (
          <button
            onClick={handleSign}
            disabled={signing}
            className="w-full bg-gold hover:bg-gold-dark disabled:opacity-50 text-ink font-semibold text-sm py-3 rounded-card transition-colors"
          >
            {signing ? "Signing..." : "I Agree — Sign Contract"}
          </button>
        )}
      </div>
    </main>
  );
}