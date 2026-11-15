"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  createCounselingRequestAction,
  type ActionState,
} from "@/lib/actions/counseling";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { counselingCategoryLabel } from "@/lib/labels";

const initialState: ActionState = {};

export function CounselingForm() {
  const [state, formAction, pending] = useActionState(
    createCounselingRequestAction,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("상담 신청이 담임 선생님께 전달됐어요.");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="space-y-2">
        <Label>상담 종류</Label>
        <Select name="category" defaultValue="SCHOOL_LIFE">
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(counselingCategoryLabel).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="preferredTime">희망 시간 (선택)</Label>
        <Input id="preferredTime" name="preferredTime" placeholder="예: 점심시간, 방과 후" />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "신청 중..." : "상담 신청하기"}
      </Button>
      <p className="text-xs text-muted-foreground">
        ⚠️ 위기 상황이라면 홈페이지 신청보다 담임 선생님이나 주변 어른에게 바로 도움을
        요청해 주세요.
      </p>
    </form>
  );
}
