import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getSessionSecret } from "@/lib/session-secret";

const COOKIE_NAME = "chub_session";

async function readSession(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, await getSessionSecret());
    return payload as { role?: string; teacherId?: string; studentId?: string };
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminArea = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isStudentArea = pathname.startsWith("/me") && pathname !== "/me/login";

  if (isAdminArea) {
    const session = await readSession(req);
    if (!session || session.role !== "teacher") {
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isStudentArea) {
    const session = await readSession(req);
    if (!session || session.role !== "student") {
      const loginUrl = new URL("/me/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// 페이지 라우트 1차 방어. 각 Server Action 내부에서도 세션을 다시 검증한다(2차 방어).
export const config = {
  matcher: ["/admin/:path*", "/me/:path*"],
};
