import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CounselingForm } from "@/components/counseling-form";
import { LoginRequired } from "@/components/login-required";
import { counselingCategoryLabel, counselingStatusLabel } from "@/lib/labels";
import { formatDateTime } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function CounselingPage() {
  const session = await getSession();
  const isStudent = session?.role === "student";

  const myRequests = isStudent
    ? await prisma.counselingRequest.findMany({
        where: { studentId: session.studentId },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">상담 신청</h1>
        <p className="text-sm text-muted-foreground">
          편하게 이야기 나누고 싶은 주제를 선택해서 신청해 주세요.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>신청하기</CardTitle>
        </CardHeader>
        <CardContent>
          {isStudent ? (
            <CounselingForm />
          ) : (
            <LoginRequired message="상담을 신청하려면 학생 로그인이 필요해요." />
          )}
        </CardContent>
      </Card>

      {isStudent && (
        <Card>
          <CardHeader>
            <CardTitle>상담 신청 로그 (현황)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {myRequests.length === 0 && (
              <p className="text-sm text-muted-foreground">신청한 상담이 없어요.</p>
            )}
            {myRequests.map((r) => (
              <div key={r.id} className="space-y-1 border-b pb-3 last:border-none last:pb-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {r.urgent && "🚨 "}
                    {counselingCategoryLabel[r.category]}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {counselingStatusLabel[r.status]}
                  </span>
                </div>
                {r.preferredTime && (
                  <p className="text-xs text-muted-foreground">
                    희망 시간: {r.preferredTime}
                  </p>
                )}
                {r.teacherNote && (
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    담임 메모: {r.teacherNote}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  신청: {formatDateTime(r.createdAt)}
                  {r.updatedAt.getTime() !== r.createdAt.getTime() &&
                    ` · 갱신: ${formatDateTime(r.updatedAt)}`}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
