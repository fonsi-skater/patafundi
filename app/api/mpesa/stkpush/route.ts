import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { initiateStkPush } from "@/lib/mpesa";

// The 10% here matches the transaction-fee revenue model from the
// original tech doc — this is where that plan actually becomes real.
const PLATFORM_FEE_RATE = 0.1;

export async function POST(req: NextRequest) {
  try {
    const { jobId, phone } = await req.json();
    if (!jobId || !phone) {
      return NextResponse.json(
        { error: "Missing jobId or phone" },
        { status: 400 }
      );
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { contract: true },
    });

    if (!job || !job.contract) {
      return NextResponse.json(
        { error: "Job or contract not found" },
        { status: 404 }
      );
    }

    if (!(job.contract.signedByClient && job.contract.signedByWorker)) {
      return NextResponse.json(
        { error: "Both parties must sign the contract before payment." },
        { status: 400 }
      );
    }

    if (!job.workerId) {
      return NextResponse.json(
        { error: "No worker assigned to this job." },
        { status: 400 }
      );
    }

    const amount = job.contract.agreedPrice;
    const platformFee = Math.round(amount * PLATFORM_FEE_RATE);

    const stkResponse = await initiateStkPush({
      phone,
      amount,
      accountReference: `Patakazi-${job.id.slice(0, 8)}`,
      transactionDesc: job.title.slice(0, 20),
    });

    // Store the payment as "pending" keyed by CheckoutRequestID — the
    // callback route below will look it up by this same ID once
    // Safaricom confirms what happened.
    await prisma.payment.upsert({
      where: { jobId: job.id },
      create: {
        jobId: job.id,
        workerId: job.workerId,
        amount,
        platformFee,
        status: "pending",
        mpesaRef: stkResponse.CheckoutRequestID,
      },
      update: {
        status: "pending",
        mpesaRef: stkResponse.CheckoutRequestID,
      },
    });

    return NextResponse.json({
      message: "STK Push sent. Check your phone.",
      checkoutRequestId: stkResponse.CheckoutRequestID,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Could not initiate payment." },
      { status: 500 }
    );
  }
}
