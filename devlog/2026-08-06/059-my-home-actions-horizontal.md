# 마이홈 맵 이동·나가기 버튼 우측 상단 가로 정렬

- **ID**: 059
- **날짜**: 2026-08-06
- **유형**: UX 개선
- **리뷰 ID**: eomekrwtkcejfkvaamszzecababygiyc

## 작업 요약

마이홈의 `맵 이동`, `나가기` 버튼이 겹치지 않도록 우측 상단 고정 가로 플렉스 그룹으로 변경했다. 각 버튼의 폭과 축소 방지 값을 명시해 화면 크기나 공통 스타일의 영향을 받아도 항상 나란히 유지되도록 했다.

## 원문 요청사항

```text
맵이동이랑 나가기 버튼 다시 나란히 있게 해줘 우측 상단에 지금 겹쳐져있음.
```

## 변경 파일 목록

- `react-app/src/pages/GamePage.css`
  - 버튼 그룹을 우측 상단 고정 가로 플렉스 레이아웃으로 변경했다.
  - 두 버튼의 폭, 축소 방지, 위치 및 줄바꿈 방지 값을 명시했다.
- `react-app/scripts/personalFarmInteractions.test.ts`, `react-app/scripts/personalFarmPortals.test.ts`
  - 버튼 가로 배치와 최신 포탈 편집 제외 조건을 검증하도록 갱신했다.
- `react-app/scripts/runtimeEntry.test.ts`
  - 임의 Vite 해시 안의 `v숫자` 조합을 버전 파일명으로 잘못 판단하지 않도록 검증식을 보정했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`
  - 운영 런타임 빌드 ID를 `20260806-my-home-actions-row-v158`로 갱신했다.
- `src/assets/jochwon-app/`
  - 최신 React 프로덕션 산출물을 반영하고 이전 해시 번들을 임시 백업 위치로 이동했다.

## 확인 결과

- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 마이홈 상호작용 회귀 테스트 10개 통과
- 마이홈 포탈 회귀 테스트 3개 통과
- 런타임 엔트리 테스트 6개 통과
- React `dist`와 WIZ `src/assets/jochwon-app` 전체 파일 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공

## 남은 리스크

- 로그인된 운영 브라우저에서 실제 마이홈 상단의 최종 배치를 직접 확인하지는 못했다.
