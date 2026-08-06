# 호수공원 기존 지형 맞춤 카메라 복원

- **ID**: 082
- **날짜**: 2026-08-05
- **유형**: UX·3D 카메라
- **리뷰 ID**: uieobisoicxojmbqqtpwasqphrczmjte

## 원문 요청사항

```text
호수 공원은 전으로 돌려주라,, 현재 지형이랑 그 각도가 잘 안 맞는 거 같아
```

## 변경 내용

- 세종호수공원을 예술의전당 공통 카메라 적용 대상에서 제외했다.
- 호수공원은 기존 지형 맞춤 직교 카메라, 거리 1000, 줌 1.46, 기존 캐릭터 표시 크기를 다시 사용한다.
- 전체 걷기 180·달리기 280 속도와 나머지 16개 맵의 예술의전당 기준 카메라는 유지했다.
- 17개 공간 전체 목록과 16개 공통 카메라 적용 목록, 호수공원 단독 예외를 회귀 테스트로 고정했다.
- 런타임 빌드 ID를 `20260805-restore-lake-camera-v95`로 갱신하고 최신 React 산출물을 WIZ 정적 번들에 동기화했다.

## 주요 변경 파일

- `react-app/src/game/worldNavigationProfile.ts`
- `react-app/scripts/worldNavigationConsistency.test.ts`
- `react-app/src/runtimeBuild.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/*`

## 확인 결과

- 탐색 일관성 테스트 2개 통과: 공간 17개, 공통 카메라 16개, 호수공원 예외 확인
- 기존 카메라 테스트 2개 통과: 호수공원 거리 1000·줌 1.46 확인
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 런타임 엔트리 테스트 2개 및 WIZ 일반 빌드 통과
- 운영 v95 인덱스와 신규 GamePage 번들 HTTP 200, 운영 `/home` HTTP 200 확인
- `git diff --check` 통과

## 남은 리스크

- 이미 이전 버전 화면을 열어 둔 사용자는 새로고침해야 복원된 호수공원 구도를 확인할 수 있다.
- 운영 브라우저에서 호수공원 전 구간을 직접 순회하는 수동 시각 검증은 수행하지 않았다.
