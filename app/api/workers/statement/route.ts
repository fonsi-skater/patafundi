import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";

export async function GET(req: NextRequest) {
  const authId = req.nextUrl.searchParams.get("authId");
  if (!authId) {
    return NextResponse.json({ error: "Missing authId" }, { status: 400 });
  }

  const worker = await prisma.worker.findUnique({
    where: { authId },
    include: {
      jobs: {
        where: { payment: { status: "released" } },
        include: { payment: true, client: { select: { fullName: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!worker) {
    return NextResponse.json({ error: "Worker not found" }, { status: 404 });
  }

  // Build the PDF into memory rather than writing to disk — Vercel's
  // serverless functions don't have a persistent filesystem to rely on.
  const chunks: Buffer[] = [];
  const doc = new PDFDocument({ margin: 50 });
  doc.on("data", (chunk) => chunks.push(chunk));

  const pdfPromise = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  // --- Header ---
  doc.fontSize(20).fillColor("#0A1512").text("PataKazi", { continued: false });
  doc.fontSize(10).fillColor("#666").text("Verified Workers. Secure Payments. Real Reviews.");
  doc.moveDown(1.5);

  doc.fontSize(16).fillColor("#0A1512").text("Earnings Statement");
  doc.fontSize(10).fillColor("#666").text(`Generated ${new Date().toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}`);
  doc.moveDown(1);

  doc.fontSize(11).fillColor("#000");
  doc.text(`Worker: ${worker.fullName}`);
  doc.text(`Skill: ${worker.skillCategory}`);
  doc.text(`Service area: ${worker.serviceArea}`);
  doc.text(`Phone: ${worker.phone}`);
  doc.moveDown(1.5);

  // --- Summary ---
  const totalGross = worker.jobs.reduce((s, j) => s + (j.payment?.amount ?? 0), 0);
  const totalFees = worker.jobs.reduce((s, j) => s + (j.payment?.platformFee ?? 0), 0);
  const totalNet = totalGross - totalFees;

  doc.fontSize(13).fillColor("#0A1512").text("Summary");
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor("#000");
  doc.text(`Completed & paid jobs: ${worker.jobs.length}`);
  doc.text(`Gross earnings: KES ${totalGross.toLocaleString()}`);
  doc.text(`Platform fees: KES ${totalFees.toLocaleString()}`);
  doc.font("Helvetica-Bold").text(`Net earnings: KES ${totalNet.toLocaleString()}`);
  doc.font("Helvetica");
  doc.moveDown(1.5);

  // --- Job history table (simple layout, no external table library needed) ---
  doc.fontSize(13).fillColor("#0A1512").text("Job History");
  doc.moveDown(0.5);

  const colX = { date: 50, client: 140, title: 280, net: 460 };
  doc.fontSize(9).fillColor("#666");
  doc.text("Date", colX.date, doc.y, { continued: false });
  doc.text("Client", colX.client, doc.y - 10);
  doc.text("Job", colX.title, doc.y - 10);
  doc.text("Net (KES)", colX.net, doc.y - 10);
  doc.moveDown(0.3);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#ddd").stroke();
  doc.moveDown(0.3);

  doc.fontSize(9).fillColor("#000");
  for (const job of worker.jobs) {
    const net = (job.payment?.amount ?? 0) - (job.payment?.platformFee ?? 0);
    const y = doc.y;
    doc.text(new Date(job.createdAt).toLocaleDateString("en-KE"), colX.date, y, { width: 85 });
    doc.text(job.client.fullName, colX.client, y, { width: 130 });
    doc.text(job.title, colX.title, y, { width: 170 });
    doc.text(net.toLocaleString(), colX.net, y);
    doc.moveDown(0.6);
  }

  if (worker.jobs.length === 0) {
    doc.fontSize(10).fillColor("#666").text("No completed, paid jobs yet.");
  }

  doc.moveDown(2);
  doc.fontSize(8).fillColor("#999").text(
    "This statement reflects jobs completed and paid through the PataKazi platform. Generated automatically — for verification, contact support@patakazi.com.",
    { width: 495 }
  );

  doc.end();
  const pdfBuffer = await pdfPromise;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="patakazi-statement-${worker.fullName.replace(/\s+/g, "-")}.pdf"`,
    },
  });
}
