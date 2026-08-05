# 맵 상단 마이홈 바로가기 버튼 추가

- **ID**: 072
- **날짜**: 2026-08-05
- **유형**: UX·맵 이동
- **리뷰 ID**: uieobisoicxojmbqqtpwasqphrczmjte

## 원문 요청사항

```text
맵에 입장했을 때 나가기 버튼 왼쪽에 마이홈 버튼 하나 추가로 만들어줘서 그 버튼 누르면 마이홈으로 이동하게 해줘.
```

## 변경 내용

- 로그인 사용자의 모든 맵 화면에서 나가기 버튼 왼쪽에 `🏡 마이홈` 버튼을 추가했다.
- 버튼 클릭을 기존 포탈과 같은 `travel-to-map` 이벤트의 `personal-farm` 목적지에 연결해 현재 맵을 종료하고 마이홈에 참여하도록 했다.
- 마이홈에 도착한 뒤에는 버튼을 비활성화하고 접근성 문구로 현재 위치임을 안내한다.
- 데스크톱과 모바일 위치, 지도 전체 보기 상태의 노출 규칙을 함께 반영했다.
- 런타임 빌드 ID를 `20260805-my-home-shortcut-v85`로 갱신하고 최신 React 산출물을 WIZ 정적 번들에 동기화했다.

## 주요 변경 파일

- `react-app/src/pages/GamePage.tsx`
- `react-app/src/pages/GamePage.css`
- `react-app/src/runtimeBuild.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/*`

## 확인 결과

- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- `npm run test:runtime-entry` 성공: 런타임 빌드 ID와 고유 엔트리 파일 검증 2개 통과
- WIZ 일반 빌드 성공
- 운영 v85 인덱스가 신규 GamePage JS·CSS 청크를 참조하는 것을 확인
- 운영 GamePage 번들에서 마이홈 버튼, `personal-farm`, `travel-to-map` 연결과 마이홈 내 비활성화 문구를 확인
- 운영 `/home` HTTP 200 및 `git diff --check` 통과

## 남은 리스크

- 이미 이전 버전 화면을 열어 둔 사용자는 새로고침해야 새 버튼을 확인할 수 있다.
- 실제 계정으로 여러 맵에서 버튼을 연속 클릭하는 수동 브라우저 검증은 수행하지 않았다.
