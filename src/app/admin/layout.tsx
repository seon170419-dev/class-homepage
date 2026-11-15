import Link from "next/link";
import { getSession } from "@/lib/session";

const ADMIN_TABS = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/announcements", label: "공지" },
  { href: "/admin/schedules", label: "일정" },
  { href: "/admin/students", label: "학생" },
  { href: "/admin/compliments", label: "칭찬함" },
  { href: "/admin/birthday-messages", label: "생일메시지" },
  { href: "/admin/activities", label: "활동기록" },
  { href: "/admin/counseling", label: "상담" },
  { href: "/admin/suggestions", label: "건의함" },
  { href: "/admin/lost-and-found", label: "분실물" },
  { href: "/admin/resources", label: "자료실" },
  { href: "/admin/class-roles", label: "당번" },
  { href: "/admin/class-goals", label: "목표" },
  { href: "/admin/archive", label: "아카이브" },
  { href: "/admin/settings", label: "설정" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (session?.role !== "teacher") {
    return <>{children}</>;
  }

  return (
    <div className="space-y-6">
      <nav className="-mx-4 flex gap-1 overflow-x-auto border-b px-4 pb-2 text-sm">
        {ADMIN_TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="shrink-0 rounded-md px-2.5 py-1.5 hover:bg-accent"
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
