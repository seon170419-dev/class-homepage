"use server";

import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { generateRandomPassword, hashPassword } from "@/lib/auth";
import { isSetupComplete } from "@/lib/site";
import { makeLoginId, parseRoster, uniqueLoginId } from "@/lib/student-ids";

export type SetupCredential = { number: number | null; name: string; loginId: string; password: string };

export type SetupState = {
  error?: string;
  rosterErrors?: string[];
  done?: { adminUsername: string; credentials: SetupCredential[] };
};

export async function runSetupAction(_prev: SetupState, formData: FormData): Promise<SetupState> {
  if (await isSetupComplete()) {
    return { error: "이미 설치가 완료된 사이트예요. 관리자 로그인 화면을 이용해 주세요." };
  }

  const expectedCode = process.env.SETUP_CODE?.trim();
  const setupCode = String(formData.get("setupCode") ?? "").trim();
  if (expectedCode && setupCode !== expectedCode) {
    return { error: "설치 코드가 맞지 않아요. 배포할 때 입력한 SETUP_CODE를 확인해 주세요." };
  }

  const siteTitle = String(formData.get("siteTitle") ?? "").trim();
  const schoolName = String(formData.get("schoolName") ?? "").trim() || null;
  const className = String(formData.get("className") ?? "").trim() || null;
  const teacherName = String(formData.get("teacherName") ?? "").trim() || null;
  const adminUsername = String(formData.get("adminUsername") ?? "").trim();
  const adminPassword = String(formData.get("adminPassword") ?? "");
  const adminPasswordConfirm = String(formData.get("adminPasswordConfirm") ?? "");
  const rosterText = String(formData.get("roster") ?? "");

  if (!siteTitle) return { error: "사이트 이름을 입력해 주세요." };
  if (!/^[a-zA-Z0-9_.-]{3,20}$/.test(adminUsername)) {
    return { error: "관리자 아이디는 영문·숫자 3~20자로 입력해 주세요." };
  }
  if (adminPassword.length < 8) return { error: "관리자 비밀번호는 8자 이상이어야 해요." };
  if (adminPassword !== adminPasswordConfirm) return { error: "관리자 비밀번호가 서로 달라요." };

  const { rows, errors } = parseRoster(rosterText);
  if (errors.length > 0) {
    return { error: "학생 명단에서 읽을 수 없는 줄이 있어요.", rosterErrors: errors };
  }
  if (rows.length === 0) return { error: "학생 명단을 붙여넣어 주세요." };

  const taken = new Set<string>();
  const credentials: SetupCredential[] = rows.map((r) => ({
    number: r.number,
    name: r.name,
    loginId: uniqueLoginId(makeLoginId(r.name, r.birthDate), taken),
    password: generateRandomPassword(),
  }));

  const studentData = await Promise.all(
    rows.map(async (r, i) => ({
      name: r.name,
      number: r.number,
      birthDate: r.birthDate,
      loginId: credentials[i].loginId,
      passwordHash: await hashPassword(credentials[i].password),
    }))
  );

  const teacher = await prisma.$transaction(async (tx) => {
    await tx.siteSetting.upsert({
      where: { id: "site" },
      create: { id: "site", siteTitle, schoolName, className, teacherName },
      update: { siteTitle, schoolName, className, teacherName },
    });
    const created = await tx.teacher.create({
      data: {
        username: adminUsername,
        passwordHash: await hashPassword(adminPassword),
        displayName: teacherName ? `${teacherName} 선생님` : "담임 선생님",
      },
    });
    await tx.student.createMany({ data: studentData });
    return created;
  });

  await createSession({ role: "teacher", teacherId: teacher.id });

  return { done: { adminUsername, credentials } };
}
