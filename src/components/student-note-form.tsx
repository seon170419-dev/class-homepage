"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addStudentNoteAction } from "@/lib/actions/activities";

export function StudentNoteForm({
  activityId,
  initialNote,
}: {
  activityId: string;
  initialNote: string;
}) {
  const [note, setNote] = useState(initialNote);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        placeholder='예: "활동 날짜가 6월 3일이 아니라 6월 4일입니다." 처럼 누락되거나 잘못된 내용을 알려 주세요.'
      />
      <Button
        type="button"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            try {
              await addStudentNoteAction(activityId, note);
              toast.success("사실 확인 요청을 전달했어요.");
            } catch {
              toast.error("처리 중 문제가 발생했어요.");
            }
          })
        }
      >
        {pending ? "저장 중..." : "사실 확인 요청 보내기"}
      </Button>
    </div>
  );
}
