"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTeacher } from "@/lib/session";
import { uploadImageAction } from "@/lib/actions/uploads";

export type SiteSettingsState = { error?: string; success?: boolean };

export async function updateSiteSettingsAction(
  _prev: SiteSettingsState,
  formData: FormData
): Promise<SiteSettingsState> {
  const session = await requireTeacher();
  if (!session) return { error: "권한이 없습니다." };

  const siteTitle = String(formData.get("siteTitle") ?? "").trim();
  const schoolName = String(formData.get("schoolName") ?? "").trim() || null;
  const className = String(formData.get("className") ?? "").trim() || null;
  const teacherName = String(formData.get("teacherName") ?? "").trim() || null;
  const homeLinkUrl = String(formData.get("homeLinkUrl") ?? "").trim() || null;
  const homeLinkLabel = String(formData.get("homeLinkLabel") ?? "").trim() || null;
  const removeImage = formData.get("removeHomeLinkImage") === "on";
  const image = formData.get("homeLinkImage") as File | null;

  if (!siteTitle) return { error: "사이트 이름을 입력해 주세요." };
  if (homeLinkUrl && !/^https?:\/\//.test(homeLinkUrl)) {
    return { error: "바로가기 링크는 http:// 또는 https:// 로 시작해야 해요." };
  }

  const existing = await prisma.siteSetting.findUnique({ where: { id: "site" } });
  let homeLinkImageUrl = existing?.homeLinkImageUrl ?? null;
  if (image && image.size > 0) {
    const result = await uploadImageAction(image);
    if (result.error) return { error: result.error };
    homeLinkImageUrl = result.url ?? null;
  } else if (removeImage) {
    homeLinkImageUrl = null;
  }

  const data = { siteTitle, schoolName, className, teacherName, homeLinkUrl, homeLinkLabel, homeLinkImageUrl };
  await prisma.siteSetting.upsert({
    where: { id: "site" },
    create: { id: "site", ...data },
    update: data,
  });

  revalidatePath("/", "layout");
  return { success: true };
}
