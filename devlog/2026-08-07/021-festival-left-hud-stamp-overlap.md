# 축제부스 좌측 HUD 스탬프 패널 겹침 해소 및 운영 반영

- 날짜: 2026-08-07
- 작업 ID: 021
- 리뷰 ID: rftazmwmdgilhtqsqmhtmxidaeroraqs

## 사용자 요청

> 현재 축제부스맵에서 좌측 HUD를 현재 위치 → 스탬프 3개 완료 패널 → 현재 활동중 순서로 아래에 자연스럽게 이어지게 정리했습니다. 이 위치가 아닌 현재 활동 중에 가려져서 스탬프 3개가 안 보임. 다 잘 연결되어 보이게 수정해줘

## 변경 사항

- 축제부스 맵의 좌측 compact HUD 내부에 스탬프 패널을 직접 렌더링하도록 변경했다.
- 표시 순서를 `현재 위치 → 스탬프 3개 완료 패널 → 현재 활동 중`으로 고정했다.
- `LakeParkExperiences`의 스탬프 진행 상태를 `sejong-festival-stamp-progress-updated` 이벤트로 GamePage HUD에 전달하도록 연결했다.
- 스탬프 패널 CSS를 compact HUD 안의 독립 섹션으로 추가해 현재 활동 중 카드와 겹치지 않게 했다.
- 운영 캐시 ID를 `20260807-festival-left-hud-stamps-v205`로 갱신하고 React 산출물을 WIZ 정적 자산 경로에 동기화했다.

## 변경 파일

- `react-app/src/pages/GamePage.tsx`
- `react-app/src/pages/GamePage.css`
- `react-app/src/components/LakeParkExperiences.tsx`
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
- 운영 정적 인덱스에서 `20260807-festival-left-hud-stamps-v205`와 `assets/index-Ceo4UEFC.js` 제공 확인.
- 운영 `GamePage-BMcjGnKY.js`에 `world-compact-stamps`, `스탬프 3개 완료 패널`, `sejong-festival-stamp-progress-updated` 포함 확인.
- 운영 `GamePage-C-Wm5lHJ.css`에 `world-compact-stamps` 스타일 포함 확인.

## 남은 리스크

- `previewMap=festival-experience`는 게임 HUD가 아닌 맵 미리보기 UI라 실제 좌측 GamePage HUD 화면 캡처 검증 경로로는 사용할 수 없었다. 운영 번들 및 GamePage 청크 내용 기준으로 반영을 확인했다.
