"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { updateBirthdaySettingsAction } from "@/lib/actions/students";

export function BirthdaySettingsForm({
  birthdayPublic,
  popupOptIn,
  commentOptIn,
}: {
  birthdayPublic: boolean;
  popupOptIn: boolean;
  commentOptIn: boolean;
}) {
  const [values, setValues] = useState({ birthdayPublic, popupOptIn, commentOptIn });
  const [pending, startTransition] = useTransition();

  function update(key: keyof typeof values, checked: boolean) {
    const next = { ...values, [key]: checked };
    setValues(next);
    startTransition(async () => {
      try {
        const formData = new FormData();
        if (next.birthdayPublic) formData.set("birthdayPublic", "on");
        if (next.popupOptIn) formData.set("popupOptIn", "on");
        if (next.commentOptIn) formData.set("commentOptIn", "on");
        await updateBirthdaySettingsAction(formData);
        toast.success("설정을 저장했어요.");
      } catch {
        toast.error("저장 중 문제가 발생했어요.");
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Checkbox
          id="birthdayPublic"
          checked={values.birthdayPublic}
          disabled={pending}
          onCheckedChange={(checked) => update("birthdayPublic", checked === true)}
        />
        <Label htmlFor="birthdayPublic">생일 공개 동의 (홈 화면·캘린더에 표시)</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="popupOptIn"
          checked={values.popupOptIn}
          disabled={pending}
          onCheckedChange={(checked) => update("popupOptIn", checked === true)}
        />
        <Label htmlFor="popupOptIn">생일 당일 팝업 공개 동의</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="commentOptIn"
          checked={values.commentOptIn}
          disabled={pending}
          onCheckedChange={(checked) => update("commentOptIn", checked === true)}
        />
        <Label htmlFor="commentOptIn">축하 코멘트 기능 사용 동의</Label>
      </div>
    </div>
  );
}
