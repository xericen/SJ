# 베어트리파크 카메라 체감 거리 2/3 확대

- **ID**: 024
- **날짜**: 2026-08-06
- **유형**: UX·3D 카메라
- **리뷰 ID**: fcxythrwehrrelwteeqgegazjvkxooaz

## 작업 요약

베어트리파크의 직교 카메라와 29도 각도는 유지하면서 카메라 거리를 기존보다 약 2/3 늘렸다. 직교 카메라에서도 캐릭터가 실제로 작게 보이도록 거리 `1000 → 1667`과 줌 `1.46 → 0.876`을 함께 조정했다.

## 원문 요청사항

```text
베어트리파크 너무 카메라랑 캐릭터랑 가까워서 현재 2/3 정도만 멀게 해주라
```

## 변경 파일 목록

- `react-app/src/game/cameraFollow.ts`
  - 베어트리파크 전용 거리 배율 `5/3`, 거리 `1667`, 줌 `0.876` 상수를 추가했다.
- `react-app/src/game/renderers/VillageMapRenderer.ts`
  - 베어트리파크 렌더러가 전용 거리·줌을 사용하도록 변경했다.
- `react-app/scripts/cameraFollow.test.ts`
  - 거리 배율과 직교 카메라 체감 줌을 회귀 테스트로 고정했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`
  - 런타임 빌드 ID를 `20260806-bear-tree-camera-distance-v121`로 갱신했다.
- `src/assets/jochwon-app/`
  - 최신 React 프로덕션 산출물로 동기화했다.

## 확인 결과

- 카메라·월드 이동·베어트리파크·런타임 회귀 테스트 23건 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 성능 예산 통과: 초기 엔트리 246 KiB, 최대 JS gzip 324 KiB, 최대 3D 자산 21.64 MiB
- React `dist`와 WIZ `src/assets/jochwon-app` 전체 파일 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공
- 운영 `/home`, 엔트리 및 GamePage 청크 HTTP 200 확인
- 운영 GamePage 청크와 로컬 빌드 산출물의 SHA-256 일치 확인
- `git diff --check` 통과

## 남은 리스크

- 넓어진 구도에서 기존보다 맵 가장자리와 배경 지면이 더 많이 보일 수 있다.
- 운영 브라우저에서 베어트리파크 전 구간을 이동하며 구도를 확인하는 수동 시각 검증은 수행하지 않았다.
