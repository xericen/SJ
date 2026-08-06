# 먹거리부스 호수공원 귀환 스폰을 안전 지면으로 이동

## 사용자 원문 요청

> 6. 먹거리부스에서 호수공원 돌아올때 스폰 포인트 수정(현재 노란 건물 위여서 낑김)

## 변경 내용

- 먹거리부스에서 호수공원으로 귀환할 때 포탈 중심 방향으로 자동 산정되던 도착 경로를 남동쪽 전용 경로로 변경했다.
- 포탈 `(491, 1556)`에서 남동쪽으로 220 떨어진 `(647, 1712)` 부근 평탄 지면에 도착하도록 설정했다.
- 도착점이 포탈 활성 반경 140 밖에 위치하면서 캐릭터 발밑과 네 방향 이동 경로가 안전한지 회귀 테스트를 추가했다.
- 런타임 빌드 ID를 `20260806-food-return-safe-spawn-v119`로 갱신하고 WIZ 정적 자산을 다시 빌드했다.

## 변경 파일

- `react-app/src/game/lakeParkPortals.ts`
- `react-app/scripts/lakePortals.test.ts`
- `react-app/src/runtimeBuild.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/*` (프로덕션 빌드 산출물)
- `devlog.md`
- `devlog/2026-08-06/022-food-return-safe-spawn.md`

## 확인 결과

- 호수공원 GLB 지형 검사: 기존 도착점 높이 `187.1`, 새 도착점 및 발밑 높이 `78.3~79.3`의 동일 평탄 지면 확인
- 새 도착점 동·서·남·북 60 범위에 이동 가능한 지면 확인
- `npm run test:lake-portals`: 12/12 통과
- `npm run test:runtime-entry`: 5/5 통과
- `npm run test:postmessage`: 2/2 통과
- `npm run test:festival-portal`: 4/4 통과
- `foodExperience.test.ts`: 6/6 통과
- `npm run build`: 성공
- WIZ `main` 프로젝트 빌드: 성공
- 운영 v119 HTML과 엔트리 자산 HTTP 200 확인

## 남은 리스크

- 자동 검증은 실제 호수공원 GLB 지형을 기준으로 수행했으며, 브라우저에서 수동으로 캐릭터를 조작하는 시각 확인은 현재 환경에서 수행하지 못했다.
