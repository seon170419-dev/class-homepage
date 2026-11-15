"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  updateClassGoalProgressAction,
  deleteClassGoalAction,
} from "@/lib/actions/class-goals";

export function ClassGoalProgress({
  id,
  currentValue,
  targetValue,
}: {
  id: string;
  currentValue: number;
  targetValue: number;
}) {
  const [value, setValue] = useState(currentValue);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        className="w-20"
        value={value}
        max={targetValue}
        min={0}
        onChange={(e) => setValue(Number(e.target.value))}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            try {
              await updateClassGoalProgressAction(id, value);
              toast.success("진행도를 업데이트했어요.");
            } catch {
              toast.error("처리 중 문제가 발생했어요.");
            }
          })
        }
      >
        저장
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() => {
          if (!window.confirm("이 목표를 삭제할까요?")) return;
          startTransition(async () => {
            try {
              await deleteClassGoalAction(id);
            } catch {
              toast.error("삭제 중 문제가 발생했어요.");
            }
          });
        }}
      >
        삭제
      </Button>
    </div>
  );
}
