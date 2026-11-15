"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  createAnnouncementAction,
  updateAnnouncementAction,
  type ActionState,
} from "@/lib/actions/announcements";
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
import { announcementCategoryLabel } from "@/lib/labels";
import type { AnnouncementCategory } from "@/generated/prisma/enums";

const initialState: ActionState = {};

type EditTarget = {
  id: string;
  title: string;
  body: string;
  category: AnnouncementCategory;
  pinned: boolean;
  attachmentUrl: string | null;
  attachmentName: string | null;
};

export function AnnouncementForm({
  editTarget,
  onDone,
}: {
  editTarget?: EditTarget;
  onDone?: () => void;
}) {
  const action = editTarget
    ? updateAnnouncementAction.bind(null, editTarget.id)
    : createAnnouncementAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success(editTarget ? "공지를 수정했어요." : "공지를 등록했어요.");
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
      <div className="space-y-2">
        <Label htmlFor="body">내용</Label>
        <Textarea id="body" name="body" defaultValue={editTarget?.body} required rows={3} />
      </div>
      <div className="space-y-2">
        <Label>분류</Label>
        <Select name="category" defaultValue={editTarget?.category ?? "CLASS_NOTICE"}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="분류 선택" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(announcementCategoryLabel).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="attachment">
          {editTarget?.attachmentUrl ? "첨부파일 교체 (선택, 4MB 이하)" : "첨부파일 (선택, 4MB 이하)"}
        </Label>
        <Input
          id="attachment"
          name="attachment"
          type="file"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.hwp,.zip"
        />
        {editTarget?.attachmentUrl && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>현재: 📎 {editTarget.attachmentName ?? "첨부파일"}</span>
            <label className="flex items-center gap-1">
              <Checkbox name="removeAttachment" />
              삭제
            </label>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="pinned" name="pinned" defaultChecked={editTarget?.pinned} />
        <Label htmlFor="pinned">상단 고정</Label>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "저장 중..." : editTarget ? "수정 완료" : "공지 등록"}
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
