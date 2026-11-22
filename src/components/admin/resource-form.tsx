"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { createResourceAction, type ActionState } from "@/lib/actions/resources";
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
import { resourceCategoryLabel } from "@/lib/labels";

const initialState: ActionState = {};

export function ResourceForm() {
  const [state, formAction, pending] = useActionState(createResourceAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("자료를 등록했어요.");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="space-y-2">
        <Label>분류</Label>
        <Select name="category" defaultValue="ETC">
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(resourceCategoryLabel).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="url">링크</Label>
        <Input id="url" name="url" type="url" required />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "등록 중..." : "자료 등록"}
      </Button>
    </form>
  );
}
