# 추천 코스 원형 포탈 통일 및 안내 겹침 수정

- 날짜: 2026-08-06
- ID: 086
- 리뷰 ID: `wmpribphomlyxdbzlchfqhdxegxvyqup`

## 사용자 원문

> 포탈 세종 추천 코스 게시판에 있는 포탈로 전부 다 포탈 디자인 바꿔주라 그리고 포탈 탈때 아래 1,2,3초 나오는데 그거랑 뭐 상호작용 하는거 E 누르는 거랑 같이 나오는 경우가 많더라 그거 같이 나오면 위치 수정좀 한번 해주라

## 변경 내용

- 17개 맵의 월드 이동 포탈을 세종호수공원 `세종 추천 코스 게시판`과 같은 흰색 바닥 원형 다중 링 디자인으로 통일했다.
- 공동캠퍼스 건물 포탈과 곰 체험소 이동 포탈도 동일한 공통 디자인과 펄스 애니메이션을 사용하도록 유지했다.
- 포탈의 1·2·3초 충전 패널과 E 키 상호작용 안내가 동시에 나타나면 충전 패널을 위로 올려 두 안내가 겹치지 않도록 했다.
- 런타임 빌드 ID를 `20260806-recommendation-portals-v182`로 갱신하고 최신 누적 React 빌드를 WIZ 정적 자산에 동기화했다.

## 변경 파일

- `react-app/src/game/worldPortalVisual.ts`
- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/src/pages/GamePage.css`
- `react-app/scripts/worldPortalVisual.test.ts`
- `react-app/src/runtimeBuild.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/*` (프로덕션 빌드 산출물)
- `devlog.md`
- `devlog/2026-08-06/086-recommendation-portal-design-and-prompt-spacing.md`

## 확인 결과

- 신규 포탈 디자인·안내 위치 테스트 3건이 모두 통과했다.
- 호수공원 포탈 12건, 공동캠퍼스 포탈 11건, 17개 월드 내비게이션 6건 및 런타임·동아리 거리제·먹거리 관련 회귀 테스트가 통과했다.
- `npm run build`의 TypeScript, Vite, 성능 예산 및 서버 TypeScript 검사가 모두 통과했다.
- React `dist`와 WIZ 정적 자산이 완전히 일치하며 WIZ 일반 빌드(`clean=false`)가 성공했다.

## 남은 리스크

- 브라우저에서 17개 맵을 직접 순회하며 포탈과 모든 E 안내 조합을 확인하는 수동 시각 검증은 수행하지 못했다.
- 이번 변경과 무관하게 마이홈 회귀 테스트 1건은 누적 UI 위치값이 기존 기대값 `218px`에서 `226px`로 변경되어 실패한다.
