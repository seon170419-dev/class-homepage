// 빌드 전에 DB 테이블을 자동으로 만들거나 최신으로 맞춘다.
// DB가 아직 연결되지 않은 첫 배포에서는 건너뛰어 빌드가 실패하지 않게 한다.
import { execSync } from "node:child_process";

const hasDb =
  process.env.DIRECT_URL || process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!hasDb) {
  console.log("[migrate] DB가 아직 연결되지 않아 마이그레이션을 건너뜁니다.");
  process.exit(0);
}

execSync("npx prisma migrate deploy", { stdio: "inherit" });
