"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTeacher } from "@/lib/session";

export type ActionState = { error?: string; success?: boolean };

export async function createClassRoleAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireTeacher();
  if (!session) return { error: "권한이 없습니다." };

  const studentId = String(formData.get("studentId") ?? "");
  const role = String(formData.get("role") ?? "").trim();
  const date = String(formData.get("date") ?? "");

  if (!studentId || !role || !date) {
    return { error: "모든 항목을 입력해 주세요." };
  }

  await prisma.classRole.create({
    data: { studentId, role, date: new Date(`${date}T00:00`) },
  });

  revalidatePath("/");
  revalidatePath("/admin/class-roles");
  return { success: true };
}

export async function deleteClassRoleAction(id: string) {
  const session = await requireTeacher();
  if (!session) throw new Error("권한이 없습니다.");

  await prisma.classRole.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/class-roles");
}
