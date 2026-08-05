# 세종호수공원 카메라 거리를 기존의 2/3로 축소

- **ID**: 053
- **날짜**: 2026-08-05
- **유형**: UX 개선
- **리뷰 ID**: `ownvgvdltbsvdxbhluqswcyijzuswubt`

## 작업 요약

세종호수공원 카메라와 캐릭터 사이의 실제 거리를 `1300`에서 약 2/3인 `867`로 줄였다. 호수공원은 직교 카메라를 사용해 거리만 바꾸면 화면상 크기가 달라지지 않으므로, 같은 비율로 가까워 보이도록 카메라 확대율도 `1.12`에서 `1.68`로 조정했다. 기존 카메라 각도는 변경하지 않았다.

## 원문 요청사항

```text
세종 호수 공원에서 카메라랑 캐릭터 사이가 너무 먼 느낌이라 현재보다 2/3정도 더 가깝게 해줘. 각도는 동일하되 거리만 더 가깝게
```

## 변경 파일 목록

- `react-app/src/game/cameraFollow.ts`: 예술의전당과 호수공원의 거리 상수를 분리하고 호수공원 거리·확대율 정의
- `react-app/src/game/renderers/VillageMapRenderer.ts`: 호수공원에 거리 `867`과 확대율 `1.68` 적용, 기존 각도 유지
- `react-app/scripts/cameraFollow.test.ts`: 호수공원 2/3 거리와 확대율 회귀 검증 추가
- `src/app/page.home/view.pug`: 운영 iframe 캐시 식별자를 `20260805-lake-camera-closer-v66`으로 갱신
- `src/assets/jochwon-app/index.html`, `src/assets/jochwon-app/assets/index-DKTI6Bep.js`, `src/assets/jochwon-app/assets/GamePage-CNh_fN9n.js`, `src/assets/jochwon-app/assets/GamePage-Cy5Y4Yl2.js`: 새 운영 번들 반영
- `devlog.md`, `devlog/2026-08-05/053-bring-lake-camera-closer.md`: 작업 이력 기록

## 검증 결과

- `npm run test:camera-follow` 성공: 2개 테스트 통과
- `npm run test:lake-portals` 성공: 11개 테스트 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 프로덕션 빌드, 성능 예산 검사, 서버 TypeScript 통과
- WIZ 일반 빌드(`clean: false`) 성공
- React 빌드와 WIZ 정적 엔트리·활성 GamePage 청크 일치 확인
- `git diff --check` 통과

## 남은 리스크

- 실제 운영 화면에서 확대된 호수공원의 시야 범위와 UI 겹침 여부는 자동화된 브라우저 화면 비교로 확인하지 못해 최종 육안 확인이 필요하다.
