"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  createStudentAction,
  type CreateStudentState,
} from "@/lib/actions/students";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const initialState: CreateStudentState = {};

export function StudentForm() {
  const [state, formAction, pending] = useActionState(createStudentAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("학생 계정을 생성했어요.");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="space-y-3">
      <form ref={formRef} action={formAction} className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="number">번호</Label>
            <Input id="number" name="number" type="number" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="birthDate">생일 (MM-DD)</Label>
          <Input id="birthDate" name="birthDate" placeholder="07-12" required />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "생성 중..." : "학생 계정 발급"}
        </Button>
      </form>

      {state.credentials && (
        <Alert>
          <AlertTitle>
            {state.credentials.name} 학생 계정이 생성되었어요. (이 정보는 다시 볼 수 없으니 지금
            전달해 주세요)
          </AlertTitle>
          <AlertDescription>
            아이디: <strong>{state.credentials.loginId}</strong> · 비밀번호:{" "}
            <strong>{state.credentials.password}</strong>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
