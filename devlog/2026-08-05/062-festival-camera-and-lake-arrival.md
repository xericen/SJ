# 축제부스 카메라 거리 축소 및 호수공원 귀환 도착점 보정

- **ID**: 062
- **날짜**: 2026-08-05
- **유형**: UX 개선 · 버그 수정
- **리뷰 ID**: `ypugnklkjffnuydcoyjchgxvzcwvrovr`

## 작업 요약

축제부스 맵의 원근 카메라 거리를 `1700`에서 `1020`으로 40% 줄여 캐릭터가 더 가깝게 보이도록 조정했다. 축제부스에서 세종호수공원으로 돌아올 때는 호수공원 축제 포탈의 월드 중심 쪽 뒤편 대신 포탈 앞쪽 방향으로 220만큼 떨어진 `(1219, 1682)`에 도착하도록 변경했다. 새 도착점은 포탈 활성 반경 140 밖에 있어 주변 구조물에 끼거나 즉시 축제부스로 재진입하는 현상을 방지한다.

## 원문 요청사항

```text
축제 부스맵에 들어가면 카메라와 캐릭터 거리가 너무 먼 거 같은데 가깝게 해줘 현재보다 2/5정도 더 가깝게. 그리고 다시 세종호수 공원으로 돌아가기 해서 포탈을 통해서 세종호수 공원으로 넘어가면, 세종호수 공원에 있는 공간에 껴서 다시 축제부스 맵으로 돌아오는 현상이 있는데 이 부분 해결해줘 캐릭터를 포탈 뒤쪽이 아닌 앞쪽으로 나올 수 있게 변경해야할 거 같아
```

## 변경 파일 목록

- `react-app/src/game/renderers/VillageMapRenderer.ts`: 축제부스 카메라 거리 `1020` 적용 및 포탈별 도착 방향·안전거리 계산 지원
- `react-app/src/game/lakeParkPortals.ts`: 호수공원 축제 포탈의 앞쪽 도착 방향과 안전거리 220 지정
- `react-app/scripts/festivalPortal.test.ts`: 카메라 거리, 앞쪽 도착점 `(1219, 1682)`, 포탈 반경 이탈 회귀 검증 추가
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`: 운영 캐시 식별자를 `20260805-festival-camera-arrival-v75`로 갱신
- `src/assets/jochwon-app/`: 최신 React 프로덕션 번들 동기화
- `devlog.md`, `devlog/2026-08-05/062-festival-camera-and-lake-arrival.md`: 작업 이력 기록

## 검증 결과

- 축제부스·호수공원 포탈·먹거리·카메라 회귀 테스트 22개 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 프로덕션 빌드, 성능 예산 검사, 서버 TypeScript 통과
- `react-app/dist/`와 `src/assets/jochwon-app/` 파일·내용 일치 확인
- WIZ 프로젝트 일반 빌드(`clean: false`) 성공
- 운영 정적 엔트리에서 v75 빌드 ID와 `index-BgCtF2g8.js` 실행 경로 확인
- `git diff --check` 통과

## 남은 리스크

- 실제 로그인 브라우저에서 축제부스 귀환 포탈을 통과하는 WebGL 화면 단위 E2E는 현재 환경에서 자동 실행하지 못했다. 도착 방향·좌표·활성 반경 상태는 회귀 테스트와 운영 번들로 확인했다.
