# 축제 스탬프·현재 활동 패널 동적 연결

- **ID**: 046
- **날짜**: 2026-08-06
- **유형**: 버그 수정

## 작업 요약

현재 활동 중 패널의 고정 상단 좌표를 제거했다. 스탬프 패널의 실제 하단 위치를 `ResizeObserver`와 화면 크기 변경 이벤트로 측정해 CSS 변수로 전달하고, 현재 활동 패널이 그 위치에서 바로 시작하도록 변경했다. 스탬프 문구와 화면 폭이 달라져도 두 패널이 겹치지 않고 자연스럽게 이어진다.

## 원문 요청사항

```text
현재 활동중 버튼이 가려짐 스탬프땜에 둘이 겹쳐지는 게 아니고 자연스럽게 이어지게 해줘
```

## 변경 파일 목록

- `react-app/src/components/LakeParkExperiences.tsx`: 스탬프 실제 하단 측정 및 CSS 변수 동기화
- `react-app/src/pages/GamePage.css`: 현재 활동 패널을 동적 스탬프 하단 위치에 연결
- `react-app/scripts/festivalExperience.test.ts`: 동적 HUD 배치 회귀 테스트 보강
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`: 런타임 빌드 ID 갱신
- `src/assets/jochwon-app/`: 최신 React 빌드 산출물 동기화
- `devlog.md`, `devlog/2026-08-06/046-festival-dynamic-hud-stack.md`: 작업 이력 기록

## 확인 결과

- 축제 경험 단위 테스트 5건 통과
- 런타임 엔트리 테스트 6건 통과
- `npm run build`: TypeScript, Vite, 성능 예산, 서버 TypeScript 빌드 통과
- WIZ `main` 프로젝트 일반 빌드(`clean: false`) 통과
- React `dist`와 `src/assets/jochwon-app` 비교 결과 일치
- 운영 번들에서 동적 스탬프 하단 측정과 현재 활동 패널 위치 변수 반영 확인
