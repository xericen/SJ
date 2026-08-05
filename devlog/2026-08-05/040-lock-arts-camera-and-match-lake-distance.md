# 예술의전당 카메라 후진 고정 및 호수공원 추적 거리 통일

- **ID**: 040
- **날짜**: 2026-08-05
- **유형**: UX 개선
- **리뷰 ID**: `ownvgvdltbsvdxbhluqswcyijzuswubt`

## 작업 요약

세종예술의전당 카메라가 캐릭터를 따라 한 번 앞으로 이동한 뒤 다시 뒤쪽으로 복귀하지 않도록, 가장 멀리 진행한 추적 위치를 누적해서 유지하는 단방향 카메라 로직을 적용했다. 세종호수공원의 실제 카메라 오프셋 거리도 세종예술의전당과 동일한 `1300`으로 통일하고, 두 장소가 하나의 공유 상수를 사용하도록 구성했다.

## 원문 요청사항

```text
현재 보이는 화면 (스크린샷) 위치에서 뒤로 이동하지 않게 해줘. 앞으로 캐릭터를 따라서 가는건 좋음. 그리고 세종예술의 전당에서 카메라와 캐릭터의 거리와, 세종호수공원에서 카메라와 캐릭터 거리 동일하게 변경해줘 (세종예술의 전당 거리에 맞추면 될 거 같아.)
```

## 변경 파일 목록

- `react-app/src/game/cameraFollow.ts`: 공용 추적 카메라 거리와 단방향 진행 계산 함수 추가
- `react-app/src/game/renderers/VillageMapRenderer.ts`: 예술의전당 전진 전용 추적 적용, 두 장소의 거리 공유, 직교 카메라의 거리 옵션 반영
- `react-app/scripts/cameraFollow.test.ts`, `react-app/package.json`: 카메라 후진 방지 및 공용 거리 회귀 테스트 추가
- `src/app/page.home/view.pug`: 운영 iframe 캐시 식별자를 `20260805-camera-follow-v60`으로 갱신
- `src/assets/jochwon-app/index.html`, `src/assets/jochwon-app/assets/index-D0KBJgAv.js`, `src/assets/jochwon-app/assets/GamePage-BO_So7ON.js`, `src/assets/jochwon-app/assets/GamePage-BHGMSiAW.js`: 새 React 운영 번들 반영
- `devlog.md`, `devlog/2026-08-05/040-lock-arts-camera-and-match-lake-distance.md`: 작업 이력 기록

## 검증 결과

- `npm run test:camera-follow` 성공: 2개 테스트 통과
- `npm run test:lake-portals` 성공: 11개 테스트 통과
- `npx tsx --test scripts/artsCenterJump.test.ts` 성공: 4개 테스트 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 프로덕션 빌드, 성능 예산 검사, 서버 TypeScript 통과
- WIZ 일반 빌드(`clean: false`) 성공
- `react-app/dist/index.html`과 `src/assets/jochwon-app/index.html` 일치 확인
- `git diff --check` 통과

## 남은 리스크

- 실제 브라우저에서 긴 전진 후 역방향으로 이동하는 체감과 두 장소 간 구도 일치는 자동화된 화면 비교로 확인하지 못했으므로 운영 화면에서 최종 육안 확인이 필요하다.
