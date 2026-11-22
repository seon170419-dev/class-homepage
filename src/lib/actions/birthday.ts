"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTeacher, requireStudent } from "@/lib/session";
import { moderateText } from "@/lib/moderation";

export type ActionState = { error?: string; success?: boolean };

export async function createBirthdayMessageAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireStudent();
  if (!session) return { error: "학생 로그인이 필요합니다." };

  const targetStudentId = String(formData.get("targetStudentId") ?? "");
  const message = String(formData.get("message") ?? "").trim();

  if (!targetStudentId || !message) {
    return { error: "메시지를 입력해 주세요." };
  }
  if (message.length < 5) {
    return { error: "조금 더 마음을 담아 적어 주세요 (5자 이상)." };
  }

  const target = await prisma.student.findUnique({ where: { id: targetStudentId } });
  if (!target || !target.commentOptIn) {
    return { error: "해당 학생은 축하 메시지 기능을 사용하지 않아요." };
  }

  const { flaggedByAi, aiFlagReason } = await moderateText(message);

  await prisma.birthdayMessage.create({
    data: {
      targetStudentId,
      authorStudentId: session.studentId,
      message,
      flaggedByAi,
      aiFlagReason,
    },
  });

  revalidatePath("/birthday");
  revalidatePath("/admin/birthday-messages");
  return { success: true };
}

export async function moderateBirthdayMessageAction(id: string, approve: boolean) {
  const session = await requireTeacher();
  if (!session) throw new Error("권한이 없습니다.");

  await prisma.birthdayMessage.update({
    where: { id },
    data: { status: approve ? "APPROVED" : "REJECTED" },
  });

  revalidatePath("/birthday");
  revalidatePath("/admin/birthday-messages");
}
