import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const SALT_ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

const ID_CHARS = "abcdefghjkmnpqrstuvwxyz23456789"; // 혼동되는 문자(i,l,o,0,1) 제외
const PASSWORD_CHARS =
  "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomString(length: number, charset: string): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += charset[bytes[i] % charset.length];
  }
  return out;
}

// 학번/생일 등으로 추측 불가능한 무작위 로그인 아이디 (예: st-3f8k9q2p)
export function generateLoginId(): string {
  return `st-${randomString(8, ID_CHARS)}`;
}

// 무작위 비밀번호 (담임이 학생에게 개별 배부)
export function generateRandomPassword(): string {
  return randomString(12, PASSWORD_CHARS);
}

export const LOGIN_MAX_ATTEMPTS = 5;
export const LOGIN_LOCK_MINUTES = 15;
