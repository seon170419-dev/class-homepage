import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/session";
import { startOfDay, addDays } from "@/lib/dates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BirthdaySettingsForm } from "@/components/birthday-settings-form";
import { StudentChangePasswordForm } from "@/components/student-change-password-form";
import { submissionStatusLabel } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function MyPage() {
  const session = await requireStudent();
  if (!session) return null;

  const student = await prisma.student.findUniqueOrThrow({
    where: { id: session.studentId },
  });

  const weekStart = startOfDay(new Date());
  const weekEnd = addDays(weekStart, 7);

  const [roles, submissionRequiredItems, mySubmissions, activityCount] = await Promise.all([
    prisma.classRole.findMany({
      where: { studentId: session.studentId, date: { gte: weekStart, lt: weekEnd } },
      orderBy: { date: "asc" },
    }),
    prisma.scheduleItem.findMany({
      where: { submissionRequired: true, dueAt: { gte: startOfDay(addDays(new Date(), -14)) } },
      orderBy: { dueAt: "desc" },
    }),
    prisma.submission.findMany({ where: { studentId: session.studentId } }),
    prisma.activityRecord.count({ where: { studentId: session.studentId } }),
  ]);

  const submissionMap = new Map(mySubmissions.map((s) => [s.scheduleItemId, s.status]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">{student.name} 학생의 내 페이지</h1>
        <p className="text-sm text-muted-foreground">아이디: {student.loginId}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>이번 주 나의 역할</CardTitle>
        </CardHeader>
        <CardContent>
          {roles.length === 0 ? (
            <p className="text-sm text-muted-foreground">이번 주 지정된 역할이 없어요.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {roles.map((r) => (
                <li key={r.id}>
                  {r.date.getMonth() + 1}/{r.date.getDate()}: {r.role}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>제출 현황</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {submissionRequiredItems.length === 0 && (
            <p className="text-sm text-muted-foreground">제출이 필요한 항목이 없어요.</p>
          )}
          {submissionRequiredItems.map((item) => {
            const status = submissionMap.get(item.id) ?? "NOT_SUBMITTED";
            return (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span>{item.title}</span>
                <span
                  className={
                    status === "SUBMITTED"
                      ? "text-emerald-600"
                      : "text-muted-foreground"
                  }
                >
                  {submissionStatusLabel[status]}
                </span>
              </div>
            );
          })}
          <Link href="/calendar" className="inline-block pt-2 text-sm text-primary underline">
            캘린더에서 제출 상태 변경하기 →
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>나의 성장 기록</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            지금까지 {activityCount}개의 활동을 기록했어요.
          </p>
          <Link href="/me/activities">
            <Button size="sm">활동 기록 보기</Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>생일 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <BirthdaySettingsForm
            birthdayPublic={student.birthdayPublic}
            popupOptIn={student.popupOptIn}
            commentOptIn={student.commentOptIn}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>비밀번호 변경</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
