import { NextResponse } from "next/server";
import { deleteReport, getReportById, isDateTaken, updateReport } from "@/lib/reports";
import { requireAuth } from "@/lib/session";
import { validateReportInput } from "@/lib/validation";
import { badRequest, dateTaken, isNotFound, isUniqueViolation, notFound, parseId } from "../_shared";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const denied = await requireAuth();
  if (denied) return denied;

  const id = parseId(params.id);
  const report = id ? await getReportById(id) : null;
  return report ? NextResponse.json({ report }) : notFound();
}

/** 完整更新（编辑页保存） */
export async function PUT(req: Request, { params }: Ctx) {
  const denied = await requireAuth();
  if (denied) return denied;

  const id = parseId(params.id);
  if (!id) return notFound();

  const result = validateReportInput(await req.json().catch(() => null));
  if (!result.ok) return badRequest(result.errors);

  if (await isDateTaken(result.data.date, id)) return dateTaken();

  try {
    return NextResponse.json({ report: await updateReport(id, result.data) });
  } catch (e) {
    if (isUniqueViolation(e)) return dateTaken();
    if (isNotFound(e)) return notFound();
    throw e;
  }
}

/** 局部更新：目前只用于切换发布状态 */
export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await requireAuth();
  if (denied) return denied;

  const id = parseId(params.id);
  if (!id) return notFound();

  const body = await req.json().catch(() => null);
  if (typeof body?.published !== "boolean") {
    return badRequest({ published: "published 必须是布尔值" });
  }

  try {
    return NextResponse.json({ report: await updateReport(id, { published: body.published }) });
  } catch (e) {
    if (isNotFound(e)) return notFound();
    throw e;
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await requireAuth();
  if (denied) return denied;

  const id = parseId(params.id);
  if (!id) return notFound();

  try {
    await deleteReport(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (isNotFound(e)) return notFound();
    throw e;
  }
}
