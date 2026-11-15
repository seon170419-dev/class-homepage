// 로그인 쿠키 서명 키. proxy.ts와 서버 코드가 같이 쓴다.
// SESSION_SECRET 환경변수가 있으면 그것을, 없으면(템플릿으로 설치한 사이트)
// 서버에만 있는 비밀값인 DATABASE_URL에서 키를 만들어 쓴다.
let cached: Uint8Array | null = null;

export async function getSessionSecret(): Promise<Uint8Array> {
  if (cached) return cached;

  const explicit = process.env.SESSION_SECRET;
  if (explicit) {
    cached = new TextEncoder().encode(explicit);
    return cached;
  }

  const base = process.env.DATABASE_URL;
  if (!base) throw new Error("SESSION_SECRET 또는 DATABASE_URL 환경변수가 필요합니다.");

  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`class-homepage-session:${base}`)
  );
  cached = new Uint8Array(digest);
  return cached;
}
