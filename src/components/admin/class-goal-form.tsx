"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { createClassGoalAction, type ActionState } from "@/lib/actions/class-goals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionState = {};

export function ClassGoalForm() {
  const [state, formAction, pending] = useActionState(createClassGoalAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  useEffect(() => {
    if (state.success) {
      toast.success("목표를 등록했어요.");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="title">목표</Label>
        <Input id="title" name="title" placeholder="예: 지각 없는 날 만들기" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="targetValue">목표 값</Label>
          <Input id="targetValue" name="targetValue" type="number" min={1} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="month">월</Label>
          <Input id="month" name="month" type="month" defaultValue={defaultMonth} required />
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "등록 중..." : "목표 등록"}
      </Button>
    </form>
  );
}
