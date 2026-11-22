import {
  AnnouncementCategory,
  ScheduleCategory,
  SubmissionStatus,
  ApprovalStatus,
  ComplimentVisibility,
  ComplimentValueTag,
  SuggestionCategory,
  SuggestionVisibility,
  CounselingCategory,
  CounselingStatus,
  LostItemStatus,
  ResourceCategory,
  ActivityArea,
  ActivityStatus,
} from "@/generated/prisma/enums";

export const announcementCategoryLabel: Record<AnnouncementCategory, string> = {
  URGENT: "긴급",
  ASSESSMENT: "수행평가",
  SCHOOL_EVENT: "학교행사",
  RECRUIT: "모집",
  SUPPLIES: "준비물",
  CLASS_NOTICE: "학급공지",
};

export const scheduleCategoryLabel: Record<ScheduleCategory, string> = {
  ASSESSMENT: "수행평가",
  EXAM: "지필평가",
  SCHOOL_EVENT: "학교행사",
  RECRUIT: "모집",
  CLASS_EVENT: "학급일정",
  SUPPLIES: "준비물",
};

export const scheduleCategoryColor: Record<ScheduleCategory, string> = {
  ASSESSMENT: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  EXAM: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  SCHOOL_EVENT: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  RECRUIT: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  CLASS_EVENT: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  SUPPLIES: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export const announcementCategoryColor: Record<AnnouncementCategory, string> = {
  URGENT: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  ASSESSMENT: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  SCHOOL_EVENT: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  RECRUIT: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  SUPPLIES: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  CLASS_NOTICE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

export const scheduleCategoryIcon: Record<ScheduleCategory, string> = {
  ASSESSMENT: "📝",
  EXAM: "📚",
  SCHOOL_EVENT: "🏫",
  RECRUIT: "🙋",
  CLASS_EVENT: "👥",
  SUPPLIES: "🎒",
};

export const submissionStatusLabel: Record<SubmissionStatus, string> = {
  NOT_SUBMITTED: "미제출",
  SUBMITTED: "제출 완료",
  CONFIRMING: "확인 중",
  NEEDS_REVISION: "수정 요청",
};

export const approvalStatusLabel: Record<ApprovalStatus, string> = {
  PENDING: "승인 대기",
  APPROVED: "승인됨",
  REJECTED: "거절됨",
};

export const complimentVisibilityLabel: Record<ComplimentVisibility, string> = {
  CLASS_PUBLIC: "학급 전체 공개",
  TARGET_ONLY: "해당 학생에게만",
  TEACHER_ONLY: "담임 선생님만",
};

export const complimentValueTagLabel: Record<ComplimentValueTag, string> = {
  CARE: "배려",
  RESPONSIBILITY: "책임감",
  COOPERATION: "협력",
  DILIGENCE: "성실",
  CHALLENGE: "도전",
  SERVICE: "봉사",
  CONFLICT_RESOLUTION: "갈등 해결",
};

export const suggestionCategoryLabel: Record<SuggestionCategory, string> = {
  SEATING: "자리 배치",
  CLEANING: "청소",
  CLASS_EVENT: "학급 행사",
  CLASSROOM_ENV: "교실 환경",
  CLASS_RULE: "학급 규칙",
  ETC: "기타 건의",
};

export const suggestionVisibilityLabel: Record<SuggestionVisibility, string> = {
  TEACHER_ONLY: "담임만 보기",
  CLASS_MEETING_PUBLIC: "학급회의 안건으로 공개",
};

export const counselingCategoryLabel: Record<CounselingCategory, string> = {
  ACADEMIC: "학업",
  CAREER: "진로",
  FRIENDSHIP: "친구 관계",
  SCHOOL_LIFE: "학교생활",
  FAMILY: "가정생활",
  OTHER: "기타",
  URGENT: "긴급하게 이야기하고 싶어요",
};

export const counselingStatusLabel: Record<CounselingStatus, string> = {
  REQUESTED: "신청됨",
  SCHEDULED: "일정 조율됨",
  DONE: "완료",
};

export const lostItemStatusLabel: Record<LostItemStatus, string> = {
  UNCLAIMED: "미수령",
  CLAIMED: "찾아감",
};

export const resourceCategoryLabel: Record<ResourceCategory, string> = {
  NOTICE_LETTER: "가정통신문",
  FIELD_TRIP: "체험학습",
  ATTENDANCE: "출결 서류",
  ASSESSMENT_FORM: "수행평가 양식",
  SURVEY: "학급 설문",
  SCHOOL_LIFE: "학교생활 안내",
  FAQ: "자주 묻는 질문",
  ETC: "기타",
};

export const activityAreaLabel: Record<ActivityArea, string> = {
  AUTONOMY: "자율활동",
  CAREER: "진로활동",
  SERVICE_COMMUNITY: "봉사·공동체",
  CLUB: "동아리",
  ETC: "기타",
};

export const activityStatusLabel: Record<ActivityStatus, string> = {
  COLLECTING: "자료 수집 중",
  DRAFTED: "초안 작성",
  STUDENT_CONFIRMED: "학생 확인",
  TEACHER_REVIEW: "교사 검토",
  FINALIZED: "반영 완료",
};
