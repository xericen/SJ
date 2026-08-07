# 작은 화면 월드 HUD 한글 가독성 및 줄바꿈 수정

- **ID**: 069
- **날짜**: 2026-08-06
- **유형**: UX·반응형·접근성
- **리뷰 ID**: mecvnhcnxwvdbqtvascztasvufgoawkz

## 작업 요약

작은 브라우저 창에서 월드 핵심 HUD의 7~10px 한글이 뭉개지고 좁은 영역에서 글자 단위로 끊기던 문제를 수정했다. 800px 이하 화면에서 현재 위치·현재 활동 중·내 친구 영역의 글자 크기와 줄 높이를 상향하고, 한글 단어 보존 및 긴 보조 문구 말줄임을 적용했다. 520px 이하에서는 활동 제목 폭 제한을 해제하고 패널 폭을 뷰포트 안으로 제한했다.

## 원문 요청사항

```text
화면을 전체화면으로 안 보고 작은 화면으로 보면 글씨가 깨지는 현상이있음, 이 부분 수정해줘
```

## 변경 파일 목록

- `react-app/src/pages/GamePage.css`
  - 800px 이하 핵심 HUD의 한글 글자 크기·줄 높이·단어 줄바꿈·말줄임을 보강했다.
  - 520px 이하 활동 패널의 제목 폭 제한과 뷰포트 폭 대응을 수정했다.
- `react-app/src/styles.css`
  - 브라우저 텍스트 자동 확대 비율을 고정하고 글꼴 안티앨리어싱 설정을 추가했다.
- `react-app/scripts/socialProfileActions.test.ts`
  - 작은 화면 HUD 가독성 규칙 회귀 검사를 추가했다.
- `react-app/src/runtimeBuild.ts`
  - 런타임 빌드 ID를 `20260806-responsive-hud-typography-v166`으로 갱신했다.
- `react-app/dist/`, `src/assets/jochwon-app/`
  - 새 프로덕션 번들을 생성하고 WIZ 운영 정적 자산과 동일하게 동기화했다.
  - 이전 v165 해시 자산은 새 v166 해시 자산으로 교체했다.
- `src/app/page.home/view.pug`
  - iframe 진입 URL의 캐시 무효화 빌드 ID를 v166으로 갱신했다.
- `devlog.md`, `devlog/2026-08-06/069-fix-small-screen-hud-typography.md`
  - 이번 변경과 검증 결과를 기록했다.

## 확인 결과

- 소셜·HUD 회귀 테스트 6건 통과
- 클라이언트·서버 TypeScript 검사 및 Vite 프로덕션 빌드 통과
- 프런트 성능 예산 검사 통과
- `react-app/dist`와 WIZ 배포 자산의 동일성 확인
- 새 빌드 ID, 진입 JS/CSS 해시 및 생성 CSS 내 반응형 규칙 포함 확인
- 운영 URL에서 v166 진입 HTML과 작은 화면 반응형 CSS 제공 확인
- SUIT 한글 웹폰트 운영 경로 존재 확인
- WIZ 프로젝트 일반 빌드 통과

## 남은 리스크

- ReviewOps 캡처가 차단되어 실제 브라우저 창 크기별 시각 확인은 수행하지 못했다.
- 월드별 별도 체험 패널에는 기존의 매우 작은 보조 문구가 남아 있어, 동일 증상이 특정 체험 화면에서 재현되면 해당 패널을 별도로 조정해야 한다.
