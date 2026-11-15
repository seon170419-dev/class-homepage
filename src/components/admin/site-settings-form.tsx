"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateSiteSettingsAction, type SiteSettingsState } from "@/lib/actions/site-settings";
import type { SiteSettings } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const initialState: SiteSettingsState = {};

export function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(updateSiteSettingsAction, initialState);

  useEffect(() => {
    if (state.success) toast.success("사이트 정보를 저장했어요.");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="siteTitle">사이트 이름</Label>
        <Input id="siteTitle" name="siteTitle" defaultValue={settings.siteTitle} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="schoolName">학교 이름</Label>
          <Input id="schoolName" name="schoolName" defaultValue={settings.schoolName ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="className">학년·반</Label>
          <Input id="className" name="className" defaultValue={settings.className ?? ""} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="teacherName">담임 선생님 이름</Label>
        <Input id="teacherName" name="teacherName" defaultValue={settings.teacherName ?? ""} />
      </div>

      <div className="space-y-3 rounded-md border p-3">
        <p className="text-sm font-medium">홈 화면 바로가기 (선택)</p>
        <p className="text-xs text-muted-foreground">
          홈 화면 날짜 오른쪽에 아이콘을 띄우고, 누르면 아래 링크(구글 폼 등)로 이동해요. 링크를 비우면 숨겨져요.
        </p>
        <div className="space-y-2">
          <Label htmlFor="homeLinkUrl">링크 주소</Label>
          <Input
            id="homeLinkUrl"
            name="homeLinkUrl"
            type="url"
            placeholder="https://forms.gle/..."
            defaultValue={settings.homeLinkUrl ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="homeLinkLabel">이름</Label>
          <Input
            id="homeLinkLabel"
            name="homeLinkLabel"
            placeholder="예: 1일 1생각"
            defaultValue={settings.homeLinkLabel ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="homeLinkImage">아이콘 이미지 (선택, 없으면 이름이 버튼으로 표시)</Label>
          <Input id="homeLinkImage" name="homeLinkImage" type="file" accept="image/*" />
          {settings.homeLinkImageUrl && (
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <Checkbox name="removeHomeLinkImage" />
              현재 아이콘 삭제
            </label>
          )}
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "저장 중..." : "저장"}
      </Button>
    </form>
  );
}
