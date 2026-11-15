"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  createScheduleAction,
  updateScheduleAction,
  type ActionState,
} from "@/lib/actions/schedules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { scheduleCategoryLabel } from "@/lib/labels";
import type { ScheduleCategory } from "@/generated/prisma/enums";

const initialState: ActionState = {};

function toDateInput(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function toTimeInput(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

type EditTarget = {
  id: string;
  title: string;
  category: ScheduleCategory;
  subject: string | null;
  startAt: Date;
  dueAt: Date;
  description: string | null;
  submissionMethod: string | null;
  submissionLink: string | null;
  materials: string | null;
  submissionRequired: boolean;
};

export function ScheduleForm({
  editTarget,
  onDone,
}: {
  editTarget?: EditTarget;
  onDone?: () => void;
}) {
  const action = editTarget
    ? updateScheduleAction.bind(null, editTarget.id)
    : createScheduleAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success(editTarget ? "일정을 수정했어요." : "일정을 등록했어요.");
      if (editTarget) {
        onDone?.();
      } else {
        formRef.current?.reset();
      }
    } else if (state.error) {
      toast.error(state.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input id="title" name="title" defaultValue={editTarget?.title} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>분류</Label>
          <Select name="category" defaultValue={editTarget?.category ?? "CLASS_EVENT"}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="분류 선택" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(scheduleCategoryLabel).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">과목 (선택)</Label>
          <Input id="subject" name="subject" defaultValue={editTarget?.subject ?? ""} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="startDate">시작일</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={editTarget ? toDateInput(editTarget.startAt) : undefined}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">마감일</Label>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={editTarget ? toDateInput(editTarget.dueAt) : undefined}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="dueTime">마감 시각</Label>
        <Input
          id="dueTime"
          name="dueTime"
          type="time"
          defaultValue={editTarget ? toTimeInput(editTarget.dueAt) : "23:59"}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">상세 설명</Label>
        <Textarea id="description" name="description" defaultValue={editTarget?.description ?? ""} rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="submissionMethod">제출 방법</Label>
          <Input
            id="submissionMethod"
            name="submissionMethod"
            defaultValue={editTarget?.submissionMethod ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="submissionLink">제출 링크</Label>
          <Input
            id="submissionLink"
            name="submissionLink"
            type="url"
            defaultValue={editTarget?.submissionLink ?? ""}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="materials">준비물</Label>
        <Input id="materials" name="materials" defaultValue={editTarget?.materials ?? ""} />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="submissionRequired"
          name="submissionRequired"
          defaultChecked={editTarget?.submissionRequired}
        />
        <Label htmlFor="submissionRequired">제출 확인 필요</Label>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "저장 중..." : editTarget ? "수정 완료" : "일정 등록"}
        </Button>
        {editTarget && (
          <Button type="button" variant="ghost" onClick={onDone} disabled={pending}>
            취소
          </Button>
        )}
      </div>
    </form>
  );
}
