"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, requireTeacher } from "@/lib/session";
import { uploadImageAction } from "@/lib/actions/uploads";

export type ActionState = { error?: string; success?: boolean };

export async function createLostItemAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "로그인이 필요합니다." };

  const title = String(formData.get("title") ?? "").trim();
  const foundLocation = String(formData.get("foundLocation") ?? "").trim();
  const photo = formData.get("photo") as File | null;

  if (!title || !foundLocation) {
    return { error: "물건 이름과 발견 장소를 입력해 주세요." };
  }

  let photoUrl: string | undefined;
  if (photo && photo.size > 0) {
    const result = await uploadImageAction(photo);
    if (result.error) return { error: result.error };
    photoUrl = result.url;
  }

  await prisma.lostItem.create({
    data: { title, foundLocation, photoUrl },
  });

  revalidatePath("/lost-and-found");
  return { success: true };
}

export async function markLostItemClaimedAction(id: string) {
  const session = await getSession();
  if (!session) throw new Error("로그인이 필요합니다.");

  await prisma.lostItem.update({ where: { id }, data: { status: "CLAIMED" } });
  revalidatePath("/lost-and-found");
}

export async function deleteLostItemAction(id: string) {
  const session = await requireTeacher();
  if (!session) throw new Error("권한이 없습니다.");

  await prisma.lostItem.delete({ where: { id } });
  revalidatePath("/lost-and-found");
}
