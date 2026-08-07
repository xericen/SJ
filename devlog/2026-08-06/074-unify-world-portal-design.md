# 17개 맵 월드 포탈 디자인 통일

- 날짜: 2026-08-06
- ID: 074
- 리뷰 ID: `wmpribphomlyxdbzlchfqhdxegxvyqup`

## 사용자 원문

> 세종호수 공원에서 공동캠퍼스로 가는 포탈 디자인으로 맵 17개 모든 맵의 포탈 디자인을 하나로 통일해줘.

## 변경 내용

- 세종호수공원에서 공동캠퍼스로 이동하는 파란 세로형 발광 포탈을 17개 월드의 공통 포탈 디자인으로 정의했다.
- 기존 바닥 원형·에너지 균열형·색상별 포탈 설정은 이동 좌표와 동작을 유지한 채 공통 세로형 파란 포탈로 렌더링되도록 통합했다.
- 공동캠퍼스 내부 4개 건물 포탈과 베어트리파크·곰 체험소 사이 이동 포탈도 같은 공통 렌더러와 애니메이션을 사용하도록 변경했다.
- 런타임 빌드 ID를 `20260806-unified-world-portals-v171`로 갱신하고 React 빌드 산출물을 WIZ 정적 자산에 반영했다.

## 변경 파일

- `react-app/src/game/worldPortalVisual.ts`
- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/scripts/worldPortalVisual.test.ts`
- `react-app/package.json`
- `react-app/src/runtimeBuild.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/*` (프로덕션 빌드 산출물)
- `devlog.md`
- `devlog/2026-08-06/074-unify-world-portal-design.md`

## 확인 결과

- 신규 포탈 디자인 테스트 2건이 모두 통과했다.
- 호수공원·공동캠퍼스·마이홈·동아리 거리제·먹거리 부스·17개 월드 내비게이션·런타임 엔트리 관련 회귀 테스트가 모두 통과했다.
- `npm run build`의 TypeScript, Vite, 성능 예산, 서버 TypeScript 검사가 모두 통과했다.
- React `dist`와 WIZ `src/assets/jochwon-app` 정적 자산이 완전히 일치함을 확인했다.
- WIZ 일반 빌드(`clean=false`)가 오류 없이 완료됐다.

## 남은 리스크

- 브라우저에서 캐릭터를 직접 이동해 17개 맵의 모든 포탈을 순회하는 수동 시각 검증은 수행하지 못했다.
- 이번 변경과 무관하게 기존 베어트리파크 테스트의 수목원 카메라 기대값 1건과 축제 포탈 테스트의 편집 제외 목록 기대값 1건은 현재 누적 구현과 달라 실패한다.
