"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export type RecoverState = { error?: string; username?: string };

// 관리자 비밀번호 찾기: 배포 때 정한 SETUP_CODE(Vercel 환경변수, 사이트 주인만 볼 수 있음)로 본인 확인.
export async function recoverAdminAction(_prev: RecoverState, formData: FormData): Promise<RecoverState> {
  const expected = process.env.SETUP_CODE?.trim();
  if (!expected) return { error: "이 사이트에는 설치 코드가 설정되어 있지 않아 비밀번호 찾기를 쓸 수 없어요." };

  // 설치 코드를 마구 넣어보는 시도를 늦춘다.
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const code = String(formData.get("setupCode") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (code !== expected) return { error: "설치 코드가 맞지 않아요." };
  if (newPassword.length < 8) return { error: "새 비밀번호는 8자 이상이어야 해요." };
  if (newPassword !== confirm) return { error: "새 비밀번호가 서로 달라요." };

  const teacher = await prisma.teacher.findFirst({ orderBy: { createdAt: "asc" } });
  if (!teacher) return { error: "아직 설치가 끝나지 않은 사이트예요." };

  await prisma.teacher.update({
    where: { id: teacher.id },
    data: { passwordHash: await hashPassword(newPassword) },
  });

  return { username: teacher.username };
}
