import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// NOTE: this checks the email the browser SENDS, not a verified server
// session — acceptable for now on a small sandbox project, but not
// something to rely on once real users and real money are involved.
// Hardening this properly means checking Supabase's session server-side
// via cookies, which needs the @supabase/ssr package we haven't added yet.
function isAdmin(email: string | undefined) {
  return !!email && email === process.env.ADMIN_EMAIL;
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email") ?? undefined;
  if (!isAdmin(email)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const workers = await prisma.worker.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ workers });
}

export async function POST(req: NextRequest) {
  const { email, workerId, verified } = await req.json();
  if (!isAdmin(email)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const worker = await prisma.worker.update({
    where: { id: workerId },
    data: { idVerified: verified },
  });

  return NextResponse.json({ worker });
}
