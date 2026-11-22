import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryBadge } from "@/components/category-badge";
import { suggestionCategoryLabel, suggestionVisibilityLabel } from "@/lib/labels";
import { SuggestionModerationRow } from "@/components/admin/suggestion-moderation-row";

export const dynamic = "force-dynamic";

const CATEGORY_COLOR = "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300";

export default async function AdminSuggestionsPage() {
  const suggestions = await prisma.suggestion.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">건의함</h1>
      {suggestions.map((s) => (
        <Card key={s.id}>
          <CardContent className="space-y-2 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CategoryBadge
                  label={suggestionCategoryLabel[s.category]}
                  colorClass={CATEGORY_COLOR}
                />
                <span className="text-xs text-muted-foreground">
                  {suggestionVisibilityLabel[s.visibility]}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {s.status === "PENDING" ? "대기" : s.status === "APPROVED" ? "승인됨" : "거절됨"}
              </span>
            </div>
            <p className="text-sm">{s.content}</p>
            <p className="text-xs text-muted-foreground">작성: {s.author.name}</p>
            {s.status === "PENDING" && <SuggestionModerationRow id={s.id} />}
          </CardContent>
        </Card>
      ))}
      {suggestions.length === 0 && (
        <p className="text-sm text-muted-foreground">등록된 건의사항이 없어요.</p>
      )}
    </div>
  );
}
