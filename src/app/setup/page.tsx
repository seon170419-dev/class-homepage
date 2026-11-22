import { redirect } from "next/navigation";
import { isDatabaseConfigured, isSetupComplete } from "@/lib/site";
import { requireTeacher } from "@/lib/session";
import { SetupWizard } from "@/components/setup-wizard";
import { DbNotConfigured } from "@/components/db-not-configured";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  if (!isDatabaseConfigured()) return <DbNotConfigured />;

  const alreadyDone = await isSetupComplete();
  // 설치 직후(로그인 쿠키가 생겨 페이지가 다시 그려질 때)에도 비밀번호 표가 사라지지 않도록,
  // 담임으로 로그인한 상태면 이 페이지를 유지한다.
  if (alreadyDone && !(await requireTeacher())) redirect("/admin/login");

  return (
    <SetupWizard requiresCode={Boolean(process.env.SETUP_CODE?.trim())} alreadyDone={alreadyDone} />
  );
}
