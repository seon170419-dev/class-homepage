"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { createClassRoleAction, type ActionState } from "@/lib/actions/class-roles";
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

const initialState: ActionState = {};

export function ClassRoleForm({ students }: { students: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createClassRoleAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("역할을 등록했어요.");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="space-y-2">
        <Label>학생</Label>
        <Select name="studentId">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="학생 선택" />
          </SelectTrigger>
          <SelectContent>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="role">역할</Label>
          <Input id="role" name="role" placeholder="예: 칠판 정리" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">날짜</Label>
          <Input id="date" name="date" type="date" required />
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "등록 중..." : "역할 등록"}
      </Button>
    </form>
  );
}
