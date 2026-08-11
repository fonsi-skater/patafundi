"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { uploadToCloudinary } from "@/lib/cloudinary";

export default function WorkerDashboardPage() {
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const [notAWorker, setNotAWorker] = useState(false);
  const [authId, setAuthId] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [upgradeMessage, setUpgradeMessage] = useState<string | null>(null);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const uid = data.session?.user.id;
      if (!uid) {
        setNotLoggedIn(true);
        setLoading(false);
        return;
      }
      setAuthId(uid);

      const res = await fetch(`/api/workers/me?authId=${uid}`);
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

  async function refetchWorker() {
    if (!authId) return;
    const res = await fetch(`/api/workers/me?authId=${authId}`);
    if (res.ok) setWorker((await res.json()).worker);
  }

  async function handleProfilePicUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !authId) return;
    setPhotoError(null);
    setUploadingPic(true);
    try {
      const url = await uploadToCloudinary(file);
      await fetch("/api/workers/profile-pic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authId, url }),
      });
      await refetchWorker();
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Could not upload photo. Try again.");
    }
    setUploadingPic(false);
  }

  async function handlePortfolioUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !authId || !worker) return;
    setPhotoError(null);
    setUploadingPortfolio(true);
    try {
      const url = await uploadToCloudinary(file);
      const newUrls = [...(worker.portfolioImages ?? []), url];
      await fetch("/api/workers/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authId, urls: newUrls }),
      });
      await refetchWorker();
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Could not upload photo. Try again.");
    }
    setUploadingPortfolio(false);
  }

  async function handleRemovePortfolioImage(url: string) {
    if (!authId || !worker) return;
    const newUrls = (worker.portfolioImages ?? []).filter((u: string) => u !== url);
    await fetch("/api/workers/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authId, urls: newUrls }),
    });
    await refetchWorker();
  }

  async function handleUpgrade(type: "premium" | "featured") {
    if (!authId) return;
    setUpgrading(type);
    setUpgradeMessage(null);

    const res = await fetch("/api/workers/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authId, type }),
    });
    const data = await res.json();

    if (!res.ok) {
      setUpgradeMessage(data.error ?? "Could not start payment.");
      setUpgrading(null);
      return;
    }

    setUpgradeMessage("Check your phone for the M-Pesa prompt.");
    setUpgrading(null);

    // Poll for up to a minute, since the callback can take a few seconds
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      await refetchWorker();
      if (attempts >= 20) clearInterval(interval);
    }, 3000);
  }

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
    <main className="min-h-screen bg-offwhite">
      <section className="bg-navy px-6 md:px-16 py-14">
        <h1 className="text-white text-3xl font-bold mb-1">
          Welcome back, {worker.fullName.split(" ")[0]}
        </h1>
        <p className="text-white/60">
          {worker.skillCategory} · {worker.serviceArea}
          {worker.isPremium && (
            <span className="ml-2 text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full font-semibold">
              Premium
            </span>
          )}
        </p>
      </section>

      <div className="section">

      <div className="bg-white rounded-card p-5 border border-ink/10 mb-6">
        <h2 className="font-semibold text-ink mb-4">Your Profile</h2>
        <div className="flex items-center gap-4 mb-6">
          {worker.profilePicUrl ? (
            <img
              src={worker.profilePicUrl}
              alt={worker.fullName}
              className="w-16 h-16 rounded-full object-cover border border-ink/10"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-navy text-white flex items-center justify-center font-bold text-xl">
              {worker.fullName.charAt(0)}
            </div>
          )}
          <div>
            <label className="inline-block bg-navy hover:bg-navy-light text-white text-xs font-semibold px-4 py-2 rounded-card cursor-pointer transition-colors">
              {uploadingPic ? "Uploading..." : "Change Photo"}
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePicUpload}
                disabled={uploadingPic}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <p className="text-ink/70 text-sm font-medium mb-2">
          Showcase your work ({(worker.portfolioImages ?? []).length} photos)
        </p>
        <div className="flex flex-wrap gap-3">
          {(worker.portfolioImages ?? []).map((url: string) => (
            <div key={url} className="relative w-20 h-20">
              <img
                src={url}
                alt="Portfolio"
                className="w-20 h-20 rounded-card object-cover border border-ink/10"
              />
              <button
                onClick={() => handleRemovePortfolioImage(url)}
                className="absolute -top-2 -right-2 bg-ink text-white w-5 h-5 rounded-full text-xs flex items-center justify-center"
                aria-label="Remove photo"
              >
                ×
              </button>
            </div>
          ))}
          <label className="w-20 h-20 rounded-card border-2 border-dashed border-ink/20 flex items-center justify-center text-ink/40 text-xs cursor-pointer hover:border-gold transition-colors text-center px-1">
            {uploadingPortfolio ? "..." : "+ Add"}
            <input
              type="file"
              accept="image/*"
              onChange={handlePortfolioUpload}
              disabled={uploadingPortfolio}
              className="hidden"
            />
          </label>
        </div>
        {photoError && <p className="text-red-500 text-xs mt-2">{photoError}</p>}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <div className="bg-navy rounded-card p-5">
          <p className="text-white font-semibold text-sm mb-1">
            {worker.isPremium ? "Premium — Active" : "Go Premium — KES 500/month"}
          </p>
          <p className="text-white/60 text-xs mb-3">
            Priority placement in search results plus a Premium badge on your profile.
          </p>
          {!worker.isPremium && (
            <button
              onClick={() => handleUpgrade("premium")}
              disabled={upgrading === "premium"}
              className="bg-gold hover:bg-gold-dark disabled:opacity-50 text-ink text-xs font-semibold px-4 py-2 rounded-card"
            >
              {upgrading === "premium" ? "Sending prompt..." : "Pay with M-Pesa"}
            </button>
          )}
        </div>

        <div className="bg-white border border-ink/10 rounded-card p-5">
          <p className="text-ink font-semibold text-sm mb-1">
            {worker.featuredUntil && new Date(worker.featuredUntil) > new Date()
              ? `Boosted until ${new Date(worker.featuredUntil).toLocaleDateString()}`
              : "Boost Listing — KES 200/7 days"}
          </p>
          <p className="text-ink/50 text-xs mb-3">
            Jump to the top of search results for a week — good for a slow week.
          </p>
          {!(worker.featuredUntil && new Date(worker.featuredUntil) > new Date()) && (
            <button
              onClick={() => handleUpgrade("featured")}
              disabled={upgrading === "featured"}
              className="bg-navy hover:bg-navy-light disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-card"
            >
              {upgrading === "featured" ? "Sending prompt..." : "Pay with M-Pesa"}
            </button>
          )}
        </div>
      </div>

      {upgradeMessage && (
        <p className="text-ink/60 text-sm mb-6 -mt-6">{upgradeMessage}</p>
      )}

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

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-ink">Job History</h2>
        <a
          href={`/api/workers/statement?authId=${authId}`}
          className="text-xs bg-navy hover:bg-navy-light text-white font-semibold px-4 py-2 rounded-card transition-colors"
        >
          Download Earnings Statement (PDF)
        </a>
      </div>

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
      </div>
    </main>
  );
}
