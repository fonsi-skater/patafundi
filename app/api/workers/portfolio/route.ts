import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { authId, urls } = await req.json();
    if (!authId || !Array.isArray(urls)) {
      return NextResponse.json({ error: "Missing authId or urls" }, { status: 400 });
    }

    const worker = await prisma.worker.update({
      where: { authId },
      data: { portfolioImages: urls },
    });

    return NextResponse.json({ worker });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not update portfolio." }, { status: 500 });
  }
}
