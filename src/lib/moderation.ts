import { screenText } from "@/lib/ai";

// 간단한 1차 금칙어 필터. 필요에 따라 목록을 추가하세요.
const BANNED_WORDS = ["시발", "씨발", "개새끼", "병신", "지랄", "좆", "닥쳐", "꺼져"];

export function containsBannedWord(text: string): boolean {
  const normalized = text.replace(/\s/g, "");
  return BANNED_WORDS.some((word) => normalized.includes(word));
}

export async function moderateText(
  text: string
): Promise<{ flaggedByAi: boolean; aiFlagReason?: string }> {
  if (containsBannedWord(text)) {
    return { flaggedByAi: true, aiFlagReason: "금칙어 포함" };
  }
  const result = await screenText(text);
  return { flaggedByAi: result.flagged, aiFlagReason: result.reason };
}
