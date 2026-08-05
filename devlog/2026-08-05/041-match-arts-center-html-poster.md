# 예술의전당 클릭 전후 동일한 HTML 포스터 적용

- **ID**: 041
- **날짜**: 2026-08-05
- **유형**: UX 수정
- **리뷰 ID**: ucpgkvwdbljhhijvtebeixepohjidmjy

## 작업 요약

직전 작업에서 클릭 후 HTML 포스터를 제거한 방향을 사용자 의도에 맞게 바로잡았다. 클릭 전 3D 포스터에 실제로 표시되는 720×1080 캔버스를 PNG 스냅샷으로 전달하고, 클릭 후에는 그 동일한 픽셀 소스를 HTML `<article>` 안에 표시한다. 영상 선택과 관심 저장 버튼은 포스터 캔버스와 같은 위치·문구·스타일로 그린 뒤 HTML 클릭 요소를 정확히 겹쳐, 클릭 전후 포스터 외형은 같으면서 클릭 후에만 상호작용할 수 있도록 구성했다. 별도 상세 웹 화면과 iframe은 사용하지 않는다.

## 원문 요청사항

```text
아니지 html 포스터로 나오게 해줘야지,,,,,다만 내가 말하는 거는 클릭했을 때 포스터와 클릭하지 않고 밖에서 봤을 때의 포스터가 동일하게 생겨야한다는 거야.
```

## 변경 파일 목록

- `react-app/src/game/renderers/VillageMapRenderer.ts`: 3D 포스터 캔버스에 동일한 영상/관심 버튼을 그리며, 선택된 캔버스 PNG를 포커스 이벤트로 전달
- `react-app/src/components/ArtsCenterPosterKiosk.tsx`: 투영된 포스터 위치에 동일 스냅샷 기반 HTML 포스터와 실제 클릭 버튼을 표시
- `react-app/src/components/ArtsCenterPosterKiosk.css`: 포스터 투영 크기와 버튼 비율을 일치시키는 HTML 오버레이 스타일 적용
- `react-app/src/game/artsCenterPerformances.ts`: 더 이상 사용하지 않는 외부 포스터 이미지 URL 생성 로직 제거
- `react-app/scripts/artsCenterPoster.test.ts`: 3D 캔버스와 HTML 포스터가 같은 스냅샷을 공유하는 회귀 테스트로 수정
- `react-app/index.html`, `src/app/page.home/view.pug`: 운영 캐시 식별자를 v61로 통일
- `src/assets/jochwon-app/index.html`, `src/assets/jochwon-app/assets/GamePage-BYZWeB9B.js`, `src/assets/jochwon-app/assets/GamePage-lp93Inxj.js`, `src/assets/jochwon-app/assets/GamePage-Ddzpo0rF.css`: 새 운영 HTML 포스터 번들 반영
- `devlog.md`, `devlog/2026-08-05/041-match-arts-center-html-poster.md`: 작업 이력 기록

## 검증 결과

- `npx tsx --test scripts/artsCenterPoster.test.ts scripts/artsCenterJump.test.ts scripts/cameraFollow.test.ts` 성공: HTML 포스터 동일성, 기존 공연/점프, 최신 카메라 회귀 테스트 총 8개 통과
- `npm run test:lake-portals` 성공: 최신 포탈 연속 체류 회귀 테스트 총 11개 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 프로덕션 빌드, 성능 예산 검사, 서버 TypeScript 통과
- WIZ 프로젝트 일반 빌드(`clean: false`) 성공
- `react-app/dist/index.html`과 WIZ 정적 산출물의 엔트리 일치, v61 캐시 식별자 통일 확인
- 운영 v61 HTML 및 두 GamePage 청크에서 HTML 포스터 클래스, `오브젝트 인터랙션`, 공용 `posterDataUrl`, `영상 선택`, `관심 있어요` 반영 확인
- 대상 파일 `git diff --check` 통과

## 남은 리스크

- 실제 브라우저에서 투영된 3D 포스터와 HTML 포스터가 전환되는 순간을 픽셀 단위 스크린샷 비교하는 E2E는 현재 환경에서 수행하지 못했다. 동일 캔버스 데이터 URL 공유 계약, 투영 좌표 사용, 운영 번들 반영을 자동 검증했다.
