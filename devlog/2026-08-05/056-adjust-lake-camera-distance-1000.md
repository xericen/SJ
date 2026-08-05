# 세종호수공원 카메라 거리를 1000으로 재조정

- **ID**: 056
- **날짜**: 2026-08-05
- **유형**: UX 개선
- **리뷰 ID**: `ownvgvdltbsvdxbhluqswcyijzuswubt`

## 작업 요약

직전 조정에서 너무 가까웠던 세종호수공원 카메라 거리를 `867`에서 `1000`으로 늘렸다. 직교 카메라의 체감 배율도 거리 변화에 맞춰 `1.68`에서 `1.46`으로 낮췄으며 카메라 각도와 예술의전당 설정은 유지했다.

## 원문 요청사항

```text
조금만 멀어지게 해주라 너무 가깝자 1000정도?
```

## 변경 파일 목록

- `react-app/src/game/cameraFollow.ts`: 호수공원 거리 `1000`, 확대율 `1.46`으로 변경
- `react-app/scripts/cameraFollow.test.ts`: 거리 1000 구도 회귀 검증으로 갱신
- `src/app/page.home/view.pug`: 운영 iframe 캐시 식별자를 `20260805-lake-camera-distance-1000-v70`으로 갱신
- `src/assets/jochwon-app/index.html`, `src/assets/jochwon-app/assets/index-0EshTm-s.js`, `src/assets/jochwon-app/assets/GamePage-Ct-iLN8D.js`, `src/assets/jochwon-app/assets/GamePage-Dmzs0K71.js`: 새 운영 번들 반영
- `devlog.md`, `devlog/2026-08-05/056-adjust-lake-camera-distance-1000.md`: 작업 이력 기록

## 검증 결과

- `npm run test:camera-follow` 성공: 2개 테스트 통과
- `npm run test:lake-portals` 성공: 11개 테스트 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 프로덕션 빌드, 성능 예산 검사, 서버 TypeScript 통과
- WIZ 일반 빌드(`clean: false`) 성공
- React 빌드와 WIZ 정적 엔트리·활성 GamePage 청크 일치 확인
- `git diff --check` 통과

## 남은 리스크

- 거리 `1000`의 최종 체감 구도는 실제 운영 화면에서 육안 확인이 필요하다.
