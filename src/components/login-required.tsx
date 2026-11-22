import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function LoginRequired({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="space-y-3 py-6 text-center">
        <p className="text-sm text-muted-foreground">{message}</p>
        <Link href="/me/login">
          <Button>내 페이지 로그인하기</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
