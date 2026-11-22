"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { runSetupAction, type SetupState } from "@/lib/actions/setup";
import { makeLoginId, parseRoster, uniqueLoginId } from "@/lib/student-ids";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const initialState: SetupState = {};

const ROSTER_EXAMPLE = `1\t김민준\t2010.03.15
2\t이서연\t2010.07.02
3\t박지호\t2010.11.28`;

function downloadCsv(rows: { number: number | null; name: string; loginId: string; password: string }[]) {
  const header = "번호,이름,아이디,임시 비밀번호";
  const body = rows.map((r) => [r.number ?? "", r.name, r.loginId, r.password].join(","));
  const csv = "﻿" + [header, ...body].join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "학생_계정_목록.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function SetupWizard({
  requiresCode,
  alreadyDone,
}: {
  requiresCode: boolean;
  alreadyDone: boolean;
}) {
  const [state, formAction, pending] = useActionState(runSetupAction, initialState);
  const [roster, setRoster] = useState("");

  const preview = useMemo(() => {
    const { rows, errors } = parseRoster(roster);
    const taken = new Set<string>();
    return {
      errors,
      rows: rows.map((r) => ({ ...r, loginId: uniqueLoginId(makeLoginId(r.name, r.birthDate), taken) })),
    };
  }, [roster]);

  if (state.done) {
    const { credentials, adminUsername } = state.done;
    return (
      <div className="space-y-6">
        <div className="print:hidden">
          <h1 className="text-2xl font-bold">🎉 설치가 끝났어요!</h1>
          <p className="mt-1 text-muted-foreground">
            관리자 아이디 <strong>{adminUsername}</strong> 로 이미 로그인되어 있어요.
          </p>
        </div>

        <Card className="border-amber-300 bg-amber-50 print:hidden dark:border-amber-800 dark:bg-amber-950/40">
          <CardContent className="space-y-1 py-4 text-sm">
            <p className="font-semibold">⚠️ 아래 임시 비밀번호는 지금 한 번만 볼 수 있어요.</p>
            <p>
              인쇄하거나 엑셀 파일로 저장해 두세요. 잃어버리면 관리자 화면 → 학생 탭에서
              &quot;비밀번호 재발급&quot;으로 새로 만들 수 있어요.
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2 print:hidden">
          <Button onClick={() => window.print()}>🖨️ 인쇄하기</Button>
          <Button variant="outline" onClick={() => downloadCsv(credentials)}>
            📄 엑셀 파일로 저장
          </Button>
          <Link href="/admin">
            <Button variant="ghost">관리자 화면으로 가기 →</Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-2">번호</th>
                <th className="p-2">이름</th>
                <th className="p-2">아이디</th>
                <th className="p-2">임시 비밀번호</th>
              </tr>
            </thead>
            <tbody>
              {credentials.map((c) => (
                <tr key={c.loginId} className="border-b">
                  <td className="p-2">{c.number ?? ""}</td>
                  <td className="p-2">{c.name}</td>
                  <td className="p-2 font-mono">{c.loginId}</td>
                  <td className="p-2 font-mono">{c.password}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (alreadyDone) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">이미 설치가 끝난 사이트예요</h1>
        <p className="text-muted-foreground">
          반 정보는 관리자 화면의 설정 탭에서, 학생은 학생 탭에서 바꿀 수 있어요.
        </p>
        <Link href="/admin">
          <Button>관리자 화면으로 가기 →</Button>
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">학급 홈페이지 설치</h1>
        <p className="mt-1 text-muted-foreground">
          처음 한 번만 입력하면 돼요. 나중에 관리자 화면에서 언제든 바꿀 수 있어요.
        </p>
      </div>

      {requiresCode && (
        <Card>
          <CardHeader>
            <CardTitle>0. 설치 코드</CardTitle>
            <CardDescription>사이트를 배포할 때 직접 정한 SETUP_CODE를 입력하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <Input name="setupCode" required autoComplete="off" />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>1. 우리 반 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="siteTitle">사이트 이름</Label>
            <Input id="siteTitle" name="siteTitle" defaultValue="우리 반 홈페이지" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="schoolName">학교 이름</Label>
              <Input id="schoolName" name="schoolName" placeholder="예: 행복고등학교" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="className">학년·반</Label>
              <Input id="className" name="className" placeholder="예: 1학년 10반" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="teacherName">담임 선생님 이름</Label>
            <Input id="teacherName" name="teacherName" placeholder="예: 김선생" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. 관리자(담임) 로그인 정보</CardTitle>
          <CardDescription>공지·일정·학생 관리를 할 때 쓰는 계정이에요.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="adminUsername">관리자 아이디 (영문·숫자)</Label>
            <Input id="adminUsername" name="adminUsername" defaultValue="teacher" required autoComplete="username" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="adminPassword">비밀번호 (8자 이상)</Label>
              <Input
                id="adminPassword"
                name="adminPassword"
                type="password"
                minLength={8}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminPasswordConfirm">비밀번호 확인</Label>
              <Input
                id="adminPasswordConfirm"
                name="adminPasswordConfirm"
                type="password"
                minLength={8}
                required
                autoComplete="new-password"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. 학생 명단</CardTitle>
          <CardDescription>
            엑셀에서 <strong>번호 · 이름 · 생년월일</strong> 세 칸을 드래그해 복사(Ctrl+C)한 뒤
            아래 칸에 붙여넣기(Ctrl+V) 하세요. 생년월일은 2010.03.15, 2010-03-15, 0315 모두 괜찮아요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            name="roster"
            rows={8}
            value={roster}
            onChange={(e) => setRoster(e.target.value)}
            placeholder={ROSTER_EXAMPLE}
            className="font-mono text-xs"
            required
          />

          {preview.errors.length > 0 && (
            <ul className="space-y-1 text-xs text-destructive">
              {preview.errors.map((e) => (
                <li key={e}>⚠️ {e}</li>
              ))}
            </ul>
          )}

          {preview.rows.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                미리보기: 학생 {preview.rows.length}명 · 아이디는 이름 이니셜(성을 맨 뒤로) + 생일 4자리로 만들어져요.
              </p>
              <div className="max-h-64 overflow-auto rounded-md border">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-muted">
                    <tr className="text-left">
                      <th className="p-2">번호</th>
                      <th className="p-2">이름</th>
                      <th className="p-2">생일</th>
                      <th className="p-2">아이디(예정)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((r) => (
                      <tr key={r.loginId} className="border-t">
                        <td className="p-2">{r.number ?? "-"}</td>
                        <td className="p-2">{r.name}</td>
                        <td className="p-2">{r.birthDate}</td>
                        <td className="p-2 font-mono">{r.loginId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {state.error && (
        <div className="rounded-md border border-destructive p-3 text-sm text-destructive">
          <p>{state.error}</p>
          {state.rosterErrors?.map((e) => (
            <p key={e} className="text-xs">
              · {e}
            </p>
          ))}
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={pending || preview.errors.length > 0}>
        {pending ? "설치하는 중... (잠시만 기다려 주세요)" : "설치 완료하기"}
      </Button>
    </form>
  );
}
