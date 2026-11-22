"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTeacher } from "@/lib/session";
import { ResourceCategory } from "@/generated/prisma/enums";

export type ActionState = { error?: string; success?: boolean };

export async function createResourceAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireTeacher();
  if (!session) return { error: "권한이 없습니다." };

  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "") as ResourceCategory;
  const url = String(formData.get("url") ?? "").trim();

  if (!title || !category || !url) {
    return { error: "모든 항목을 입력해 주세요." };
  }

  await prisma.resource.create({ data: { title, category, url } });

  revalidatePath("/resources");
  revalidatePath("/admin/resources");
  return { success: true };
}

export async function deleteResourceAction(id: string) {
  const session = await requireTeacher();
  if (!session) throw new Error("권한이 없습니다.");

  await prisma.resource.delete({ where: { id } });
  revalidatePath("/resources");
  revalidatePath("/admin/resources");
}
