"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { activityStatusLabel } from "@/lib/labels";
import {
  generateAiDraftAction,
  updateActivityReviewAction,
} from "@/lib/actions/activities";
import type { ActivityStatus } from "@/generated/prisma/enums";

export function ActivityReviewForm({
  id,
  initialDraft,
  initialStatus,
}: {
  id: string;
  initialDraft: string;
  initialStatus: ActivityStatus;
}) {
  const [draft, setDraft] = useState(initialDraft);
  const [status, setStatus] = useState<ActivityStatus>(initialStatus);
  const [pending, startTransition] = useTransition();
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const result = await generateAiDraftAction(id);
      if (result.draft) {
        setDraft(result.draft);
        toast.success("AI 초안을 생성했어요. 확인 후 저장해 주세요.");
      } else {
        toast.error(result.error ?? "AI 초안을 생성할 수 없어요.");
      }
    } finally {
      setGenerating(false);
    }
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await updateActivityReviewAction(id, { teacherDraftText: draft, status });
        toast.success("저장했어요.");
      } catch {
        toast.error("저장 중 문제가 발생했어요.");
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">생기부 초안 문장</p>
        <Button type="button" size="sm" variant="outline" disabled={generating} onClick={handleGenerate}>
          {generating ? "생성 중..." : "✨ AI 초안 생성"}
        </Button>
      </div>
      <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={4} />

      <div className="flex items-center gap-2">
        <Select value={status} onValueChange={(v) => setStatus(v as ActivityStatus)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(activityStatusLabel).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" disabled={pending} onClick={handleSave}>
          {pending ? "저장 중..." : "저장"}
        </Button>
      </div>
    </div>
  );
}
