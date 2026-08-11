import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/sms";

// Safaricom's servers call this — we never call it ourselves. It fires
// after the customer approves or cancels the STK Push prompt on their
// phone, sometimes several seconds later. Both job payments AND worker
// upgrade payments (premium/featured) land on this same URL, so we check
// which kind it is by seeing which table has a matching mpesaRef.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const callback = body?.Body?.stkCallback;

    if (!callback) {
      return NextResponse.json(
        { error: "Invalid callback payload" },
        { status: 400 }
      );
    }

    const checkoutRequestId = callback.CheckoutRequestID;
    const resultCode = callback.ResultCode;
    const success = resultCode === 0;
    const items = callback.CallbackMetadata?.Item ?? [];
    const receipt = items.find(
      (i: any) => i.Name === "MpesaReceiptNumber"
    )?.Value;

    // Try matching a job payment first
    const payment = await prisma.payment.findFirst({
      where: { mpesaRef: checkoutRequestId },
    });

    if (payment) {
      if (success) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "held", mpesaRef: receipt ?? checkoutRequestId },
        });

        const updatedJob = await prisma.job.update({
          where: { id: payment.jobId },
          data: { status: "in_progress" },
          include: { worker: true },
        });

        if (updatedJob.worker) {
          sendSms(
            updatedJob.worker.phone,
            `Patakazi: Payment of KES ${payment.amount.toLocaleString()} received and held for "${updatedJob.title}". You can start the job.`
          );
        }
      } else {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "failed" },
        });
      }
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    // Otherwise, try matching a worker upgrade subscription
    const subscription = await prisma.subscription.findFirst({
      where: { mpesaRef: checkoutRequestId },
    });

    if (subscription) {
      if (success) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: "active", mpesaRef: receipt ?? checkoutRequestId },
        });

        if (subscription.type === "premium") {
          await prisma.worker.update({
            where: { id: subscription.workerId },
            data: { isPremium: true },
          });
        } else if (subscription.type === "featured") {
          const featuredUntil = new Date();
          featuredUntil.setDate(featuredUntil.getDate() + 7);
          await prisma.worker.update({
            where: { id: subscription.workerId },
            data: { featuredUntil },
          });
        }
      } else {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: "failed" },
        });
      }
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    console.error("No matching payment or subscription for", checkoutRequestId);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}
