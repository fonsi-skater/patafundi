import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { initiateStkPush } from "@/lib/mpesa";

const PRICES: Record<string, number> = {
  premium: 500, // KES 500 / 30 days — priority placement + badge
  featured: 200, // KES 200 / 7 days — top-of-search boost
};

export async function POST(req: NextRequest) {
  try {
    const { authId, type } = await req.json();

    if (!PRICES[type]) {
      return NextResponse.json({ error: "Invalid upgrade type" }, { status: 400 });
    }

    const worker = await prisma.worker.findUnique({ where: { authId } });
    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    const stkResponse = await initiateStkPush({
      phone: worker.phone,
      amount: PRICES[type],
      accountReference: `Patakazi-${type}-${worker.id.slice(0, 6)}`,
      transactionDesc: `Patakazi ${type}`,
    });

    await prisma.subscription.create({
      data: {
        workerId: worker.id,
        type,
        status: "pending",
        mpesaRef: stkResponse.CheckoutRequestID,
      },
    });

    return NextResponse.json({
      message: "STK Push sent. Check your phone.",
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Could not start upgrade payment." },
      { status: 500 }
    );
  }
}
