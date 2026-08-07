# 마이홈 외부 포탈 3개 제거 및 집 출입 E 안내 단일화

- **ID**: 095
- **날짜**: 2026-08-06
- **유형**: UX 개선
- **리뷰 ID**: eomekrwtkcejfkvaamszzecababygiyc

## 작업 요약

마이홈에 있던 세종호수공원, 베어트리파크, 수목원 이동 포탈을 모두 제거했다. 현관 가까이에서 중복 표시되던 집 출입 안내 중 진행도 UI의 상단 카드를 없애고, 화면 아래쪽의 `E 버튼으로 집 들어가기/나가기` 안내 하나만 유지했다.

## 원문 요청사항

```text
마이홈에 포탈 3개 있는데 없애줘 (베어트리파크, 수목원, 세종호수 공원 가는 포탈), 집들어갈 때 e를 눌러 들어가는 버튼이 2개가 뜨는데 아래 e 버튼 하나로 바꿔줘
```

## 변경 파일 목록

- `react-app/src/game/renderers/VillageMapRenderer.ts`
  - 마이홈의 호수공원 기본 포탈과 베어트리파크·수목원 고정 포탈을 제거했다.
- `react-app/src/components/PersonalFarmProgressExperience.tsx`, `react-app/src/components/PersonalFarmGuide.css`
  - 중복 집 출입 카드와 해당 카드 전용 스타일 조건을 제거했다.
- `react-app/scripts/personalFarmInteractions.test.ts`, `react-app/scripts/personalFarmPortals.test.ts`
  - 포탈 3개 미생성 및 집 출입 하단 안내 단일 표시를 검증하도록 갱신했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`
  - 운영 런타임 빌드 ID를 `20260806-my-home-portal-door-prompt-v190`으로 갱신했다.
- `src/assets/jochwon-app/`
  - 최신 React 프로덕션 산출물을 반영하고 이전 해시 번들을 임시 백업 위치로 이동했다.

## 확인 결과

- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 마이홈 상호작용 회귀 테스트 11개 통과
- 마이홈 포탈 회귀 테스트 3개 통과
- 런타임 엔트리 테스트 6개 통과
- React `dist`와 WIZ `src/assets/jochwon-app` 전체 파일 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공

## 남은 리스크

- 로그인된 운영 브라우저에서 마이홈의 포탈 제거와 현관 안내 단일 표시를 직접 확인하지는 못했다.
