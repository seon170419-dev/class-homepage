// 학생 아이디 규칙: 이름 이니셜(성을 맨 뒤로) + 생일 MMDD. 예) 김민준, 03-15 → MJK0315

const CHOSEONG = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];
const CHOSEONG_LETTER: Record<string, string | null> = {
  "ㄱ": "K", "ㄲ": "K", "ㄴ": "N", "ㄷ": "D", "ㄸ": "T", "ㄹ": "R", "ㅁ": "M",
  "ㅂ": "P", "ㅃ": "P", "ㅅ": "S", "ㅆ": "S", "ㅇ": null, "ㅈ": "J", "ㅉ": "J",
  "ㅊ": "C", "ㅋ": "K", "ㅌ": "T", "ㅍ": "P", "ㅎ": "H",
};
const JUNGSEONG = [
  "ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ",
  "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ",
];
const JUNGSEONG_LETTER: Record<string, string> = {
  "ㅏ": "A", "ㅐ": "A", "ㅑ": "Y", "ㅒ": "Y", "ㅓ": "E", "ㅔ": "E", "ㅕ": "Y",
  "ㅖ": "Y", "ㅗ": "O", "ㅘ": "W", "ㅙ": "W", "ㅚ": "O", "ㅛ": "Y", "ㅜ": "U",
  "ㅝ": "W", "ㅞ": "W", "ㅟ": "W", "ㅠ": "Y", "ㅡ": "E", "ㅢ": "U", "ㅣ": "I",
};

function hangulInitial(ch: string): string | null {
  const code = ch.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return null;
  const cho = CHOSEONG[Math.floor(code / (21 * 28))];
  const jung = JUNGSEONG[Math.floor((code % (21 * 28)) / 28)];
  return CHOSEONG_LETTER[cho] ?? JUNGSEONG_LETTER[jung];
}

function nameInitials(name: string): string {
  const trimmed = name.replace(/\s+/g, "");
  const isHangul = trimmed.length > 0 && [...trimmed].every((ch) => hangulInitial(ch) !== null);

  if (isHangul) {
    const chars = [...trimmed];
    const surname = chars[0];
    const given = chars.slice(1);
    return [...given, surname].map((ch) => hangulInitial(ch)).join("");
  }

  // 한글이 아닌 이름(예: 영문)은 단어별 첫 글자
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.map((w) => w[0]?.toUpperCase() ?? "").join("").replace(/[^A-Z0-9]/g, "");
  return letters || "ST";
}

export function makeLoginId(name: string, birthDate: string): string {
  return `${nameInitials(name)}${birthDate.replace("-", "")}`;
}

// 이미 쓰인 아이디와 겹치면 뒤에 2, 3...을 붙인다.
export function uniqueLoginId(base: string, taken: Set<string>): string {
  let id = base;
  let n = 2;
  while (taken.has(id)) {
    id = `${base}${n}`;
    n += 1;
  }
  taken.add(id);
  return id;
}

// "2010.08.31", "2010-08-31", "20100831", "08-31", "8/31", "0831" 등을 MM-DD로 바꾼다.
export function parseBirthDate(raw: string): string | null {
  const digits = raw.trim().replace(/[^\d]/g, " ").trim().split(/\s+/).filter(Boolean);
  let month: number;
  let day: number;

  if (digits.length >= 3) {
    month = Number(digits[1]);
    day = Number(digits[2]);
  } else if (digits.length === 2) {
    month = Number(digits[0]);
    day = Number(digits[1]);
  } else if (digits.length === 1 && digits[0].length === 8) {
    month = Number(digits[0].slice(4, 6));
    day = Number(digits[0].slice(6, 8));
  } else if (digits.length === 1 && digits[0].length === 4) {
    month = Number(digits[0].slice(0, 2));
    day = Number(digits[0].slice(2, 4));
  } else {
    return null;
  }

  if (!(month >= 1 && month <= 12 && day >= 1 && day <= 31)) return null;
  return `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export type RosterRow = { number: number | null; name: string; birthDate: string };
export type RosterParseResult = { rows: RosterRow[]; errors: string[] };

// 엑셀에서 복사한 명단(탭/쉼표 구분)을 읽는다. 열 순서: 번호, 이름, 생년월일
// 번호 없이 "이름, 생년월일" 두 칸만 있어도 되고, 제목 줄은 자동으로 건너뛴다.
export function parseRoster(text: string): RosterParseResult {
  const rows: RosterRow[] = [];
  const errors: string[] = [];

  text.split(/\r?\n/).forEach((line, idx) => {
    if (!line.trim()) return;
    const cells = line.split(/\t|,/).map((c) => c.trim()).filter((c) => c !== "");
    if (cells.length === 0) return;
    // 양식의 빈 줄(번호만 미리 채워진 줄)까지 복사한 경우
    if (cells.length === 1 && /^\d+$/.test(cells[0])) return;

    let numberCell: string | null = null;
    let nameCell: string;
    let birthCell: string;

    if (cells.length >= 3) {
      // 앞에 반·학년 칸이 더 있어도 되도록 뒤에서부터 읽는다.
      const n = cells.length;
      [numberCell, nameCell, birthCell] = [cells[n - 3], cells[n - 2], cells[n - 1]];
    } else if (cells.length === 2) {
      [nameCell, birthCell] = [cells[0], cells[1]];
    } else {
      errors.push(`${idx + 1}번째 줄: 이름과 생년월일이 모두 필요해요 → "${line.trim()}"`);
      return;
    }

    const birthDate = parseBirthDate(birthCell);
    if (!birthDate) {
      if (idx === 0) return; // 제목 줄
      errors.push(`${idx + 1}번째 줄: 생년월일을 읽을 수 없어요 → "${birthCell}"`);
      return;
    }

    const parsedNumber = numberCell !== null ? Number(numberCell.replace(/[^\d]/g, "")) : NaN;
    rows.push({
      number: Number.isFinite(parsedNumber) && parsedNumber > 0 ? parsedNumber % 100 || parsedNumber : null,
      name: nameCell,
      birthDate,
    });
  });

  return { rows, errors };
}
