"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTeacher } from "@/lib/session";

export type ActionState = { error?: string; success?: boolean };

export async function createClassGoalAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireTeacher();
  if (!session) return { error: "권한이 없습니다." };

  const title = String(formData.get("title") ?? "").trim();
  const targetValue = Number(formData.get("targetValue") ?? 0);
  const month = String(formData.get("month") ?? "").trim();

  if (!title || !targetValue || !month) {
    return { error: "모든 항목을 입력해 주세요." };
  }

  await prisma.classGoal.create({
    data: { title, targetValue, month },
  });

  revalidatePath("/");
  revalidatePath("/admin/class-goals");
  return { success: true };
}

export async function updateClassGoalProgressAction(id: string, currentValue: number) {
  const session = await requireTeacher();
  if (!session) throw new Error("권한이 없습니다.");

  await prisma.classGoal.update({ where: { id }, data: { currentValue } });
  revalidatePath("/");
  revalidatePath("/admin/class-goals");
}

export async function deleteClassGoalAction(id: string) {
  const session = await requireTeacher();
  if (!session) throw new Error("권한이 없습니다.");

  await prisma.classGoal.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/class-goals");
}
