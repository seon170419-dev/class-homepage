import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBadge } from "@/components/category-badge";
import { ComplimentForm } from "@/components/compliment-form";
import { LoginRequired } from "@/components/login-required";
import { complimentValueTagLabel } from "@/lib/labels";

export const dynamic = "force-dynamic";

const TAG_COLOR = "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300";

export default async function ComplimentsPage() {
  const session = await getSession();
  const isStudent = session?.role === "student";

  const [compliments, students] = await Promise.all([
    prisma.compliment.findMany({
      where: { status: "APPROVED", visibility: "CLASS_PUBLIC" },
      orderBy: { createdAt: "desc" },
      include: { target: { select: { name: true } } },
      take: 30,
    }),
    isStudent
      ? prisma.student.findMany({
          where: { id: { not: session.studentId } },
          orderBy: { number: "asc" },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">익명 칭찬함</h1>
        <p className="text-sm text-muted-foreground">
          친구의 좋은 행동을 발견하면 칭찬을 남겨 주세요. 담임 선생님 승인 후 공개돼요.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>칭찬 남기기</CardTitle>
        </CardHeader>
        <CardContent>
          {isStudent ? (
            <ComplimentForm students={students} />
          ) : (
            <LoginRequired message="칭찬을 남기려면 학생 로그인이 필요해요." />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>우리 반의 좋은 순간</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {compliments.length === 0 && (
            <p className="text-sm text-muted-foreground">아직 공개된 칭찬이 없어요.</p>
          )}
          {compliments.map((c) => (
            <div key={c.id} className="space-y-1 border-b pb-3 last:border-none last:pb-0">
              <div className="flex items-center justify-between">
                <CategoryBadge label={complimentValueTagLabel[c.valueTag]} colorClass={TAG_COLOR} />
                <span className="text-xs text-muted-foreground">{c.occurredAt}</span>
              </div>
              <p className="text-sm">
                <strong>{c.target.name}</strong> 학생: {c.whatDidText}
              </p>
              <p className="text-xs text-muted-foreground">본받고 싶은 점: {c.whatToLearnText}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
