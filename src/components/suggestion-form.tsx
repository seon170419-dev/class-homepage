"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { createSuggestionAction, type ActionState } from "@/lib/actions/suggestions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { suggestionCategoryLabel, suggestionVisibilityLabel } from "@/lib/labels";

const initialState: ActionState = {};

export function SuggestionForm() {
  const [state, formAction, pending] = useActionState(createSuggestionAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("건의사항을 전달했어요.");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="space-y-2">
        <Label>분류</Label>
        <Select name="category" defaultValue="ETC">
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(suggestionCategoryLabel).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">건의 내용</Label>
        <Textarea id="content" name="content" rows={3} required />
      </div>
      <div className="space-y-2">
        <Label>공개 범위</Label>
        <Select name="visibility" defaultValue="TEACHER_ONLY">
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(suggestionVisibilityLabel).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "제출 중..." : "건의하기"}
      </Button>
    </form>
  );
}
