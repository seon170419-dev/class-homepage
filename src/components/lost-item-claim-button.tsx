"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markLostItemClaimedAction } from "@/lib/actions/lost-items";

export function LostItemClaimButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          try {
            await markLostItemClaimedAction(id);
            toast.success("찾아감으로 표시했어요.");
          } catch {
            toast.error("로그인이 필요해요.");
          }
        })
      }
    >
      찾아감으로 표시
    </Button>
  );
}
