import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  hashPassword,
  generateLoginId,
  generateRandomPassword,
} from "../src/lib/auth";

// 마이그레이션 CLI와 동일하게 direct connection을 사용한다.
const adapter = new PrismaPg(process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "");
const prisma = new PrismaClient({ adapter });

function addDays(base: Date, days: number, hour = 9, minute = 0) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function mmdd(d: Date) {
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const STUDENT_NAMES = [
  "김학생", "이서준", "박하은", "최지우", "정민서", "강예린", "조시우", "윤소율",
  "장은우", "임채원", "한지호", "오다인", "서준혁", "신아윤", "권태민", "황수아",
  "안현우", "송지안", "류하진", "전서윤", "홍민준", "배유나", "노건우", "문가은",
];

async function main() {
  console.log("기존 데이터 초기화...");
  await prisma.announcementRead.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.birthdayMessage.deleteMany();
  await prisma.compliment.deleteMany();
  await prisma.suggestion.deleteMany();
  await prisma.counselingRequest.deleteMany();
  await prisma.activityRecord.deleteMany();
  await prisma.classRole.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.scheduleItem.deleteMany();
  await prisma.lostItem.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.classGoal.deleteMany();
  await prisma.archiveEntry.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();

  const today = new Date();

  console.log("담임 계정 생성...");
  const teacherUsername = process.env.TEACHER_USERNAME ?? "teacher";
  const teacherPassword = process.env.TEACHER_PASSWORD ?? "changeme123!";
  await prisma.teacher.create({
    data: {
      username: teacherUsername,
      passwordHash: await hashPassword(teacherPassword),
      displayName: "담임 선생님",
    },
  });

  console.log("학생 계정 생성...");
  const students = [];
  const credentials: { name: string; loginId: string; password: string }[] = [];
  for (let i = 0; i < STUDENT_NAMES.length; i++) {
    const name = STUDENT_NAMES[i];
    const loginId = generateLoginId();
    const password = i === 0 ? "test1234!" : generateRandomPassword();
    const birthDate = i === 0 ? mmdd(today) : mmdd(addDays(today, (i * 17) % 300));

    const student = await prisma.student.create({
      data: {
        name,
        loginId,
        passwordHash: await hashPassword(password),
        birthDate,
        number: i + 1,
      },
    });
    students.push(student);
    credentials.push({ name, loginId, password });
  }

  console.log("공지 생성...");
  const ann1 = await prisma.announcement.create({
    data: {
      title: "월요일 1교시 전에 사물함 위 물건을 정리해 주세요.",
      body: "복도 통행에 불편이 없도록 사물함 위에 올려둔 물건을 모두 사물함 안으로 정리해 주세요.",
      category: "CLASS_NOTICE",
      pinned: true,
    },
  });
  await prisma.announcement.create({
    data: {
      title: "체육대회 상금 사용 설문에 참여해 주세요.",
      body: "지난 체육대회 상금 사용처를 정하기 위한 설문입니다. 이번 주 금요일까지 참여해 주세요.",
      category: "CLASS_NOTICE",
    },
  });
  await prisma.announcement.create({
    data: {
      title: "화재 대피 훈련 안내",
      body: "내일 2교시에 전교 화재 대피 훈련이 있습니다. 방송 안내에 따라 질서 있게 이동해 주세요.",
      category: "URGENT",
    },
  });
  await prisma.announcement.create({
    data: {
      title: "체육복을 준비해 주세요.",
      body: "다음 주부터 체육 수업이 야외에서 진행됩니다. 체육복을 꼭 챙겨오세요.",
      category: "SUPPLIES",
    },
  });
  await prisma.announcement.create({
    data: {
      title: "방학 전 사물함을 정리해 주세요.",
      body: "방학식 전날까지 개인 사물함을 비워주세요.",
      category: "SCHOOL_EVENT",
    },
  });

  // 21/24 확인 처리
  for (const s of students.slice(0, 21)) {
    await prisma.announcementRead.create({
      data: { announcementId: ann1.id, studentId: s.id },
    });
  }

  console.log("일정 생성...");
  await prisma.scheduleItem.create({
    data: {
      title: "영어 관심 주제 탐구 보고서",
      category: "ASSESSMENT",
      subject: "영어",
      startAt: addDays(today, -4),
      dueAt: addDays(today, 0, 23, 59),
      description: "관심 있는 주제를 정해 영어로 탐구 보고서를 작성해 제출합니다.",
      submissionMethod: "구글 클래스룸 제출",
      submissionLink: "https://classroom.google.com",
      submissionRequired: true,
      notifyFrom: addDays(today, -2),
    },
  });
  await prisma.scheduleItem.create({
    data: {
      title: "진로활동 소감문",
      category: "ASSESSMENT",
      subject: "진로활동",
      startAt: addDays(today, -2),
      dueAt: addDays(today, 0, 16, 0),
      description: "오늘 종례 전까지 진로활동 소감문을 제출합니다.",
      submissionMethod: "담임 선생님께 종이로 제출",
      submissionRequired: true,
    },
  });
  await prisma.scheduleItem.create({
    data: {
      title: "학생회 축제 부스 신청",
      category: "RECRUIT",
      startAt: addDays(today, -3),
      dueAt: addDays(today, 2, 18, 0),
      description: "축제에서 운영할 부스를 신청받습니다.",
      submissionLink: "https://forms.gle/example",
      submissionRequired: false,
    },
  });
  await prisma.scheduleItem.create({
    data: {
      title: "봉사활동 참가자 모집",
      category: "RECRUIT",
      startAt: addDays(today, -1),
      dueAt: addDays(today, 4, 23, 59),
      description: "지역 도서관 봉사활동 참가 신청을 받습니다.",
      submissionLink: "https://forms.gle/example2",
    },
  });
  await prisma.scheduleItem.create({
    data: {
      title: "2차 지필평가",
      category: "EXAM",
      startAt: addDays(today, 10, 9, 0),
      dueAt: addDays(today, 14, 17, 0),
      description: "2차 지필평가 기간입니다.",
    },
  });
  await prisma.scheduleItem.create({
    data: {
      title: "체육대회",
      category: "SCHOOL_EVENT",
      startAt: addDays(today, 7, 9, 0),
      dueAt: addDays(today, 7, 16, 0),
      description: "전교생이 참여하는 체육대회입니다.",
    },
  });
  await prisma.scheduleItem.create({
    data: {
      title: "체육복 준비",
      category: "SUPPLIES",
      startAt: addDays(today, 1, 0, 0),
      dueAt: addDays(today, 1, 9, 0),
      description: "체육 수업 전까지 체육복을 준비해 주세요.",
    },
  });
  await prisma.scheduleItem.create({
    data: {
      title: "학급회의",
      category: "CLASS_EVENT",
      startAt: addDays(today, 2, 14, 0),
      dueAt: addDays(today, 2, 15, 0),
      description: "이번 달 학급 건의사항을 논의합니다.",
    },
  });
  await prisma.scheduleItem.create({
    data: {
      title: "방학식",
      category: "SCHOOL_EVENT",
      startAt: addDays(today, 20, 9, 0),
      dueAt: addDays(today, 20, 12, 0),
      description: "1학기 방학식입니다.",
    },
  });

  console.log("칭찬함 생성...");
  await prisma.compliment.create({
    data: {
      targetStudentId: students[2].id,
      authorStudentId: students[5].id,
      occurredAt: "체육 시간에",
      whatDidText: "다친 친구의 짐을 대신 들어 주었어요. 먼저 부탁하지 않아도 도와주는 모습이 인상적이었어요.",
      whatToLearnText: "부탁하지 않아도 먼저 나서서 돕는 배려심을 본받고 싶어요.",
      valueTag: "CARE",
      visibility: "CLASS_PUBLIC",
      status: "APPROVED",
    },
  });
  await prisma.compliment.create({
    data: {
      targetStudentId: students[7].id,
      authorStudentId: students[1].id,
      occurredAt: "모둠 활동 시간에",
      whatDidText: "역할을 나눌 때 어려운 부분을 먼저 맡아줬어요.",
      whatToLearnText: "책임감 있게 어려운 일을 먼저 나서서 맡는 태도를 배우고 싶어요.",
      valueTag: "RESPONSIBILITY",
      visibility: "CLASS_PUBLIC",
      status: "APPROVED",
    },
  });
  await prisma.compliment.create({
    data: {
      targetStudentId: students[10].id,
      authorStudentId: students[3].id,
      occurredAt: "청소 시간에",
      whatDidText: "본인 구역이 아닌데도 남아서 같이 청소를 도와줬어요.",
      whatToLearnText: "내 일이 아니어도 함께 참여하는 협력의 자세를 배우고 싶어요.",
      valueTag: "COOPERATION",
      visibility: "TARGET_ONLY",
      status: "PENDING",
    },
  });

  console.log("생일 축하 메시지 생성...");
  const birthdayStudent = students[0];
  await prisma.birthdayMessage.create({
    data: {
      targetStudentId: birthdayStudent.id,
      authorStudentId: students[4].id,
      message: "항상 밝게 인사해 줘서 고마워. 생일 축하해!",
      status: "APPROVED",
    },
  });
  await prisma.birthdayMessage.create({
    data: {
      targetStudentId: birthdayStudent.id,
      authorStudentId: students[6].id,
      message: "올해 하고 싶은 일 모두 잘되길 바라!",
      status: "APPROVED",
    },
  });
  await prisma.birthdayMessage.create({
    data: {
      targetStudentId: birthdayStudent.id,
      authorStudentId: students[8].id,
      message: "생일 축하해! 앞으로도 잘 지내자.",
      status: "PENDING",
    },
  });

  console.log("건의함 생성...");
  await prisma.suggestion.create({
    data: {
      authorId: students[9].id,
      category: "CLEANING",
      content: "분리수거함 위치를 창가 쪽으로 옮기면 좋겠습니다.",
      visibility: "CLASS_MEETING_PUBLIC",
      status: "APPROVED",
    },
  });
  await prisma.suggestion.create({
    data: {
      authorId: students[11].id,
      category: "CLASS_EVENT",
      content: "이번 학기에 반 체육대회 연습 시간을 늘렸으면 좋겠습니다.",
      visibility: "TEACHER_ONLY",
      status: "PENDING",
    },
  });

  console.log("상담 신청 생성...");
  await prisma.counselingRequest.create({
    data: {
      studentId: students[12].id,
      category: "CAREER",
      preferredTime: "점심시간",
      status: "REQUESTED",
    },
  });
  await prisma.counselingRequest.create({
    data: {
      studentId: students[13].id,
      category: "FRIENDSHIP",
      preferredTime: "방과 후",
      status: "REQUESTED",
    },
  });

  console.log("분실물 생성...");
  await prisma.lostItem.create({
    data: {
      title: "검정 우산",
      foundLocation: "3층 복도",
      status: "UNCLAIMED",
    },
  });
  await prisma.lostItem.create({
    data: {
      title: "물통 (핑크색)",
      foundLocation: "체육관",
      status: "UNCLAIMED",
    },
  });

  console.log("자료실 생성...");
  await prisma.resource.createMany({
    data: [
      { title: "1학기 가정통신문 모음", category: "NOTICE_LETTER", url: "https://example.com/notice" },
      { title: "체험학습 신청 방법 안내", category: "FIELD_TRIP", url: "https://example.com/field-trip" },
      { title: "출결 서류 양식", category: "ATTENDANCE", url: "https://example.com/attendance" },
      { title: "수행평가 보고서 양식", category: "ASSESSMENT_FORM", url: "https://example.com/assessment-form" },
      { title: "학급 설문 (체육대회 상금 사용처)", category: "SURVEY", url: "https://forms.gle/example" },
    ],
  });

  console.log("당번/역할 생성...");
  await prisma.classRole.createMany({
    data: [
      { studentId: students[0].id, role: "칠판 정리", date: addDays(today, 0) },
      { studentId: students[1].id, role: "분리수거", date: addDays(today, 0) },
      { studentId: students[2].id, role: "칠판 정리", date: addDays(today, 1) },
    ],
  });

  console.log("학급 목표 생성...");
  const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  await prisma.classGoal.createMany({
    data: [
      { title: "지각 없는 날 만들기", targetValue: 15, currentValue: 11, month: monthKey },
      { title: "하루 한 번 교실 정리하기", targetValue: 100, currentValue: 72, month: monthKey },
    ],
  });

  console.log("학급 아카이브 생성...");
  await prisma.archiveEntry.create({
    data: {
      month: monthKey,
      title: "학급 자치활동",
      photoUrls: JSON.stringify([]),
      description: "이번 달 학급 자치활동 시간에 함께 정한 우리 반 규칙을 정리했어요.",
    },
  });

  console.log("나의 활동 기록 생성...");
  await prisma.activityRecord.create({
    data: {
      studentId: students[0].id,
      date: addDays(today, -14),
      area: "AUTONOMY",
      title: "체육대회 준비",
      role: "응원 도구 제작 담당",
      actions: "학급 응원 도구를 구성원들과 역할을 나눠 제작했다.",
      difficulty: "재료가 부족해서 어려움을 겪었다.",
      solution: "다른 모둠과 재료를 나눠 쓰기로 조율했다.",
      learned: "협업 시 자원을 조율하는 것의 중요성을 알게 되었다.",
      status: "TEACHER_REVIEW",
    },
  });

  console.log("\n=== 로그인 정보 ===");
  console.log(`담임: ${teacherUsername} / ${teacherPassword}`);
  console.log("\n학생 계정 (테스트용으로 1번 학생은 비밀번호 test1234! 고정):");
  for (const c of credentials) {
    console.log(`  ${c.name.padEnd(4, " ")}  loginId=${c.loginId}  password=${c.password}`);
  }
  console.log("\nseed 완료");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
