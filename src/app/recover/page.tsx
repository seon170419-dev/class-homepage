"use client";

import { useActionState } from "react";
import Link from "next/link";
import { recoverAdminAction, type RecoverState } from "@/lib/actions/recover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const initialState: RecoverState = {};

export default function RecoverPage() {
  const [state, formAction, pending] = useActionState(recoverAdminAction, initialState);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>관리자 비밀번호 찾기</CardTitle>
          <CardDescription>
            사이트를 설치할 때 정한 설치 코드(SETUP_CODE)로 새 비밀번호를 정할 수 있어요. 설치 코드는 Vercel →
            프로젝트 → Settings → Environment Variables 에서 확인할 수 있어요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state.username ? (
            <div className="space-y-3 text-sm">
              <p>
                비밀번호를 바꿨어요. 관리자 아이디는 <strong>{state.username}</strong> 이에요.
              </p>
              <Link href="/admin/login">
                <Button className="w-full">로그인하러 가기</Button>
              </Link>
            </div>
          ) : (
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="setupCode">설치 코드</Label>
                <Input id="setupCode" name="setupCode" autoComplete="off" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">새 비밀번호 (8자 이상)</Label>
                <Input id="newPassword" name="newPassword" type="password" minLength={8} required autoComplete="new-password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" minLength={8} required autoComplete="new-password" />
              </div>
              {state.error && <p className="text-sm text-destructive">{state.error}</p>}
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "확인 중..." : "새 비밀번호로 바꾸기"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
