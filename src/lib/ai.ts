import OpenAI from "openai";
import { ComplimentValueTag } from "@/generated/prisma/enums";

const MODEL = "gpt-4o-mini";

let client: OpenAI | null | undefined;

function getClient(): OpenAI | null {
  if (client !== undefined) return client;
  const apiKey = process.env.OPENAI_API_KEY;
  client = apiKey ? new OpenAI({ apiKey }) : null;
  return client;
}

export function isAiEnabled() {
  return getClient() !== null;
}

export async function draftActivityRecord(input: {
  area: string;
  title: string;
  role?: string | null;
  actions?: string | null;
  difficulty?: string | null;
  solution?: string | null;
  learned?: string | null;
}): Promise<string | null> {
  const openai = getClient();
  if (!openai) return null;

  const prompt = `다음은 한 학생이 작성한 학교 활동 기록입니다. 이 내용을 바탕으로 한국 초중고 생활기록부(생기부)에 들어갈 수 있는 개조식 초안 문장을 1~2문장으로 작성해 주세요.
규칙:
- 명사형(-함, -음)으로 종결
- 과장하지 않고 사실 위주로 서술
- "~한 점이 돋보임", "~하는 모습을 보임"과 같은 관찰 서술 허용
- 문장부호 외 특수기호(이모지 등) 사용 금지

영역: ${input.area}
활동명: ${input.title}
맡은 역할: ${input.role ?? "정보 없음"}
구체적으로 한 행동: ${input.actions ?? "정보 없음"}
어려웠던 점: ${input.difficulty ?? "정보 없음"}
어떻게 해결했는지: ${input.solution ?? "정보 없음"}
새롭게 알게 된 점: ${input.learned ?? "정보 없음"}

초안 문장만 출력하세요.`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
  });

  return response.choices[0]?.message?.content?.trim() ?? null;
}

const VALUE_TAG_VALUES = Object.values(ComplimentValueTag) as string[];

export async function suggestComplimentTag(
  whatDidText: string
): Promise<ComplimentValueTag | null> {
  const openai = getClient();
  if (!openai) return null;

  const prompt = `다음은 학생이 친구를 칭찬하며 작성한 행동 설명입니다. 아래 가치 목록 중 이 행동에 가장 잘 어울리는 것 하나를 골라 그 영어 코드만 정확히 출력하세요. 다른 말은 절대 덧붙이지 마세요.

가치 목록:
CARE(배려), RESPONSIBILITY(책임감), COOPERATION(협력), DILIGENCE(성실), CHALLENGE(도전), SERVICE(봉사), CONFLICT_RESOLUTION(갈등 해결)

행동 설명: ${whatDidText}`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
  });

  const raw = response.choices[0]?.message?.content?.trim().toUpperCase() ?? "";
  const match = VALUE_TAG_VALUES.find((tag) => raw.includes(tag));
  return (match as ComplimentValueTag) ?? null;
}

export async function screenText(
  text: string
): Promise<{ flagged: boolean; reason?: string }> {
  const openai = getClient();
  if (!openai) return { flagged: false };

  const prompt = `다음은 학생이 반 친구에게 남긴 익명 메시지입니다. 이 메시지가 아래 중 하나에 해당하는지 검토하세요.
- 욕설, 비속어, 혐오 표현
- 조롱, 놀림, 비하
- 이모티콘만 반복하는 등 성의 없는 장난성 내용
- 사실이 아닐 가능성이 높은 악의적 내용

JSON 형식으로만 답하세요: {"flagged": true 또는 false, "reason": "간단한 사유 (flagged가 true일 때만)"}

메시지: ${text}`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
    response_format: { type: "json_object" },
  });

  try {
    const parsed = JSON.parse(response.choices[0]?.message?.content ?? "{}");
    return {
      flagged: Boolean(parsed.flagged),
      reason: typeof parsed.reason === "string" ? parsed.reason : undefined,
    };
  } catch {
    return { flagged: false };
  }
}
