# 프로젝트실 전광판 보드 면 투영 및 공연형 확대 화면 수정

## 사용자 요청

```text
ㄴㄴ 전광판 다시 해줘, 현재 이상함. 저 보드판 위를 html로 잘 보여야하고 확대했을 때 크기 맞게 잘 보여야함. 세종예술의 전당에 있는 연극 보는 거 처럼 해주면 됨
```

## 변경 내용

- 3D 전광판 모델은 회전시키지 않고 `Lobby_AI_Board_Surface`의 실제 4.90×3.18 비율을 HTML 렌더링 좌표계에 반영했다.
- 일반 시점에서는 렌더러가 전달하는 보드 네 모서리에 HTML을 `matrix3d`로 투영해, 카메라 각도가 바뀌어도 보드 면과 함께 맞물리도록 수정했다.
- 확대 시에는 세종예술의전당 무대 영상과 같은 어두운 관람 배경과 중앙 화면을 적용하고, 1.541:1 비율을 유지한 채 92vw/92vh 안에서 최대 크기로 표시하도록 수정했다.
- 전광판 투영·확대 회귀 테스트와 런타임 캐시 빌드 ID를 갱신하고, React 빌드 결과를 WIZ 정적 자산에 동기화했다.

## 변경 파일

- `react-app/src/components/ProjectLobbyBoard.tsx`
- `react-app/src/components/ProjectLobbyBoardZoom.css`
- `react-app/scripts/campusPortals.test.ts`
- `react-app/src/runtimeBuild.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/` (프로덕션 빌드 산출물)
- `devlog.md`
- `devlog/2026-08-06/075-fix-project-board-surface-and-zoom.md`

## 확인 결과

- `npx tsx --test scripts/campusPortals.test.ts`: 10개 테스트 통과
- `npm run build`: TypeScript, Vite 프로덕션 빌드, 성능 예산, 서버 TypeScript 검사 통과
- `npm run test:runtime-entry`: 6개 테스트 통과
- `diff -qr react-app/dist src/assets/jochwon-app`: 차이 없음
- `git diff --check`: 통과
- WIZ `main` 일반 빌드(`clean=false`): 성공

## 남은 리스크

- 실제 운영 카메라와 화면 비율 조합에 따른 최종 체감 크기는 배포 화면에서 한 번 더 확인할 필요가 있다.
