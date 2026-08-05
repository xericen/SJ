# 공간 안내 마이홈 첫 카드 노출 및 운영 재배포

- **ID**: 067
- **날짜**: 2026-08-05
- **유형**: UX·운영 배포 확인
- **리뷰 ID**: uieobisoicxojmbqqtpwasqphrczmjte

## 원문 요청사항

```text
변경 요약
공간 안내에 실제 GLB 기반 마이홈을 추가해 총 17개 월드로 확장했습니다.
기존 사용자 노출 명칭 개인 팜을 모두 마이홈으로 변경했습니다.
3D 미리보기와 실제 입장 경로를 연결했습니다.
확인한 내용
클라이언트·서버 검사 및 운영 빌드 통과
운영 v78과 마이홈 GLB 정상 응답 확인
기존 개인 팜 문구 제거 확인
남은 리스크
미션으로 동적 배치되는 보상 장식은 정적 3D 미리보기에는 표시되지 않습니다. 안 넣어져 있는데 다시 한 번 확인해줘
```

## 변경 내용

- 운영 v79 번들에 마이홈 데이터와 실제 GLB 연결이 포함되어 있음을 먼저 확인했다.
- 마이홈이 공간 안내의 8번째 카드여서 일반적인 첫 화면 높이에서 보이지 않던 문제를 확인했다.
- `personal-farm`을 17개 공간 안내 순서의 첫 번째로 이동해 마이홈이 첫 카드로 즉시 보이도록 했다.
- 런타임 빌드 ID를 `20260805-my-home-guide-visible-v80`으로 갱신하고 최신 React 산출물을 WIZ 정적 번들에 동기화했다.

## 주요 변경 파일

- `react-app/src/pages/LandingPage.tsx`
- `react-app/src/runtimeBuild.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/*`

## 확인 결과

- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- `npm run test:runtime-entry` 성공: 런타임 빌드 ID와 고유 엔트리 파일 검증 2개 통과
- 공간 안내 순서가 총 17개이고 첫 항목이 `personal-farm`임을 확인
- WIZ 일반 빌드 성공
- 운영 v80 인덱스와 엔트리 번들에서 `마이홈`, `personal-farm`을 확인
- 운영 마이홈 GLB 응답 HTTP 200 확인
- `git diff --check` 통과

## 남은 리스크

- 이미 이전 버전 화면을 열어 둔 사용자는 새로고침해야 첫 카드로 이동한 마이홈을 확인할 수 있다.
- 미션 진행에 따라 동적으로 배치되는 보상 장식은 정적 3D 미리보기에는 표시되지 않는다.
