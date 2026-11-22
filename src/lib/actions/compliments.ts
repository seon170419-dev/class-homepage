"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTeacher, requireStudent } from "@/lib/session";
import { moderateText } from "@/lib/moderation";
import { suggestComplimentTag } from "@/lib/ai";
import {
  ComplimentValueTag,
  ComplimentVisibility,
} from "@/generated/prisma/enums";

export type ActionState = { error?: string; success?: boolean };

export async function suggestComplimentTagAction(
  whatDidText: string
): Promise<ComplimentValueTag | null> {
  const session = await requireStudent();
  if (!session) return null;
  if (!whatDidText.trim()) return null;
  return suggestComplimentTag(whatDidText);
}

export async function createComplimentAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireStudent();
  if (!session) return { error: "학생 로그인이 필요합니다." };

  const targetStudentId = String(formData.get("targetStudentId") ?? "");
  const occurredAt = String(formData.get("occurredAt") ?? "").trim();
  const whatDidText = String(formData.get("whatDidText") ?? "").trim();
  const whatToLearnText = String(formData.get("whatToLearnText") ?? "").trim();
  const valueTag = String(formData.get("valueTag") ?? "") as ComplimentValueTag;
  const visibility = String(formData.get("visibility") ?? "CLASS_PUBLIC") as ComplimentVisibility;

  if (targetStudentId === session.studentId) {
    return { error: "자기 자신은 칭찬할 수 없어요." };
  }
  if (!targetStudentId || !occurredAt || !whatDidText || !whatToLearnText || !valueTag) {
    return { error: "모든 항목을 입력해 주세요." };
  }
  if (whatDidText.length < 10) {
    return { error: "어떤 행동을 했는지 조금 더 구체적으로 적어 주세요 (10자 이상)." };
  }

  const { flaggedByAi, aiFlagReason } = await moderateText(
    `${whatDidText}\n${whatToLearnText}`
  );

  await prisma.compliment.create({
    data: {
      targetStudentId,
      authorStudentId: session.studentId,
      occurredAt,
      whatDidText,
      whatToLearnText,
      valueTag,
      visibility,
      flaggedByAi,
      aiFlagReason,
    },
  });

  revalidatePath("/compliments");
  revalidatePath("/admin/compliments");
  return { success: true };
}

export async function moderateComplimentAction(
  id: string,
  approve: boolean
) {
  const session = await requireTeacher();
  if (!session) throw new Error("권한이 없습니다.");

  await prisma.compliment.update({
    where: { id },
    data: { status: approve ? "APPROVED" : "REJECTED", featuredOnHome: false },
  });

  revalidatePath("/");
  revalidatePath("/compliments");
  revalidatePath("/admin/compliments");
}

export async function setComplimentFeaturedAction(id: string, featured: boolean) {
  const session = await requireTeacher();
  if (!session) throw new Error("권한이 없습니다.");

  const compliment = await prisma.compliment.findUnique({ where: { id } });
  if (!compliment || compliment.status !== "APPROVED" || compliment.visibility !== "CLASS_PUBLIC") {
    throw new Error("승인된 전체공개 칭찬만 대시보드에 게시할 수 있어요.");
  }

  await prisma.compliment.update({ where: { id }, data: { featuredOnHome: featured } });

  revalidatePath("/");
  revalidatePath("/admin/compliments");
}
