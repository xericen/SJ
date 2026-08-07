# 축제부스 기존 좌측 HUD에 스탬프 패널 강제 표시

- 날짜: 2026-08-07
- 작업 ID: 022
- 리뷰 ID: rftazmwmdgilhtqsqmhtmxidaeroraqs

## 사용자 요청

> 스크린샷 보면 좌측 축제부스맵 좌측 HUD 잘 안되어있는 거 확인할 수 있음. 다시 잘 해줘봐,,

## 변경 사항

- 스크린샷 기준 실제 화면이 `현재 위치` 카드와 `현재 활동 중` 패널을 쓰는 기존 좌측 HUD임을 확인했다.
- 축제부스 맵에 `is-festival-experience` 클래스를 추가했다.
- 축제부스 맵에서는 기존 `world-location-chip`, `festival-experience-passport`, `online`을 강제로 표시하도록 CSS를 추가했다.
- 기존 `display:none!important`에 가려지던 `festival-experience-passport`를 축제부스에서 다시 보이게 했다.
- compact HUD는 축제부스 맵에서 숨겨 중복 표시를 막았다.
- 운영 캐시 ID를 `20260807-festival-left-hud-stack-v206`으로 갱신하고 정적 자산을 동기화했다.

## 변경 파일

- `react-app/src/pages/GamePage.tsx`
- `react-app/src/pages/GamePage.css`
- `react-app/src/runtimeBuild.ts`
- `project/main/src/app/page.home/view.pug`
- `project/main/src/assets/jochwon-app/`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/`

## 검증

- `npm run build` 성공.
- `diff -qr react-app/dist project/main/src/assets/jochwon-app` 차이 없음.
- `diff -qr react-app/dist src/assets/jochwon-app` 차이 없음.
- WIZ `wiz_project_build(clean=false)` 성공.
- 운영 정적 인덱스에서 `20260807-festival-left-hud-stack-v206`과 `assets/index-V6IvqmNF.js` 제공 확인.
- 운영 `GamePage-DFkMADja.js`에서 `is-festival-experience` 포함 확인.
- 운영 `GamePage-DOHXo89c.css`에서 축제부스 전용 `world-location-chip`, `festival-experience-passport`, `online`, `world-compact-hud` 표시/숨김 규칙 확인.
- WIZ build/bundle 산출물도 v206 반영 확인.

## 남은 리스크

- ReviewOps 로그인 세션이 필요한 실제 `/home` 조작 상태에서의 브라우저 수동 재캡처는 수행하지 못했다. 제공 스크린샷의 실제 DOM 구조에 맞춰 기존 HUD 표시 규칙을 보강했고, 운영 번들/CSS 반영은 확인했다.
