"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTeacher, requireStudent } from "@/lib/session";
import { draftActivityRecord } from "@/lib/ai";
import { uploadImageAction } from "@/lib/actions/uploads";
import { ActivityArea, ActivityStatus } from "@/generated/prisma/enums";

export type ActionState = { error?: string; success?: boolean };

export async function createActivityRecordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireStudent();
  if (!session) return { error: "학생 로그인이 필요합니다." };

  const date = String(formData.get("date") ?? "");
  const area = String(formData.get("area") ?? "") as ActivityArea;
  const title = String(formData.get("title") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim() || null;
  const actions = String(formData.get("actions") ?? "").trim() || null;
  const difficulty = String(formData.get("difficulty") ?? "").trim() || null;
  const solution = String(formData.get("solution") ?? "").trim() || null;
  const learned = String(formData.get("learned") ?? "").trim() || null;
  const peerOrTeacherConfirmable = formData.get("peerOrTeacherConfirmable") === "on";
  const evidence = formData.get("evidence") as File | null;

  if (!date || !area || !title) {
    return { error: "활동 날짜, 영역, 활동명은 필수예요." };
  }

  let evidenceUrl: string | undefined;
  if (evidence && evidence.size > 0) {
    const result = await uploadImageAction(evidence);
    if (result.error) return { error: result.error };
    evidenceUrl = result.url;
  }

  await prisma.activityRecord.create({
    data: {
      studentId: session.studentId,
      date: new Date(`${date}T00:00`),
      area,
      title,
      role,
      actions,
      difficulty,
      solution,
      learned,
      evidenceUrl,
      peerOrTeacherConfirmable,
      status: "DRAFTED",
    },
  });

  revalidatePath("/me/activities");
  revalidatePath("/admin/activities");
  return { success: true };
}

export async function updateActivityRecordAction(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireStudent();
  if (!session) return { error: "학생 로그인이 필요합니다." };

  const existing = await prisma.activityRecord.findUnique({ where: { id } });
  if (!existing || existing.studentId !== session.studentId) {
    return { error: "본인의 기록만 수정할 수 있어요." };
  }

  const date = String(formData.get("date") ?? "");
  const area = String(formData.get("area") ?? "") as ActivityArea;
  const title = String(formData.get("title") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim() || null;
  const actions = String(formData.get("actions") ?? "").trim() || null;
  const difficulty = String(formData.get("difficulty") ?? "").trim() || null;
  const solution = String(formData.get("solution") ?? "").trim() || null;
  const learned = String(formData.get("learned") ?? "").trim() || null;
  const peerOrTeacherConfirmable = formData.get("peerOrTeacherConfirmable") === "on";
  const evidence = formData.get("evidence") as File | null;

  if (!date || !area || !title) {
    return { error: "활동 날짜, 영역, 활동명은 필수예요." };
  }

  let evidenceUrl = existing.evidenceUrl;
  if (evidence && evidence.size > 0) {
    const result = await uploadImageAction(evidence);
    if (result.error) return { error: result.error };
    evidenceUrl = result.url ?? null;
  }

  await prisma.activityRecord.update({
    where: { id },
    data: {
      date: new Date(`${date}T00:00`),
      area,
      title,
      role,
      actions,
      difficulty,
      solution,
      learned,
      evidenceUrl,
      peerOrTeacherConfirmable,
      studentEditedAt: new Date(),
    },
  });

  revalidatePath(`/me/activities/${id}`);
  revalidatePath("/me/activities");
  revalidatePath("/admin/activities");
  revalidatePath(`/admin/activities/${id}`);
  return { success: true };
}

export async function addStudentNoteAction(id: string, note: string) {
  const session = await requireStudent();
  if (!session) throw new Error("학생 로그인이 필요합니다.");

  const record = await prisma.activityRecord.findUnique({ where: { id } });
  if (!record || record.studentId !== session.studentId) {
    throw new Error("본인의 기록만 수정할 수 있어요.");
  }

  await prisma.activityRecord.update({
    where: { id },
    data: { studentNote: note, status: "STUDENT_CONFIRMED" },
  });

  revalidatePath(`/me/activities/${id}`);
  revalidatePath("/admin/activities");
}

export async function updateActivityReviewAction(
  id: string,
  data: { teacherDraftText?: string; status?: ActivityStatus }
) {
  const session = await requireTeacher();
  if (!session) throw new Error("권한이 없습니다.");

  await prisma.activityRecord.update({ where: { id }, data });

  revalidatePath("/admin/activities");
  revalidatePath(`/admin/activities/${id}`);
  revalidatePath("/me/activities");
}

export async function generateAiDraftAction(id: string): Promise<{ draft?: string; error?: string }> {
  const session = await requireTeacher();
  if (!session) return { error: "권한이 없습니다." };

  const record = await prisma.activityRecord.findUnique({ where: { id } });
  if (!record) return { error: "기록을 찾을 수 없어요." };

  const areaLabel = record.area;
  const draft = await draftActivityRecord({
    area: areaLabel,
    title: record.title,
    role: record.role,
    actions: record.actions,
    difficulty: record.difficulty,
    solution: record.solution,
    learned: record.learned,
  });

  if (!draft) return { error: "AI 기능이 비활성화되어 있어요 (OPENAI_API_KEY 미설정)." };
  return { draft };
}
