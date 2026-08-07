# 곰체험소 먹이 E 안내 중복 제거 및 HUD 유지

- 날짜: 2026-08-07
- 작업 ID: 023
- 리뷰 ID: rftazmwmdgilhtqsqmhtmxidaeroraqs

## 사용자 요청

> 곰체험소 맵에서 먹이에 가까이 가면 e 표시가 2개가 떠서 헷갈리는데 이 부분 해결해줘, 그리고 먹이갈 때 현재 활동중이랑, 먹이 체험 표시 없애지는데 그 부분은 안 없애도 될 거 같아 수정해줘

## 변경 사항

- 곰체험소 먹이/곰 액션 카드 버튼 문구에서 `E ·` 접두어를 제거했다.
  - 먹이 줍기 카드: `E · 줍기` → `줍기`
  - 곰 급여 카드: `E · 곰에게 먹이 주기` → `곰에게 먹이 주기`
- 키보드 E 동작은 그대로 유지했다.
- 곰체험소 진행 상태 패널(`곰 먹이 체험`)이 먹이 또는 곰 근처에서도 계속 렌더링되도록 조건을 변경했다.
- 곰체험소 맵에 `is-bear-play-zone` 클래스를 추가하고, 먹이 액션 카드가 떠도 `현재 활동 중` 패널과 먹이 체험 상태가 숨겨지지 않도록 CSS를 보강했다.
- 운영 캐시 ID를 `20260807-bear-feed-single-e-hud-v207`로 갱신하고 정적 자산을 동기화했다.

## 변경 파일

- `react-app/src/pages/GamePage.tsx`
- `react-app/src/pages/GamePage.css`
- `react-app/src/components/PersonalFarmProgressExperience.tsx`
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
- 운영 정적 인덱스에서 `20260807-bear-feed-single-e-hud-v207`과 `assets/index-CVsmOUVc.js` 제공 확인.
- 운영 `GamePage-CdOiZnBb.js`에서 `is-bear-play-zone` 포함 확인.
- 운영 `GamePage-BgcTtSOr.css`에서 곰체험소 `online` 및 `personal-farm-reward-status` 유지 규칙 확인.
- 운영 lazy 청크 `GamePage-B2G-4uFv.js`에서 `E · 줍기`, `E · 곰에게 먹이 주기`가 제거되고 `줍기`, `곰에게 먹이 주기`만 남은 것 확인.
- WIZ build/bundle 산출물도 v207 반영 확인.

## 남은 리스크

- 실제 캐릭터를 먹이와 곰 근처로 이동시키는 로그인 세션 기반 수동 조작 검증은 수행하지 못했다. 운영 번들/청크 기준으로 UI 문구와 표시 유지 규칙 반영을 확인했다.
