import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/sms";

export async function POST(req: NextRequest) {
  try {
    const { jobId, authId } = await req.json();

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { worker: true, client: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    if (job.worker?.authId !== authId) {
      return NextResponse.json(
        { error: "Only the assigned worker can mark this job done." },
        { status: 403 }
      );
    }
    if (job.status !== "in_progress") {
      return NextResponse.json(
        { error: "This job isn't in progress." },
        { status: 400 }
      );
    }

    await prisma.job.update({
      where: { id: jobId },
      data: { status: "awaiting_confirmation" },
    });

    sendSms(
      job.client.phone,
      `PataKazi: "${job.title}" has been marked done by your worker. Log in to confirm and release payment.`
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
