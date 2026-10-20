import { NextResponse } from "next/server";
import { createReport, isDateTaken, listAllReports } from "@/lib/reports";
import { requireAuth } from "@/lib/session";
import { validateReportInput } from "@/lib/validation";
import { badRequest, dateTaken, isUniqueViolation } from "./_shared";

export async function GET() {
  const denied = await requireAuth();
  if (denied) return denied;
  return NextResponse.json({ reports: await listAllReports() });
}

export async function POST(req: Request) {
  const denied = await requireAuth();
  if (denied) return denied;

  const result = validateReportInput(await req.json().catch(() => null));
  if (!result.ok) return badRequest(result.errors);

  if (await isDateTaken(result.data.date)) return dateTaken();

  try {
    const report = await createReport(result.data);
    return NextResponse.json({ report }, { status: 201 });
  } catch (e) {
    if (isUniqueViolation(e)) return dateTaken(); // 并发写入兜底
    throw e;
  }
}
