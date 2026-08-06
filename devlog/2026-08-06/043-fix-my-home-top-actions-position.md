# 마이홈 정원 현황·이동 버튼 상단 위치 정렬

- **ID**: 043
- **날짜**: 2026-08-06
- **유형**: UX 개선
- **리뷰 ID**: eomekrwtkcejfkvaamszzecababygiyc

## 작업 요약

첨부 이미지에서 마이홈의 `맵 이동`, `나가기` 버튼이 정원 현황과 높이가 어긋나고 서로 겹쳐 보이던 문제를 수정했다. 버튼 그룹을 화면 기준 고정 위치의 2열 영역으로 만들고, 정원 현황 오른쪽 여백을 버튼 그룹 폭과 간격에 맞춰 한 줄로 정렬했다.

## 원문 요청사항

```text
이고 공영파일 마이홈 버튼 이상한데 수정해줘 위치
```

## 변경 파일 목록

- `react-app/src/pages/GamePage.css`
  - 마이홈 상단 버튼 그룹을 뷰포트 기준 고정 위치로 변경하고 폭·열·버튼 줄바꿈을 고정했다.
- `react-app/src/components/PersonalFarmProgressExperience.css`
  - 정원 현황의 오른쪽 여백과 최대 폭을 버튼 그룹에 맞춰 조정했다.
- `react-app/scripts/personalFarmInteractions.test.ts`, `react-app/scripts/personalFarmPortals.test.ts`
  - 상단 요소의 고정 위치와 비겹침 간격을 검증하도록 회귀 테스트를 갱신했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`
  - 운영 런타임 빌드 ID를 `20260806-my-home-top-actions-v139`로 갱신했다.
- `src/assets/jochwon-app/`
  - 최신 React 프로덕션 산출물을 반영하고 이전 해시 번들을 별도 임시 백업 위치로 이동했다.

## 확인 결과

- 첨부 이미지의 위치 이상 원인이 서로 다른 배치 기준과 유동 버튼 폭에 있음을 확인했다.
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 마이홈 상호작용 회귀 테스트 9개 통과
- 마이홈 포탈·상단 배치 회귀 테스트 3개 통과
- 런타임 엔트리 테스트 6개 통과
- React `dist`와 WIZ `src/assets/jochwon-app` 전체 파일 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공

## 남은 리스크

- 로그인된 운영 브라우저에서 실제 마이홈 화면의 최종 시각 배치를 직접 확인하지는 못했다.
