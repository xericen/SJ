# 베어트리파크 호수공원형 저각도 카메라 적용

- **ID**: 002
- **날짜**: 2026-08-06
- **유형**: UX·3D 카메라
- **리뷰 ID**: fcxythrwehrrelwteeqgegazjvkxooaz

## 작업 요약

베어트리파크 카메라를 세종호수공원과 같은 직교 구도·거리·줌으로 변경했다. 위에서 내려다보는 느낌을 줄이기 위해 호수공원 33도보다 조금 낮은 29도 고도각을 적용하고, 예술의전당 공통 원근 카메라 덮어쓰기 대상에서 베어트리파크를 제외했다.

## 원문 요청사항

```text
베어트리 파크 카메라 각도를 세종호수 공원이랑 동일하게 바꿔줘 근데 세종호수 공원이랑 동일하게 각도를 조금만 아래로 내려주라 너무 위에서 찍은듯한 느낌이야
```

## 변경 파일 목록

- `react-app/src/game/cameraFollow.ts`
  - 호수공원 33도와 베어트리파크 29도 카메라 고도 상수를 추가했다.
- `react-app/src/game/renderers/VillageMapRenderer.ts`
  - 베어트리파크에 호수공원과 같은 직교 카메라, 거리 1000, 줌 1.46을 적용하고 고도만 29도로 낮췄다.
- `react-app/src/game/worldNavigationProfile.ts`
  - 베어트리파크를 지형 맞춤 카메라 맵으로 분류해 공통 원근 카메라 덮어쓰기를 해제했다.
- `react-app/scripts/cameraFollow.test.ts`, `react-app/scripts/worldNavigationConsistency.test.ts`
  - 호수공원형 카메라 수치와 베어트리파크 예외 적용을 회귀 테스트로 고정했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`
  - 런타임 빌드 ID를 `20260806-bear-tree-lower-camera-v98`로 갱신했다.
- `src/assets/jochwon-app/`
  - 최신 React 프로덕션 산출물로 동기화했다.

## 확인 결과

- 카메라·월드 이동·베어트리파크 회귀 및 런타임 테스트 17건 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 성능 예산 통과: 초기 엔트리 286 KiB, 최대 JS gzip 310 KiB, 최대 3D 자산 21.64 MiB
- React `dist`와 WIZ `src/assets/jochwon-app` 전체 파일 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공
- 운영 `/home`, 엔트리 및 GamePage 청크 HTTP 200 확인
- 운영 GamePage 청크에서 베어트리파크 직교 카메라와 29도 고도 설정 반영 확인
- `git diff --check` 통과

## 남은 리스크

- 이미 이전 버전을 연 탭은 새로고침해야 변경된 카메라를 확인할 수 있다.
- 실제 운영 브라우저에서 베어트리파크 전 구간을 이동하며 나무·지형 가림과 구도를 확인하는 수동 시각 검증은 수행하지 않았다.
