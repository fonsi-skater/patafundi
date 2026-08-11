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
  const [payPhone, setPayPhone] = useState("");
  const [paying, setPaying] = useState(false);
  const [payMessage, setPayMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

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

  async function handlePay() {
    if (!payPhone) {
      setError("Enter the phone number to receive the M-Pesa prompt.");
      return;
    }
    setPaying(true);
    setError(null);
    setPayMessage(null);

    const res = await fetch("/api/mpesa/stkpush", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, phone: payPhone }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not start payment.");
      setPaying(false);
      return;
    }

    setPayMessage("Check your phone for the M-Pesa prompt and enter your PIN.");
    setPaying(false);
  }

  // Poll every 3s for up to a minute after the STK push is sent, since
  // Safaricom's callback to our server can take a few seconds to arrive.
  useEffect(() => {
    if (!payMessage || job?.payment?.status === "held") return;
    const interval = setInterval(loadJob, 3000);
    const timeout = setTimeout(() => clearInterval(interval), 60000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payMessage, job?.payment?.status]);


  async function callAction(url: string, extra: Record<string, any> = {}) {
    setActionLoading(true);
    setError(null);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, authId, ...extra }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setActionLoading(false);
      return false;
    }
    await loadJob();
    setActionLoading(false);
    return true;
  }

  async function handleMarkComplete() {
    await callAction("/api/jobs/mark-complete");
  }

  async function handleConfirmComplete() {
    await callAction("/api/jobs/confirm-complete");
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    const ok = await callAction("/api/reviews/create", {
      rating: reviewRating,
      comment: reviewComment,
    });
    if (ok) setReviewSubmitted(true);
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
            <span className="text-ink/50">Worker</span>
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
            {job.contract.signedByWorker ? "✓" : "○"} Worker signed
          </span>
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-card px-3 py-2 mb-4">
            {error}
          </p>
        )}

        {bothSigned && (
          <div className="mb-4">
            {job.payment?.status === "held" ? (
              <p className="bg-green-50 text-green-700 border border-green-200 rounded-card px-4 py-3 text-sm font-medium">
                Payment received — KES {job.payment.amount.toLocaleString()} is
                held securely and will be released to the worker once the job
                is confirmed complete.
              </p>
            ) : job.payment?.status === "failed" ? (
              <p className="bg-red-50 text-red-600 border border-red-200 rounded-card px-4 py-3 text-sm">
                Last payment attempt failed or was cancelled. Try again below.
              </p>
            ) : null}

            {isClient && job.payment?.status !== "held" && (
              <div className="mt-3 border border-ink/10 rounded-card p-4 bg-offwhite">
                <p className="text-sm text-ink/70 mb-3">
                  Contract signed. Pay KES{" "}
                  {job.contract.agreedPrice.toLocaleString()} via M-Pesa to
                  get this job started — funds are held securely until the
                  work is done.
                </p>
                <input
                  type="tel"
                  value={payPhone}
                  onChange={(e) => setPayPhone(e.target.value)}
                  placeholder="M-Pesa number, e.g. 0700 000 000"
                  className="w-full border border-ink/15 rounded-card px-4 py-2.5 text-sm outline-none focus:border-gold mb-3"
                />
                <button
                  onClick={handlePay}
                  disabled={paying}
                  className="w-full bg-gold hover:bg-gold-dark disabled:opacity-50 text-ink font-semibold text-sm py-3 rounded-card transition-colors"
                >
                  {paying ? "Sending prompt..." : "Pay with M-Pesa"}
                </button>
                {payMessage && (
                  <p className="text-ink/60 text-xs mt-3">{payMessage}</p>
                )}
              </div>
            )}

            {!isClient && !job.payment && (
              <p className="text-ink/50 text-sm">
                Waiting on the client to make payment.
              </p>
            )}

            {job.payment?.status === "held" && job.status === "in_progress" && isWorker && (
              <button
                onClick={handleMarkComplete}
                disabled={actionLoading}
                className="w-full mt-3 bg-navy hover:bg-navy-light disabled:opacity-50 text-white font-semibold text-sm py-3 rounded-card transition-colors"
              >
                {actionLoading ? "Updating..." : "Mark Job as Complete"}
              </button>
            )}

            {job.status === "in_progress" && isClient && (
              <p className="text-ink/50 text-sm mt-3">
                Waiting on the worker to mark this job as done.
              </p>
            )}

            {job.status === "awaiting_confirmation" && isClient && (
              <div className="mt-3 border border-gold/40 bg-gold/10 rounded-card p-4">
                <p className="text-sm text-ink/80 mb-3">
                  The worker says this job is done. Confirm to release payment.
                </p>
                <button
                  onClick={handleConfirmComplete}
                  disabled={actionLoading}
                  className="w-full bg-gold hover:bg-gold-dark disabled:opacity-50 text-ink font-semibold text-sm py-3 rounded-card transition-colors"
                >
                  {actionLoading ? "Confirming..." : "Confirm Complete & Release Payment"}
                </button>
              </div>
            )}

            {job.status === "awaiting_confirmation" && isWorker && (
              <p className="text-ink/50 text-sm mt-3">
                Waiting on the client to confirm and release payment.
              </p>
            )}

            {job.status === "completed" && (
              <p className="bg-green-50 text-green-700 border border-green-200 rounded-card px-4 py-3 text-sm font-medium mt-3">
                Job complete. Payment has been released.
              </p>
            )}

            {job.status === "completed" && isClient && !job.review && !reviewSubmitted && (
              <form
                onSubmit={handleSubmitReview}
                className="mt-4 border border-ink/10 rounded-card p-4 bg-offwhite"
              >
                <p className="text-sm font-medium text-ink mb-2">
                  Rate this worker
                </p>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => setReviewRating(n)}
                      className={`text-2xl ${
                        n <= reviewRating ? "text-gold" : "text-ink/20"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="How did it go? (optional)"
                  rows={3}
                  className="w-full border border-ink/15 rounded-card px-3 py-2 text-sm outline-none focus:border-gold mb-3"
                />
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-navy hover:bg-navy-light disabled:opacity-50 text-white font-semibold text-sm py-3 rounded-card transition-colors"
                >
                  {actionLoading ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}

            {job.review && (
              <div className="mt-4 border border-ink/10 rounded-card p-4">
                <p className="text-gold text-lg mb-1">
                  {"★".repeat(job.review.rating)}
                  {"☆".repeat(5 - job.review.rating)}
                </p>
                {job.review.comment && (
                  <p className="text-sm text-ink/70">{job.review.comment}</p>
                )}
              </div>
            )}
          </div>
        )}

        {!bothSigned && (
          !isClient && !isWorker ? (
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
        ))}
      </div>
    </main>
  );
}
