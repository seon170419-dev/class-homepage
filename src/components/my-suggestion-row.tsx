"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/category-badge";
import { deleteSuggestionAction } from "@/lib/actions/suggestions";
import { suggestionCategoryLabel, suggestionVisibilityLabel } from "@/lib/labels";
import { formatDateTime } from "@/lib/dates";
import type { SuggestionCategory, SuggestionVisibility, ApprovalStatus } from "@/generated/prisma/enums";

const CATEGORY_COLOR = "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300";

const statusLabel: Record<ApprovalStatus, string> = {
  PENDING: "대기 중",
  APPROVED: "승인됨",
  REJECTED: "거절됨",
};

export function MySuggestionRow({
  id,
  category,
  content,
  visibility,
  status,
  createdAt,
}: {
  id: string;
  category: SuggestionCategory;
  content: string;
  visibility: SuggestionVisibility;
  status: ApprovalStatus;
  createdAt: Date;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-1 border-b pb-3 last:border-none last:pb-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CategoryBadge label={suggestionCategoryLabel[category]} colorClass={CATEGORY_COLOR} />
          <span className="text-xs text-muted-foreground">{statusLabel[status]}</span>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => {
            if (!window.confirm("이 건의사항을 삭제할까요?")) return;
            startTransition(async () => {
              try {
                await deleteSuggestionAction(id);
                toast.success("삭제했어요.");
              } catch {
                toast.error("삭제 중 문제가 발생했어요.");
              }
            });
          }}
        >
          삭제
        </Button>
      </div>
      <p className="text-sm">{content}</p>
      <p className="text-xs text-muted-foreground">
        {suggestionVisibilityLabel[visibility]} · {formatDateTime(createdAt)}
      </p>
    </div>
  );
}
