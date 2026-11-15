"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTeacher, requireStudent } from "@/lib/session";
import { CounselingCategory, CounselingStatus } from "@/generated/prisma/enums";

export type ActionState = { error?: string; success?: boolean };

export async function createCounselingRequestAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireStudent();
  if (!session) return { error: "학생 로그인이 필요합니다." };

  const category = String(formData.get("category") ?? "") as CounselingCategory;
  const preferredTime = String(formData.get("preferredTime") ?? "").trim() || null;
  const urgent = category === "URGENT";

  if (!category) {
    return { error: "상담 종류를 선택해 주세요." };
  }

  await prisma.counselingRequest.create({
    data: { studentId: session.studentId, category, preferredTime, urgent },
  });

  revalidatePath("/counseling");
  revalidatePath("/admin/counseling");
  return { success: true };
}

export async function updateCounselingStatusAction(
  id: string,
  status: CounselingStatus,
  teacherNote?: string
) {
  const session = await requireTeacher();
  if (!session) throw new Error("권한이 없습니다.");

  await prisma.counselingRequest.update({
    where: { id },
    data: {
      status,
      ...(teacherNote !== undefined ? { teacherNote: teacherNote.trim() || null } : {}),
    },
  });
  revalidatePath("/admin/counseling");
  revalidatePath("/counseling");
}
