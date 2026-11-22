import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBadge } from "@/components/category-badge";
import { SuggestionForm } from "@/components/suggestion-form";
import { LoginRequired } from "@/components/login-required";
import { MySuggestionRow } from "@/components/my-suggestion-row";
import { suggestionCategoryLabel } from "@/lib/labels";
import { formatDateTime } from "@/lib/dates";

export const dynamic = "force-dynamic";

const CATEGORY_COLOR = "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300";

export default async function SuggestionsPage() {
  const session = await getSession();
  const isStudent = session?.role === "student";

  const publicSuggestions = await prisma.suggestion.findMany({
    where: { visibility: "CLASS_MEETING_PUBLIC", status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  const mySuggestions =
    session?.role === "student"
      ? await prisma.suggestion.findMany({
          where: { authorId: session.studentId },
          orderBy: { createdAt: "desc" },
        })
      : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">건의함</h1>
        <p className="text-sm text-muted-foreground">
          자리 배치, 청소, 학급 행사 등 학급 운영에 대한 의견을 남겨 주세요.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>건의하기</CardTitle>
        </CardHeader>
        <CardContent>
          {isStudent ? (
            <SuggestionForm />
          ) : (
            <LoginRequired message="건의하려면 학생 로그인이 필요해요." />
          )}
        </CardContent>
      </Card>

      {isStudent && (
        <Card>
          <CardHeader>
            <CardTitle>내가 쓴 건의사항</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mySuggestions.length === 0 && (
              <p className="text-sm text-muted-foreground">아직 작성한 건의사항이 없어요.</p>
            )}
            {mySuggestions.map((s) => (
              <MySuggestionRow
                key={s.id}
                id={s.id}
                category={s.category}
                content={s.content}
                visibility={s.visibility}
                status={s.status}
                createdAt={s.createdAt}
              />
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>학급회의 안건</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {publicSuggestions.length === 0 && (
            <p className="text-sm text-muted-foreground">공개된 건의사항이 없어요.</p>
          )}
          {publicSuggestions.map((s) => (
            <div key={s.id} className="space-y-1 border-b pb-3 last:border-none last:pb-0">
              <CategoryBadge
                label={suggestionCategoryLabel[s.category]}
                colorClass={CATEGORY_COLOR}
              />
              <p className="text-sm">{s.content}</p>
              <p className="text-xs text-muted-foreground">
                {s.author.name} · {formatDateTime(s.createdAt)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
