"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTeacher } from "@/lib/session";
import { uploadImageAction } from "@/lib/actions/uploads";

export type ActionState = { error?: string; success?: boolean };

export async function createArchiveEntryAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireTeacher();
  if (!session) return { error: "권한이 없습니다." };

  const title = String(formData.get("title") ?? "").trim();
  const month = String(formData.get("month") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const photos = formData.getAll("photos") as File[];

  if (!title || !month) {
    return { error: "제목과 월을 입력해 주세요." };
  }

  const urls: string[] = [];
  for (const photo of photos) {
    if (photo && photo.size > 0) {
      const result = await uploadImageAction(photo);
      if (result.url) urls.push(result.url);
    }
  }

  await prisma.archiveEntry.create({
    data: { title, month, description, photoUrls: JSON.stringify(urls) },
  });

  revalidatePath("/archive");
  revalidatePath("/admin/archive");
  return { success: true };
}

export async function deleteArchiveEntryAction(id: string) {
  const session = await requireTeacher();
  if (!session) throw new Error("권한이 없습니다.");

  await prisma.archiveEntry.delete({ where: { id } });
  revalidatePath("/archive");
  revalidatePath("/admin/archive");
}
