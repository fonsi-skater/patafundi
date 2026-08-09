import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authId = req.nextUrl.searchParams.get("authId");
  if (!authId) {
    return NextResponse.json({ error: "Missing authId" }, { status: 400 });
  }

  const worker = await prisma.worker.findUnique({
    where: { authId },
    include: {
      jobs: {
        orderBy: { createdAt: "desc" },
        include: {
          payment: true,
          contract: true,
          client: { select: { fullName: true } },
        },
      },
      reviews: true,
    },
  });

  if (!worker) {
    return NextResponse.json({ error: "No worker profile found" }, { status: 404 });
  }

  return NextResponse.json({ worker });
}
