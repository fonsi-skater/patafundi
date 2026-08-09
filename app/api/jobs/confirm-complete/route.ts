import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { jobId, authId } = await req.json();

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { client: true, payment: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    if (job.client.authId !== authId) {
      return NextResponse.json(
        { error: "Only the client who posted this job can confirm it." },
        { status: 403 }
      );
    }
    if (job.status !== "awaiting_confirmation") {
      return NextResponse.json(
        { error: "This job isn't awaiting confirmation." },
        { status: 400 }
      );
    }
    if (!job.payment || job.payment.status !== "held") {
      return NextResponse.json(
        { error: "No held payment found for this job." },
        { status: 400 }
      );
    }

    // This is the actual release step — money that was sitting with the
    // platform now counts as the worker's. (Real payout to their M-Pesa
    // account is a manual/batched step for now — the earnings dashboard
    // in Step 8 shows this as money owed, and the platform pays out from
    // there. That's normal for an early-stage marketplace, not a bug.)
    await prisma.payment.update({
      where: { jobId },
      data: { status: "released" },
    });

    await prisma.job.update({
      where: { id: jobId },
      data: { status: "completed" },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
