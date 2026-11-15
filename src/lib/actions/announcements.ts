"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTeacher, requireStudent } from "@/lib/session";
import { AnnouncementCategory } from "@/generated/prisma/enums";
import { uploadFileAction } from "@/lib/actions/uploads";

export type ActionState = { error?: string; success?: boolean };

export async function createAnnouncementAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireTeacher();
  if (!session) return { error: "권한이 없습니다." };

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const category = String(formData.get("category") ?? "") as AnnouncementCategory;
  const pinned = formData.get("pinned") === "on";
  const attachment = formData.get("attachment") as File | null;

  if (!title || !body || !category) {
    return { error: "필수 항목을 입력해 주세요." };
  }

  let attachmentUrl: string | undefined;
  let attachmentName: string | undefined;
  if (attachment && attachment.size > 0) {
    const result = await uploadFileAction(attachment);
    if (result.error) return { error: result.error };
    attachmentUrl = result.url;
    attachmentName = result.name;
  }

  await prisma.announcement.create({
    data: { title, body, category, pinned, attachmentUrl, attachmentName },
  });

  revalidatePath("/");
  revalidatePath("/admin/announcements");
  return { success: true };
}

export async function updateAnnouncementAction(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireTeacher();
  if (!session) return { error: "권한이 없습니다." };

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const category = String(formData.get("category") ?? "") as AnnouncementCategory;
  const pinned = formData.get("pinned") === "on";
  const removeAttachment = formData.get("removeAttachment") === "on";
  const attachment = formData.get("attachment") as File | null;

  if (!title || !body || !category) {
    return { error: "필수 항목을 입력해 주세요." };
  }

  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) return { error: "존재하지 않는 공지예요." };

  let attachmentUrl = existing.attachmentUrl;
  let attachmentName = existing.attachmentName;
  if (attachment && attachment.size > 0) {
    const result = await uploadFileAction(attachment);
    if (result.error) return { error: result.error };
    attachmentUrl = result.url ?? null;
    attachmentName = result.name ?? null;
  } else if (removeAttachment) {
    attachmentUrl = null;
    attachmentName = null;
  }

  await prisma.announcement.update({
    where: { id },
    data: { title, body, category, pinned, attachmentUrl, attachmentName },
  });

  revalidatePath("/");
  revalidatePath("/admin/announcements");
  return { success: true };
}

export async function setAnnouncementPinnedAction(id: string, pinned: boolean) {
  const session = await requireTeacher();
  if (!session) throw new Error("권한이 없습니다.");

  await prisma.announcement.update({ where: { id }, data: { pinned } });
  revalidatePath("/");
  revalidatePath("/admin/announcements");
}

export async function setAnnouncementVisibleAction(id: string, visibleOnHome: boolean) {
  const session = await requireTeacher();
  if (!session) throw new Error("권한이 없습니다.");

  await prisma.announcement.update({ where: { id }, data: { visibleOnHome } });
  revalidatePath("/");
  revalidatePath("/admin/announcements");
}

export async function deleteAnnouncementAction(id: string) {
  const session = await requireTeacher();
  if (!session) throw new Error("권한이 없습니다.");

  await prisma.announcement.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/announcements");
}

export async function markAnnouncementReadAction(announcementId: string) {
  const session = await requireStudent();
  if (!session) throw new Error("학생 로그인이 필요합니다.");

  await prisma.announcementRead.upsert({
    where: {
      announcementId_studentId: {
        announcementId,
        studentId: session.studentId,
      },
    },
    create: { announcementId, studentId: session.studentId },
    update: {},
  });

  revalidatePath("/");
  revalidatePath("/admin/announcements");
}
