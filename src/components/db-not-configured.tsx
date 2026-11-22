export function DbNotConfigured() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">거의 다 됐어요! 데이터베이스만 연결하면 돼요</h1>
      <p className="text-muted-foreground">
        사이트는 올라갔지만 아직 데이터를 저장할 곳이 연결되지 않았어요. Vercel 화면에서 아래 순서대로 진행해 주세요.
      </p>
      <ol className="list-decimal space-y-2 pl-5 text-sm">
        <li>Vercel에서 이 프로젝트를 열고 위쪽 <strong>Storage</strong> 탭을 누르세요.</li>
        <li>
          <strong>Create Database</strong> → <strong>Neon</strong>(Postgres)을 고르고 만들기를 누른 뒤, 이 프로젝트에
          연결(Connect)하세요.
        </li>
        <li>
          다시 <strong>Create Database</strong> → <strong>Blob</strong>을 고르고 만들기를 누른 뒤, 이 프로젝트에
          연결하세요. (사진·첨부파일 저장용)
        </li>
        <li>
          <strong>Deployments</strong> 탭 → 맨 위 배포의 <strong>⋯</strong> 버튼 → <strong>Redeploy</strong>를
          누르세요.
        </li>
        <li>2~3분 뒤 이 페이지를 새로고침하면 설치 화면이 나와요.</li>
      </ol>
      <p className="text-xs text-muted-foreground">자세한 설명은 설치 가이드북의 4단계를 참고하세요.</p>
    </div>
  );
}
