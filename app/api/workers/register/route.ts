import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { authId, fullName, phone, skillCategory, serviceArea, bio } = body;

    if (!authId || !fullName || !phone || !skillCategory || !serviceArea) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const worker = await prisma.worker.create({
      data: { authId, fullName, phone, skillCategory, serviceArea, bio },
    });

    return NextResponse.json({ worker }, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "An account with that phone number already exists." },
        { status: 409 }
      );
    }
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong creating your profile." },
      { status: 500 }
    );
  }
}
