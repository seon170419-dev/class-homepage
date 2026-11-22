"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { counselingStatusLabel } from "@/lib/labels";
import { updateCounselingStatusAction } from "@/lib/actions/counseling";
import type { CounselingStatus } from "@/generated/prisma/enums";

export function CounselingStatusSelect({
  id,
  status,
  teacherNote,
}: {
  id: string;
  status: CounselingStatus;
  teacherNote: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState(teacherNote ?? "");

  return (
    <div className="flex flex-col items-end gap-2">
      <Select
        value={status}
        disabled={pending}
        onValueChange={(value) =>
          startTransition(async () => {
            try {
              await updateCounselingStatusAction(id, value as CounselingStatus, note);
            } catch {
              toast.error("처리 중 문제가 발생했어요.");
            }
          })
        }
      >
        <SelectTrigger size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(counselingStatusLabel).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex gap-1">
        <Input
          className="h-8 w-48 text-xs"
          placeholder="확정 시간/메모 (학생에게 노출)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              try {
                await updateCounselingStatusAction(id, status, note);
                toast.success("메모를 저장했어요.");
              } catch {
                toast.error("처리 중 문제가 발생했어요.");
              }
            })
          }
        >
          저장
        </Button>
      </div>
    </div>
  );
}
