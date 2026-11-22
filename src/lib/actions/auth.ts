"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  hashPassword,
  LOGIN_MAX_ATTEMPTS,
  LOGIN_LOCK_MINUTES,
} from "@/lib/auth";
import {
  createSession,
  destroySession,
  requireTeacher,
  requireStudent,
} from "@/lib/session";

export type AuthActionState = { error?: string };

export async function loginTeacherAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "아이디와 비밀번호를 입력해 주세요." };
  }

  const teacher = await prisma.teacher.findUnique({ where: { username } });
  if (!teacher) {
    return { error: "아이디 또는 비밀번호가 올바르지 않습니다." };
  }

  const valid = await verifyPassword(password, teacher.passwordHash);
  if (!valid) {
    return { error: "아이디 또는 비밀번호가 올바르지 않습니다." };
  }

  await createSession({ role: "teacher", teacherId: teacher.id });
  redirect("/admin");
}

export async function logoutTeacherAction() {
  await destroySession();
  redirect("/admin/login");
}

export type ChangePasswordState = { error?: string; success?: boolean };

export async function changeTeacherPasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const session = await requireTeacher();
  if (!session) return { error: "권한이 없습니다." };

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "모든 항목을 입력해 주세요." };
  }
  if (newPassword.length < 8) {
    return { error: "새 비밀번호는 8자 이상이어야 해요." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "새 비밀번호가 서로 일치하지 않아요." };
  }

  const teacher = await prisma.teacher.findUniqueOrThrow({
    where: { id: session.teacherId },
  });

  const valid = await verifyPassword(currentPassword, teacher.passwordHash);
  if (!valid) {
    return { error: "현재 비밀번호가 올바르지 않아요." };
  }

  await prisma.teacher.update({
    where: { id: teacher.id },
    data: { passwordHash: await hashPassword(newPassword) },
  });

  return { success: true };
}

export async function changeStudentPasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const session = await requireStudent();
  if (!session) return { error: "권한이 없습니다." };

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "모든 항목을 입력해 주세요." };
  }
  if (newPassword.length < 8) {
    return { error: "새 비밀번호는 8자 이상이어야 해요." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "새 비밀번호가 서로 일치하지 않아요." };
  }

  const student = await prisma.student.findUniqueOrThrow({
    where: { id: session.studentId },
  });

  const valid = await verifyPassword(currentPassword, student.passwordHash);
  if (!valid) {
    return { error: "현재 비밀번호가 올바르지 않아요." };
  }

  await prisma.student.update({
    where: { id: student.id },
    data: { passwordHash: await hashPassword(newPassword) },
  });

  return { success: true };
}

export async function loginStudentAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const loginId = String(formData.get("loginId") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!loginId || !password) {
    return { error: "아이디와 비밀번호를 입력해 주세요." };
  }

  const student = await prisma.student.findUnique({ where: { loginId } });
  if (!student) {
    return { error: "아이디 또는 비밀번호가 올바르지 않습니다." };
  }

  if (student.lockedUntil && student.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil(
      (student.lockedUntil.getTime() - Date.now()) / 60000
    );
    return {
      error: `로그인 시도 횟수를 초과했습니다. ${minutesLeft}분 후 다시 시도해 주세요.`,
    };
  }

  const valid = await verifyPassword(password, student.passwordHash);
  if (!valid) {
    const nextCount = student.failedLoginCount + 1;
    const shouldLock = nextCount >= LOGIN_MAX_ATTEMPTS;
    await prisma.student.update({
      where: { id: student.id },
      data: {
        failedLoginCount: shouldLock ? 0 : nextCount,
        lockedUntil: shouldLock
          ? new Date(Date.now() + LOGIN_LOCK_MINUTES * 60_000)
          : null,
      },
    });
    return shouldLock
      ? {
          error: `로그인 시도 횟수를 초과했습니다. ${LOGIN_LOCK_MINUTES}분 후 다시 시도해 주세요.`,
        }
      : { error: "아이디 또는 비밀번호가 올바르지 않습니다." };
  }

  await prisma.student.update({
    where: { id: student.id },
    data: { failedLoginCount: 0, lockedUntil: null },
  });

  await createSession({ role: "student", studentId: student.id });
  redirect("/me");
}

export async function logoutStudentAction() {
  await destroySession();
  redirect("/me/login");
}
