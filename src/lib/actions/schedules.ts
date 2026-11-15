"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTeacher, requireStudent } from "@/lib/session";
import { ScheduleCategory, SubmissionStatus } from "@/generated/prisma/enums";

export type ActionState = { error?: string; success?: boolean };

function parseDateTime(dateStr: string, timeStr: string): Date {
  return new Date(`${dateStr}T${timeStr || "00:00"}`);
}

export async function createScheduleAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireTeacher();
  if (!session) return { error: "권한이 없습니다." };

  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "") as ScheduleCategory;
  const subject = String(formData.get("subject") ?? "").trim() || null;
  const startDate = String(formData.get("startDate") ?? "");
  const dueDate = String(formData.get("dueDate") ?? "");
  const dueTime = String(formData.get("dueTime") ?? "23:59");
  const description = String(formData.get("description") ?? "").trim() || null;
  const submissionMethod = String(formData.get("submissionMethod") ?? "").trim() || null;
  const submissionLink = String(formData.get("submissionLink") ?? "").trim() || null;
  const materials = String(formData.get("materials") ?? "").trim() || null;
  const submissionRequired = formData.get("submissionRequired") === "on";

  if (!title || !category || !startDate || !dueDate) {
    return { error: "필수 항목을 입력해 주세요." };
  }

  await prisma.scheduleItem.create({
    data: {
      title,
      category,
      subject,
      startAt: parseDateTime(startDate, "00:00"),
      dueAt: parseDateTime(dueDate, dueTime),
      description,
      submissionMethod,
      submissionLink,
      materials,
      submissionRequired,
    },
  });

  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/admin/schedules");
  return { success: true };
}

export async function updateScheduleAction(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireTeacher();
  if (!session) return { error: "권한이 없습니다." };

  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "") as ScheduleCategory;
  const subject = String(formData.get("subject") ?? "").trim() || null;
  const startDate = String(formData.get("startDate") ?? "");
  const dueDate = String(formData.get("dueDate") ?? "");
  const dueTime = String(formData.get("dueTime") ?? "23:59");
  const description = String(formData.get("description") ?? "").trim() || null;
  const submissionMethod = String(formData.get("submissionMethod") ?? "").trim() || null;
  const submissionLink = String(formData.get("submissionLink") ?? "").trim() || null;
  const materials = String(formData.get("materials") ?? "").trim() || null;
  const submissionRequired = formData.get("submissionRequired") === "on";

  if (!title || !category || !startDate || !dueDate) {
    return { error: "필수 항목을 입력해 주세요." };
  }

  await prisma.scheduleItem.update({
    where: { id },
    data: {
      title,
      category,
      subject,
      startAt: parseDateTime(startDate, "00:00"),
      dueAt: parseDateTime(dueDate, dueTime),
      description,
      submissionMethod,
      submissionLink,
      materials,
      submissionRequired,
    },
  });

  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/admin/schedules");
  return { success: true };
}

export async function deleteScheduleAction(id: string) {
  const session = await requireTeacher();
  if (!session) throw new Error("권한이 없습니다.");

  await prisma.scheduleItem.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/admin/schedules");
}

export async function setSubmissionStatusAction(
  scheduleItemId: string,
  status: SubmissionStatus
) {
  const session = await requireStudent();
  if (!session) throw new Error("학생 로그인이 필요합니다.");

  await prisma.submission.upsert({
    where: {
      scheduleItemId_studentId: {
        scheduleItemId,
        studentId: session.studentId,
      },
    },
    create: {
      scheduleItemId,
      studentId: session.studentId,
      status,
      submittedAt: status === "SUBMITTED" ? new Date() : null,
    },
    update: {
      status,
      submittedAt: status === "SUBMITTED" ? new Date() : null,
    },
  });

  revalidatePath("/calendar");
  revalidatePath("/");
}
