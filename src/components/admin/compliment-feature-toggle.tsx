"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setComplimentFeaturedAction } from "@/lib/actions/compliments";

export function ComplimentFeatureToggle({
  id,
  featured,
}: {
  id: string;
  featured: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant={featured ? "default" : "outline"}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          try {
            await setComplimentFeaturedAction(id, !featured);
            toast.success(featured ? "대시보드에서 내렸어요." : "대시보드에 게시했어요.");
          } catch {
            toast.error("처리 중 문제가 발생했어요.");
          }
        })
      }
    >
      {featured ? "대시보드에서 내리기" : "대시보드에 게시"}
    </Button>
  );
}
