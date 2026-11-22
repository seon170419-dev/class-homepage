"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function BirthdayPopup({
  names,
  dateKey,
}: {
  names: string[];
  dateKey: string;
}) {
  const [open, setOpen] = useState(false);
  const storageKey = `birthday-popup-dismissed-${dateKey}`;

  useEffect(() => {
    if (names.length === 0) return;
    const dismissed = window.localStorage.getItem(storageKey);
    // localStorage is only available post-mount; open must stay false during
    // SSR/hydration to avoid a mismatch, so this sync has to happen in an effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!dismissed) setOpen(true);
  }, [names.length, storageKey]);

  function dismiss() {
    window.localStorage.setItem(storageKey, "1");
    setOpen(false);
  }

  if (names.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : dismiss())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>🎉 오늘은 {names.join(", ")} 학생의 생일입니다!</DialogTitle>
          <DialogDescription>
            다 함께 따뜻한 축하 메시지를 남겨 주세요.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Link href="/birthday" className="w-full" onClick={dismiss}>
            <Button className="w-full">축하 메시지 남기기</Button>
          </Link>
          <Button variant="ghost" className="w-full" onClick={dismiss}>
            오늘은 그만 보기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
