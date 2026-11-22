import Link from "next/link";
import { Card } from "@/components/ui/card";

const ITEMS = [
  { href: "/calendar", label: "캘린더", icon: "📅" },
  { href: "/resources", label: "자료실", icon: "📁" },
  { href: "/compliments", label: "칭찬함", icon: "💛" },
  { href: "/suggestions", label: "건의함", icon: "✉️" },
  { href: "/counseling", label: "상담 신청", icon: "🙋" },
  { href: "/me/activities", label: "내 활동 기록", icon: "📒" },
  { href: "/lost-and-found", label: "분실물", icon: "🔎" },
  { href: "/archive", label: "아카이브", icon: "🖼️" },
];

export function QuickMenu() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {ITEMS.map((item) => (
        <Link key={item.href} href={item.href}>
          <Card className="flex flex-col items-center justify-center gap-1 py-3 text-center transition-colors hover:bg-accent">
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </Card>
        </Link>
      ))}
    </div>
  );
}
