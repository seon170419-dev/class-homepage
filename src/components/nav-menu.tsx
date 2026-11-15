"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutStudentAction, logoutTeacherAction } from "@/lib/actions/auth";

const MENU_LINKS = [
  { href: "/", label: "오늘 할 일" },
  { href: "/calendar", label: "학급 캘린더" },
  { href: "/compliments", label: "익명 칭찬함" },
  { href: "/birthday", label: "생일 축하" },
  { href: "/resources", label: "자료실" },
  { href: "/suggestions", label: "건의함" },
  { href: "/counseling", label: "상담 신청" },
  { href: "/lost-and-found", label: "분실물 게시판" },
  { href: "/archive", label: "학급 아카이브" },
];

export function NavMenu({
  role,
  studentName,
}: {
  role: "teacher" | "student" | null;
  studentName: string | null;
}) {
  return (
    <div className="flex items-center gap-2">
      {role === "student" && (
        <Link href="/me">
          <Button variant="ghost" size="sm">
            {studentName ? `${studentName} 학생` : "내 페이지"}
          </Button>
        </Link>
      )}
      {role === "teacher" && (
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            관리자 대시보드
          </Button>
        </Link>
      )}
      {role === null && (
        <Link href="/me/login">
          <Button variant="ghost" size="sm">
            내 페이지
          </Button>
        </Link>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="outline" size="icon" aria-label="메뉴 열기" />}
        >
          <Menu className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>빠른 메뉴</DropdownMenuLabel>
            {MENU_LINKS.map((link) => (
              <DropdownMenuItem key={link.href} render={<Link href={link.href} />}>
                {link.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {role === "student" && (
              <DropdownMenuItem render={<Link href="/me/activities" />}>
                나의 활동 기록
              </DropdownMenuItem>
            )}
            {role === "teacher" ? (
              <DropdownMenuItem onClick={() => logoutTeacherAction()}>
                로그아웃
              </DropdownMenuItem>
            ) : role === "student" ? (
              <DropdownMenuItem onClick={() => logoutStudentAction()}>
                로그아웃
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem render={<Link href="/admin/login" />}>
                담임 로그인
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
