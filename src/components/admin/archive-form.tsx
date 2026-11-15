"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { createArchiveEntryAction, type ActionState } from "@/lib/actions/archive";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: ActionState = {};

export function ArchiveForm() {
  const [state, formAction, pending] = useActionState(createArchiveEntryAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  useEffect(() => {
    if (state.success) {
      toast.success("아카이브를 등록했어요.");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="title">제목</Label>
          <Input id="title" name="title" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="month">월</Label>
          <Input id="month" name="month" type="month" defaultValue={defaultMonth} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">설명</Label>
        <Textarea id="description" name="description" rows={2} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="photos">사진 (여러 장 선택 가능)</Label>
        <Input id="photos" name="photos" type="file" accept="image/*" multiple />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "등록 중..." : "아카이브 등록"}
      </Button>
    </form>
  );
}
