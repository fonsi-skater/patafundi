import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { authId, url } = await req.json();
    if (!authId || !url) {
      return NextResponse.json({ error: "Missing authId or url" }, { status: 400 });
    }

    const worker = await prisma.worker.update({
      where: { authId },
      data: { profilePicUrl: url },
    });

    return NextResponse.json({ worker });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not update profile picture." }, { status: 500 });
  }
}
