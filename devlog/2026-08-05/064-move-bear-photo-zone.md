# 베어트리파크 포토존 위치 편집 및 운영 반영

- **ID**: 064
- **날짜**: 2026-08-05
- **유형**: UX 개선
- **리뷰 ID**: fcxythrwehrrelwteeqgegazjvkxooaz

## 사용자 요청

> 베어트리파크에 있는 포토존 위치도 내가 옮길 수 있게 해줘

## 변경 내용

- 베어트리파크 상단 위치 편집 영역에 `곰 가족 포토존` 버튼을 추가했다.
- 버튼을 누르면 포토존 진입 원이 현재 캐릭터 위치의 지면 높이로 즉시 이동하도록 전용 게임 이벤트와 렌더러 핸들러를 연결했다.
- 이동한 좌표를 브라우저 `localStorage`에 저장하고 베어트리파크 재입장·새로고침 시 복원하도록 변경했다.
- 저장값이 없거나 손상된 경우 기존 기본 좌표를 사용하는 안전한 좌표 저장 모듈과 회귀 테스트를 추가했다.
- 위치 편집 버튼이 4개가 되어도 좁은 화면에서 잘리지 않도록 가로 스크롤과 포토존 전용 색상을 적용했다.
- 런타임 빌드 ID를 `20260805-bear-photo-zone-position-v77`로 갱신하고 React 산출물을 WIZ 정적 번들에 동기화했다.

## 주요 변경 파일

- `react-app/src/pages/GamePage.tsx`
- `react-app/src/pages/GamePage.css`
- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/src/game/bearPhotoZonePosition.ts`
- `react-app/scripts/bearPhotoZone.test.ts`
- `react-app/package.json`
- `react-app/src/runtimeBuild.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/*`

## 확인 결과

- `npm run test:bear-photo-zone` 성공: 좌표 저장·복원, 잘못된 값의 기본 좌표 대체, UI·렌더러 이벤트 연결 3개 통과
- `npm run test:runtime-entry` 성공: 소스/WIZ 빌드 ID 일치 및 엔트리 캐시 무효화 2개 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 성능 예산 통과: 초기 엔트리 286 KiB, 최대 JS gzip 310 KiB, 최대 3D 자산 21.64 MiB
- React `dist`와 WIZ `src/assets/jochwon-app` 전체 파일 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공
- 운영 정적 엔트리와 GamePage 청크 HTTP 200 확인
- 운영 청크에서 포토존 위치 이동 이벤트, 저장 키, 사용자 안내 문구 반영 확인
- `git diff --check` 통과

## 남은 리스크

- 포토존 좌표는 요청자 브라우저의 로컬 저장소에 보관되므로 다른 브라우저나 기기에는 자동 동기화되지 않는다.
- 실제 3D 지형에서 여러 위치로 직접 걸어가며 반복 배치하는 수동 시각 검증은 자동화 환경에서 수행하지 않았다.
