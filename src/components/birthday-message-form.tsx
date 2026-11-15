"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  createBirthdayMessageAction,
  type ActionState,
} from "@/lib/actions/birthday";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const initialState: ActionState = {};

export function BirthdayMessageForm({ targetStudentId }: { targetStudentId: string }) {
  const [state, formAction, pending] = useActionState(createBirthdayMessageAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("축하 메시지가 담임 선생님 승인 후 공개돼요!");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex gap-2">
      <input type="hidden" name="targetStudentId" value={targetStudentId} />
      <Textarea
        name="message"
        rows={1}
        placeholder="따뜻한 축하 메시지를 남겨 주세요"
        required
        className="min-h-9"
      />
      <Button type="submit" disabled={pending} size="sm">
        {pending ? "..." : "남기기"}
      </Button>
    </form>
  );
}
