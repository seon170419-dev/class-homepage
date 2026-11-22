"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createActivityRecordAction,
  updateActivityRecordAction,
  type ActionState,
} from "@/lib/actions/activities";
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
import { activityAreaLabel } from "@/lib/labels";
import type { ActivityArea } from "@/generated/prisma/enums";

const initialState: ActionState = {};

function toDateInput(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

type EditTarget = {
  id: string;
  date: Date;
  area: ActivityArea;
  title: string;
  role: string | null;
  actions: string | null;
  difficulty: string | null;
  solution: string | null;
  learned: string | null;
  peerOrTeacherConfirmable: boolean;
};

export function ActivityRecordForm({
  editTarget,
  onDone,
}: {
  editTarget?: EditTarget;
  onDone?: () => void;
}) {
  const action = editTarget
    ? updateActivityRecordAction.bind(null, editTarget.id)
    : createActivityRecordAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      if (editTarget) {
        toast.success("활동 기록을 수정했어요.");
        onDone?.();
      } else {
        toast.success("활동 기록을 저장했어요.");
        router.push("/me/activities");
      }
    } else if (state.error) {
      toast.error(state.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, router]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="date">활동 날짜</Label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={editTarget ? toDateInput(editTarget.date) : undefined}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>활동 영역</Label>
          <Select name="area" defaultValue={editTarget?.area ?? "AUTONOMY"}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(activityAreaLabel).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">활동명</Label>
        <Input id="title" name="title" defaultValue={editTarget?.title} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">내가 맡은 역할</Label>
        <Input id="role" name="role" defaultValue={editTarget?.role ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="actions">구체적으로 한 행동</Label>
        <Textarea id="actions" name="actions" defaultValue={editTarget?.actions ?? ""} rows={2} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="difficulty">활동 중 어려웠던 점</Label>
        <Textarea
          id="difficulty"
          name="difficulty"
          defaultValue={editTarget?.difficulty ?? ""}
          rows={2}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="solution">어떻게 해결했는지</Label>
        <Textarea id="solution" name="solution" defaultValue={editTarget?.solution ?? ""} rows={2} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="learned">새롭게 알게 된 점</Label>
        <Textarea id="learned" name="learned" defaultValue={editTarget?.learned ?? ""} rows={2} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="evidence">
          {editTarget ? "증빙자료 교체 (선택)" : "증빙자료 (선택)"}
        </Label>
        <Input id="evidence" name="evidence" type="file" accept="image/*" />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="peerOrTeacherConfirmable"
          name="peerOrTeacherConfirmable"
          defaultChecked={editTarget?.peerOrTeacherConfirmable}
        />
        <Label htmlFor="peerOrTeacherConfirmable">친구나 교사가 확인해줄 수 있어요</Label>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending} className={editTarget ? "" : "w-full"}>
          {pending ? "저장 중..." : editTarget ? "수정 완료" : "활동 기록 저장"}
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
