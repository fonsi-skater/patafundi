import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Safaricom's servers call this — we never call it ourselves. It fires
// after the customer approves or cancels the STK Push prompt on their
// phone, sometimes several seconds later.
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

    const payment = await prisma.payment.findFirst({
      where: { mpesaRef: checkoutRequestId },
    });

    if (!payment) {
      console.error("No matching payment for", checkoutRequestId);
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    if (resultCode === 0) {
      const items = callback.CallbackMetadata?.Item ?? [];
      const receipt = items.find(
        (i: any) => i.Name === "MpesaReceiptNumber"
      )?.Value;

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "held", // money sits with the platform until job completion
          mpesaRef: receipt ?? checkoutRequestId,
        },
      });

      await prisma.job.update({
        where: { id: payment.jobId },
        data: { status: "in_progress" },
      });
    } else {
      // User cancelled the prompt, entered wrong PIN, timed out, etc.
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "failed" },
      });
    }

    // Safaricom expects exactly this shape back to know we received it —
    // returning anything else can make it retry the callback repeatedly.
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}