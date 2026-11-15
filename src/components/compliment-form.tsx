"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  createComplimentAction,
  suggestComplimentTagAction,
  type ActionState,
} from "@/lib/actions/compliments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { complimentValueTagLabel, complimentVisibilityLabel } from "@/lib/labels";

const initialState: ActionState = {};

export function ComplimentForm({
  students,
}: {
  students: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createComplimentAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const whatDidTextRef = useRef<HTMLTextAreaElement>(null);
  const [valueTag, setValueTag] = useState("CARE");
  const [suggesting, setSuggesting] = useState(false);

  useEffect(() => {
    if (state.success) {
      toast.success("칭찬이 담임 선생님 승인 후 공개돼요. 고마워요!");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  async function handleSuggestTag() {
    const whatDidText = whatDidTextRef.current?.value ?? "";
    if (!whatDidText.trim()) {
      toast.error("먼저 어떤 행동을 했는지 적어 주세요.");
      return;
    }
    setSuggesting(true);
    try {
      const tag = await suggestComplimentTagAction(whatDidText);
      if (tag) {
        setValueTag(tag);
        toast.success(`AI가 "${complimentValueTagLabel[tag]}"를 추천했어요.`);
      } else {
        toast.error("AI 추천을 사용할 수 없어요.");
      }
    } finally {
      setSuggesting(false);
    }
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="space-y-2">
        <Label>칭찬하고 싶은 친구</Label>
        <Select name="targetStudentId">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="친구를 선택하세요" />
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
      <div className="space-y-2">
        <Label htmlFor="occurredAt">언제 있었던 일인가요?</Label>
        <Input id="occurredAt" name="occurredAt" placeholder="예: 체육 시간에" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="whatDidText">어떤 행동을 했나요?</Label>
        <Textarea
          id="whatDidText"
          name="whatDidText"
          rows={3}
          required
          ref={whatDidTextRef}
          defaultValue=""
          placeholder="최소 10자 이상 구체적으로 적어 주세요."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="whatToLearnText">그 행동에서 본받고 싶은 점은 무엇인가요?</Label>
        <Textarea id="whatToLearnText" name="whatToLearnText" rows={2} required />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>가치 태그</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={suggesting}
            onClick={handleSuggestTag}
          >
            {suggesting ? "추천 중..." : "✨ AI 추천받기"}
          </Button>
        </div>
        <Select name="valueTag" value={valueTag} onValueChange={(v) => setValueTag(v ?? "CARE")}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(complimentValueTagLabel).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>공개 범위</Label>
        <Select name="visibility" defaultValue="CLASS_PUBLIC">
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(complimentVisibilityLabel).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "제출 중..." : "칭찬 남기기"}
      </Button>
    </form>
  );
}
