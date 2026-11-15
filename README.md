# 우리 반 홈페이지 (설치형)

담임 선생님이 클릭 몇 번으로 우리 반 전용 홈페이지를 만들 수 있는 템플릿입니다.
코딩을 몰라도 괜찮아요. 설치는 **약 15분**, 비용은 **무료**입니다.

## 👉 설치하기

[![Vercel로 설치하기](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fseon170419-dev%2Fclass-homepage&project-name=class-homepage&repository-name=class-homepage&env=SETUP_CODE&envDescription=%EC%84%A4%EC%B9%98+%ED%99%94%EB%A9%B4%EC%97%90%EC%84%9C+%ED%95%9C+%EB%B2%88+%EC%9E%85%EB%A0%A5%ED%95%A0+%EC%84%A4%EC%B9%98+%EC%BD%94%EB%93%9C%EC%98%88%EC%9A%94.+%EC%95%84%EB%AC%B4+%EB%8B%A8%EC%96%B4%EB%82%98+%EC%88%AB%EC%9E%90%EB%A5%BC+%EC%A0%95%ED%95%B4%EC%84%9C+%EC%A0%81%EA%B3%A0+%EA%BC%AD+%EA%B8%B0%EC%96%B5%ED%95%B4+%EB%91%90%EC%84%B8%EC%9A%94.+%28%EC%98%88%3A+haengbok2026%29)

처음이라면 **[설치 가이드북(Word)](docs/우리반홈페이지_설치가이드북.docx)**을 먼저 내려받아 한 단계씩 따라 하세요.

### 설치 순서 요약
1. **GitHub 가입** — github.com에서 이메일로 가입 (3분)
2. **위의 "Deploy" 버튼 클릭** — "Continue with GitHub"로 Vercel 가입, 설치 코드(SETUP_CODE) 정하기
3. **저장소 연결** — Vercel의 Storage 탭에서 **Neon**(데이터베이스)과 **Blob**(파일 저장) 만들기 → Redeploy
4. **설치 화면** — 내 사이트 주소에 들어가 반 정보 입력, 엑셀 명단 붙여넣기
5. **학생 계정 배부** — 자동으로 만들어진 아이디·임시 비밀번호 표를 인쇄해서 나눠주기

학생 명단 양식: [docs/학생명단_양식.xlsx](docs/학생명단_양식.xlsx)

## 주요 기능

- **오늘 할 일 중심 홈 화면**: 오늘 마감·곧 마감 일정, 담임 공지, 오늘의 생일·당번, 칭찬
- **학급 캘린더**: 수행평가·지필평가·학교행사, 학생별 제출 여부 체크
- **익명 칭찬함 · 건의함 · 상담 신청 · 생일 축하** (모두 담임 승인/관리)
- **나의 활동 기록**: 학생이 활동을 기록하면 담임이 생기부 초안으로 정리 (OpenAI 키가 있으면 AI 초안)
- **자료실 · 분실물 게시판 · 학급 아카이브 · 당번표 · 이번 달 목표**
- **학생 계정**: 아이디는 이름 이니셜+생일(예: 김민준 3월 15일 → `MJK0315`), 비밀번호는 학생이 직접 변경

## 업데이트 받기

이 템플릿이 개선되면, 내 GitHub 저장소의 **Actions** 탭 → **업데이트 받기** → **Run workflow**를 누르세요.
몇 분 뒤 사이트가 최신 버전으로 자동 재배포됩니다. (자세한 방법은 가이드북 참고)

## 비용과 개인정보

- GitHub, Vercel(Hobby), Neon, Vercel Blob 모두 **무료 플랜**으로 한 반 규모는 충분합니다.
- 학생 정보는 **선생님 본인 계정의 데이터베이스에만** 저장됩니다. 템플릿 제작자는 접근할 수 없어요.
- 무료 플랜 한도와 약관은 바뀔 수 있으니 각 서비스 요금 안내를 확인하세요.

## 개발자용

```bash
npm install
cp .env.example .env   # DATABASE_URL 등 입력
npm run dev
```

스택: Next.js 16 · TypeScript · Tailwind CSS v4 · shadcn/ui · Prisma 7 (Postgres) · Vercel Blob · OpenAI(선택)

- 빌드 시 DB가 연결되어 있으면 `prisma migrate deploy`가 자동 실행됩니다 (`scripts/migrate-if-configured.mjs`).
- `npm run db:seed` / `npm run db:reset`은 **모든 데이터를 지우므로** 실제 운영 DB에서 실행하지 마세요.
