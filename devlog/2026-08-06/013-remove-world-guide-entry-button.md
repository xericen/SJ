# 공간 안내 17개 월드의 맵 입장 버튼 제거

- **ID**: 013
- **날짜**: 2026-08-06
- **유형**: UX 수정
- **리뷰 ID**: wjsgarhsznylkbbudnfdilmfjoelfoct

## 작업 요약

공간 안내의 17개 월드가 공통으로 사용하는 3D 미리보기 모달에서 `입장하기`·`맵 구경하기` 버튼을 제거했다. 모달 닫기와 `다른 공간 둘러보기` 동선은 유지하고, 더 이상 사용되지 않는 전용 월드 진입 콜백과 스타일도 함께 정리했다.

## 원문 요청사항

```text
공간 안내 들어가면 각 17개에 맵에 입장하기 버튼이 뜨는데 그 버튼 없애줘
```

## 변경 파일 목록

- `react-app/src/pages/LandingPage.tsx`: 월드 미리보기 모달의 입장 버튼과 관련 prop 제거
- `react-app/src/App.tsx`: 공간 안내 전용 월드 진입 콜백·의존성 제거
- `react-app/src/pages/LandingPage.css`: 제거된 입장 버튼 전용 스타일 정리
- `react-app/src/runtimeBuild.ts`: 운영 캐시 식별자를 `20260806-remove-world-guide-entry-v109`로 갱신
- `src/app/page.home/view.pug`: iframe 빌드 쿼리를 v109로 갱신
- `src/assets/jochwon-app/`: 최신 React 프로덕션 번들 동기화 및 이전 해시 산출물 정리
- `devlog.md`, `devlog/2026-08-06/013-remove-world-guide-entry-button.md`: 작업 이력 기록

## 확인 결과

- `GUIDE_WORLD_ORDER`가 17개 월드로 유지되고, 공통 모달 액션 영역에 입장 버튼·입장 핸들러·관련 클래스가 없음을 자동 검사
- `npm run build` 성공: React TypeScript, Vite 프로덕션 번들, 성능 예산, Express TypeScript 통과
- `npm run test:runtime-entry` 성공: 런타임 빌드 ID 및 고유 엔트리 검증 2개 통과
- `react-app/dist/`와 `src/assets/jochwon-app/` 전체 파일·내용 일치 확인
- WIZ 프로젝트 일반 빌드(`clean=false`) 성공
- `git diff --check` 통과

## 남은 리스크

- 이미 공간 안내를 열어 둔 사용자는 새 번들을 받기 위해 페이지 새로고침이 필요할 수 있다.
