import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/sms";

// Takes the logged-in client's authId (not their internal Client.id — the
// browser only knows the Supabase auth id), looks up their Client row,
// then creates the Job linked to both that client and the chosen worker.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { authId, workerId, title, description, price } = body;

    if (!authId || !workerId || !title || !description || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await prisma.client.findUnique({ where: { authId } });
    if (!client) {
      return NextResponse.json(
        { error: "No client profile found for this account." },
        { status: 404 }
      );
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        price: Number(price),
        clientId: client.id,
        workerId,
        status: "pending",
        contract: {
          create: {
            scope: description,
            agreedPrice: Number(price),
          },
        },
      },
      include: { worker: true },
    });

    if (job.worker) {
      sendSms(
        job.worker.phone,
        `Patakazi: New job request "${title}" from ${client.fullName}. Open the app to view and sign the contract.`
      );
    }

    return NextResponse.json({ job }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong posting this job." },
      { status: 500 }
    );
  }
}
