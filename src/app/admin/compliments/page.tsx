import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryBadge } from "@/components/category-badge";
import { complimentValueTagLabel, complimentVisibilityLabel } from "@/lib/labels";
import { ComplimentModerationRow } from "@/components/admin/compliment-moderation-row";
import { ComplimentFeatureToggle } from "@/components/admin/compliment-feature-toggle";

export const dynamic = "force-dynamic";

const TAG_COLOR = "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300";

export default async function AdminComplimentsPage() {
  const compliments = await prisma.compliment.findMany({
    orderBy: { createdAt: "desc" },
    include: { target: { select: { name: true } }, author: { select: { name: true } } },
  });

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">칭찬함 승인</h1>
      {compliments.map((c) => (
        <Card key={c.id}>
          <CardContent className="space-y-2 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CategoryBadge label={complimentValueTagLabel[c.valueTag]} colorClass={TAG_COLOR} />
                <span className="text-xs text-muted-foreground">
                  {complimentVisibilityLabel[c.visibility]}
                </span>
                {c.flaggedByAi && (
                  <span className="text-xs text-amber-600">⚠️ AI 주의: {c.aiFlagReason}</span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {c.status === "PENDING" ? "대기" : c.status === "APPROVED" ? "승인됨" : "거절됨"}
              </span>
            </div>
            <p className="text-sm">
              <strong>{c.author.name}</strong> → <strong>{c.target.name}</strong>: {c.occurredAt}
            </p>
            <p className="text-sm">{c.whatDidText}</p>
            <p className="text-xs text-muted-foreground">본받고 싶은 점: {c.whatToLearnText}</p>
            {c.status === "PENDING" && <ComplimentModerationRow id={c.id} />}
            {c.status === "APPROVED" && c.visibility === "CLASS_PUBLIC" && (
              <ComplimentFeatureToggle id={c.id} featured={c.featuredOnHome} />
            )}
          </CardContent>
        </Card>
      ))}
      {compliments.length === 0 && (
        <p className="text-sm text-muted-foreground">등록된 칭찬이 없어요.</p>
      )}
    </div>
  );
}
