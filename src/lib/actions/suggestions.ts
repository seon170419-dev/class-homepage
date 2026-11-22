"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTeacher, requireStudent } from "@/lib/session";
import { SuggestionCategory, SuggestionVisibility } from "@/generated/prisma/enums";

export type ActionState = { error?: string; success?: boolean };

export async function createSuggestionAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireStudent();
  if (!session) return { error: "학생 로그인이 필요합니다." };

  const category = String(formData.get("category") ?? "") as SuggestionCategory;
  const content = String(formData.get("content") ?? "").trim();
  const visibility = String(formData.get("visibility") ?? "TEACHER_ONLY") as SuggestionVisibility;

  if (!category || !content) {
    return { error: "내용을 입력해 주세요." };
  }

  await prisma.suggestion.create({
    data: { authorId: session.studentId, category, content, visibility },
  });

  revalidatePath("/suggestions");
  revalidatePath("/admin/suggestions");
  return { success: true };
}

export async function deleteSuggestionAction(id: string) {
  const session = await requireStudent();
  if (!session) throw new Error("권한이 없습니다.");

  const suggestion = await prisma.suggestion.findUnique({ where: { id } });
  if (!suggestion || suggestion.authorId !== session.studentId) {
    throw new Error("본인이 작성한 건의사항만 삭제할 수 있어요.");
  }

  await prisma.suggestion.delete({ where: { id } });

  revalidatePath("/suggestions");
  revalidatePath("/admin/suggestions");
}

export async function updateSuggestionAction(
  id: string,
  data: { status?: "APPROVED" | "REJECTED"; visibility?: SuggestionVisibility }
) {
  const session = await requireTeacher();
  if (!session) throw new Error("권한이 없습니다.");

  await prisma.suggestion.update({ where: { id }, data });

  revalidatePath("/suggestions");
  revalidatePath("/admin/suggestions");
}
