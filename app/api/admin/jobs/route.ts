import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAdmin(email: string | undefined) {
  return !!email && email === process.env.ADMIN_EMAIL;
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email") ?? undefined;
  if (!isAdmin(email)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { fullName: true } },
      worker: { select: { fullName: true } },
      payment: true,
    },
  });

  return NextResponse.json({ jobs });
}
