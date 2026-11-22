import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getSessionSecret as getSecretKey } from "@/lib/session-secret";

const COOKIE_NAME = "chub_session";
const MAX_AGE_SECONDS = 60 * 60 * 4; // 4시간 후 자동 로그아웃

export type SessionPayload =
  | { role: "teacher"; teacherId: string }
  | { role: "student"; studentId: string };

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(await getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, await getSecretKey());
    if (payload.role === "teacher" && typeof payload.teacherId === "string") {
      return { role: "teacher", teacherId: payload.teacherId };
    }
    if (payload.role === "student" && typeof payload.studentId === "string") {
      return { role: "student", studentId: payload.studentId };
    }
    return null;
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function requireTeacher() {
  const session = await getSession();
  if (!session || session.role !== "teacher") {
    return null;
  }
  return session;
}

export async function requireStudent() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return null;
  }
  return session;
}
