import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Takes the signer's authId and figures out — server-side, not trusting
// anything the browser claims — whether they're the client or the worker
// on this job. This matters: we never let the browser just say "I'm the
// worker, mark me signed" without verifying it against the database.
export async function POST(req: NextRequest) {
  try {
    const { jobId, authId } = await req.json();

    if (!jobId || !authId) {
      return NextResponse.json(
        { error: "Missing jobId or authId" },
        { status: 400 }
      );
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { contract: true, client: true, worker: true },
    });

    if (!job || !job.contract) {
      return NextResponse.json(
        { error: "Job or contract not found" },
        { status: 404 }
      );
    }

    const isClient = job.client.authId === authId;
    const isWorker = job.worker?.authId === authId;

    if (!isClient && !isWorker) {
      return NextResponse.json(
        { error: "You are not a party to this job." },
        { status: 403 }
      );
    }

    const updatedContract = await prisma.contract.update({
      where: { jobId },
      data: {
        signedByClient: isClient ? true : job.contract.signedByClient,
        signedByWorker: isWorker ? true : job.contract.signedByWorker,
      },
    });

    // Once both parties have signed, the job moves from "pending" to
    // "contracted" — this status is what Step 6 (payments) will check
    // before allowing money to move.
    if (updatedContract.signedByClient && updatedContract.signedByWorker) {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: "contracted" },
      });
    }

    return NextResponse.json({ contract: updatedContract });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong signing this contract." },
      { status: 500 }
    );
  }
}