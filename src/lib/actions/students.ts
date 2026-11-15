"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTeacher, requireStudent } from "@/lib/session";
import { generateRandomPassword, hashPassword } from "@/lib/auth";
import { makeLoginId, parseBirthDate, uniqueLoginId } from "@/lib/student-ids";

export type ActionState = { error?: string; success?: boolean };
export type CreateStudentState = ActionState & {
  credentials?: { name: string; loginId: string; password: string };
};

export async function createStudentAction(
  _prev: CreateStudentState,
  formData: FormData
): Promise<CreateStudentState> {
  const session = await requireTeacher();
  if (!session) return { error: "권한이 없습니다." };

  const name = String(formData.get("name") ?? "").trim();
  const birthDate = parseBirthDate(String(formData.get("birthDate") ?? ""));
  const numberRaw = String(formData.get("number") ?? "").trim();

  if (!name || !birthDate) {
    return { error: "이름과 생일(예: 07-12)을 입력해 주세요." };
  }

  const existingIds = await prisma.student.findMany({ select: { loginId: true } });
  const loginId = uniqueLoginId(
    makeLoginId(name, birthDate),
    new Set(existingIds.map((s) => s.loginId))
  );
  const password = generateRandomPassword();

  await prisma.student.create({
    data: {
      name,
      birthDate,
      number: numberRaw ? Number(numberRaw) : null,
      loginId,
      passwordHash: await hashPassword(password),
    },
  });

  revalidatePath("/admin/students");
  return { success: true, credentials: { name, loginId, password } };
}

export async function updateStudentAction(
  studentId: string,
  data: { name: string; birthDate: string; number: number | null }
): Promise<ActionState> {
  const session = await requireTeacher();
  if (!session) return { error: "권한이 없습니다." };

  const name = data.name.trim();
  const birthDate = data.birthDate.trim();

  if (!name || !birthDate) {
    return { error: "이름과 생일을 입력해 주세요." };
  }

  await prisma.student.update({
    where: { id: studentId },
    data: { name, birthDate, number: data.number },
  });

  revalidatePath("/admin/students");
  return { success: true };
}

export async function resetStudentPasswordAction(
  studentId: string
): Promise<{ password: string }> {
  const session = await requireTeacher();
  if (!session) throw new Error("권한이 없습니다.");

  const password = generateRandomPassword();
  await prisma.student.update({
    where: { id: studentId },
    data: {
      passwordHash: await hashPassword(password),
      failedLoginCount: 0,
      lockedUntil: null,
    },
  });

  revalidatePath("/admin/students");
  return { password };
}

export async function deleteStudentAction(studentId: string) {
  const session = await requireTeacher();
  if (!session) throw new Error("권한이 없습니다.");

  await prisma.student.delete({ where: { id: studentId } });
  revalidatePath("/admin/students");
}

export async function updateBirthdaySettingsAction(formData: FormData) {
  const session = await requireStudent();
  if (!session) throw new Error("학생 로그인이 필요합니다.");

  await prisma.student.update({
    where: { id: session.studentId },
    data: {
      birthdayPublic: formData.get("birthdayPublic") === "on",
      popupOptIn: formData.get("popupOptIn") === "on",
      commentOptIn: formData.get("commentOptIn") === "on",
    },
  });

  revalidatePath("/me");
  revalidatePath("/");
}
