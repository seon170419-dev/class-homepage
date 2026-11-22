"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { createLostItemAction, type ActionState } from "@/lib/actions/lost-items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionState = {};

export function LostItemForm() {
  const [state, formAction, pending] = useActionState(createLostItemAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("분실물을 등록했어요.");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="title">물건 이름</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="foundLocation">발견 장소</Label>
        <Input id="foundLocation" name="foundLocation" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="photo">사진 (선택)</Label>
        <Input id="photo" name="photo" type="file" accept="image/*" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "등록 중..." : "분실물 등록"}
      </Button>
    </form>
  );
}
