# 축제부스 왼쪽 HUD 세로 배치 복원

- **ID**: 027
- **날짜**: 2026-08-06
- **유형**: 버그 수정

## 작업 요약

이전 요청의 의도를 중앙 통합으로 잘못 해석한 배치를 바로잡았다. 축제부스 화면 왼쪽에 기존 디자인과 동일한 흐름으로 현재 위치, 스탬프 미션, 현재 활동 중 패널을 순서대로 연결하고 활동 목록을 다시 노출했다. 모바일 화면에서도 세 패널이 겹치지 않도록 위치와 스크롤 높이를 조정했다.

## 원문 요청사항

```text
그리고 스탬프 찍는 거가 현재 활동중에 가려져서 안 보이니까 현재 활동중이랑 현재 위치 중앙에 합쳐서 스템프 잘 보이게 변경해줘 이거 왼쪽에 현재 위치랑 그 아래 스템프, 그 아래 현재 활동중 이렇게 원래 만들어져있는 디자인으로 만들어달라는 거였음
```

## 변경 파일 목록

- `react-app/src/pages/GamePage.tsx`: 중앙 요약 HUD와 축제 활동 패널 숨김 처리 제거
- `react-app/src/pages/GamePage.css`: 현재 위치·스탬프·현재 활동 중 왼쪽 세로 스택 및 모바일 배치 적용
- `react-app/src/components/LakeParkExperiences.css`: 스탬프 패널을 현재 위치 아래에 맞춘 연결형 디자인으로 조정
- `react-app/scripts/festivalExperience.test.ts`: 왼쪽 HUD 순서 및 활동 패널 노출 회귀 테스트 보강
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`: 런타임 빌드 ID 갱신
- `src/assets/jochwon-app/`: 최신 React 빌드 산출물 동기화
- `devlog.md`, `devlog/2026-08-06/027-festival-left-hud-stack.md`: 작업 이력 기록

## 확인 결과

- 축제 경험 단위 테스트 5건 통과
- 런타임 엔트리 테스트 6건 통과
- `npm run build`: TypeScript, Vite, 성능 예산, 서버 TypeScript 빌드 통과
- WIZ `main` 프로젝트 일반 빌드(`clean: false`) 통과
- React `dist`와 `src/assets/jochwon-app` 비교 결과 일치
- 운영 CSS에서 현재 위치·스탬프·현재 활동 중 왼쪽 세로 배치 확인
- 전체 이동 회귀 테스트의 별도 마이홈 카메라 기대값 불일치 1건은 이번 HUD 변경과 무관함을 확인
