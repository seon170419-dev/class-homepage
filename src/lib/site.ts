import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const DEFAULT_SITE_TITLE = "우리 반 홈페이지";

export type SiteSettings = {
  siteTitle: string;
  schoolName: string | null;
  className: string | null;
  teacherName: string | null;
  homeLinkUrl: string | null;
  homeLinkLabel: string | null;
  homeLinkImageUrl: string | null;
};

const DEFAULTS: SiteSettings = {
  siteTitle: DEFAULT_SITE_TITLE,
  schoolName: null,
  className: null,
  teacherName: null,
  homeLinkUrl: null,
  homeLinkLabel: null,
  homeLinkImageUrl: null,
};

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  if (!isDatabaseConfigured()) return DEFAULTS;
  const row = await prisma.siteSetting.findUnique({ where: { id: "site" } });
  if (!row) return DEFAULTS;
  return {
    siteTitle: row.siteTitle,
    schoolName: row.schoolName,
    className: row.className,
    teacherName: row.teacherName,
    homeLinkUrl: row.homeLinkUrl,
    homeLinkLabel: row.homeLinkLabel,
    homeLinkImageUrl: row.homeLinkImageUrl,
  };
});

// 담임 계정이 하나라도 있으면 설치가 끝난 것으로 본다 (기존 사이트 호환).
export async function isSetupComplete(): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;
  return (await prisma.teacher.count()) > 0;
}
