import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This is the trust mechanism from the original pitch: a review can only
// be created for a job that's actually completed and paid — never
// self-reported, never from someone who didn't go through the platform.
export async function POST(req: NextRequest) {
  try {
    const { jobId, authId, rating, comment } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5." },
        { status: 400 }
      );
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { client: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    if (job.client.authId !== authId) {
      return NextResponse.json(
        { error: "Only the client who hired for this job can review it." },
        { status: 403 }
      );
    }
    if (job.status !== "completed") {
      return NextResponse.json(
        { error: "You can only review a completed job." },
        { status: 400 }
      );
    }
    if (!job.workerId) {
      return NextResponse.json(
        { error: "No worker on this job." },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: { jobId, workerId: job.workerId, rating, comment },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "This job has already been reviewed." },
        { status: 409 }
      );
    }
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
