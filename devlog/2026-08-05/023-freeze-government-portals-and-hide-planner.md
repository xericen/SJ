# 정부청사 공용 포탈 위치 고정 및 자동 계획 웹 제거

- **ID**: 023
- **날짜**: 2026-08-05
- **유형**: UX 개선
- **리뷰 ID**: udmahscmzrooolotgcxzbhotwnqwcbip

## 원문 요청사항

```text
정부청사 맵에서 내가 현재 정해높은 포탈 위치 그대로 다른 사람들도 접속할 때 그 위치로 뜨게 저장해주고, 위치 옮기는 버튼 없애줘, 그리고 정부청사 들어가면 웹이 뜨는데 이 부분 없애줘
```

## 작업 요약

이미 WIZ 공용 DB에 저장된 정부청사 포탈 5개의 좌표가 모든 접속자에게 주기적으로 동기화되는 기존 경로를 유지하고, 정부청사 맵에서는 권한 사용자에게도 공용 포탈 편집 도구가 나타나지 않도록 고정했다. 정부청사 진입 시 자동으로 열리던 방문 계획 웹과 닫은 뒤 표시되던 다시 열기 버튼도 제거했다.

## 변경 파일 목록

- `react-app/src/pages/GamePage.tsx`: 정부청사 공용 포탈 편집 UI 제외, 자동 방문 계획 웹 및 다시 열기 버튼 제거
- `react-app/src/pages/GamePage.css`: 정부청사 전용 포탈 편집 도구 스타일 제거
- `react-app/index.html`: 운영 캐시 갱신용 빌드 ID 변경
- `src/app/page.home/view.pug`: WIZ iframe 빌드 쿼리 갱신
- `src/assets/jochwon-app/`: 최신 React 프로덕션 빌드 동기화 및 이전 해시 산출물 정리
- `devlog.md`
- `devlog/2026-08-05/023-freeze-government-portals-and-hide-planner.md`

## 검증 결과

- 운영 WIZ 공용 포탈 API에서 정부청사 포탈 5개 좌표 저장 및 비로그인 공용 조회 확인
- `npm run build`: 성공(TypeScript, Vite 프로덕션 빌드, 성능 예산 검사, 서버 TypeScript 검사)
- WIZ 프로젝트 일반 빌드(`clean: false`): 성공
- 생성 번들에서 정부청사 편집 도구 및 방문 계획 웹 렌더링 제거 확인
- React 빌드 결과와 WIZ 정적 자산 일치 확인
- React 원본, 빌드 결과, WIZ 정적 자산, `/home` iframe 빌드 ID 일치 확인
- `git diff --check`: 성공

## 남은 리스크

- 공용 포탈 좌표 API나 데이터베이스 연결이 일시적으로 실패하면 클라이언트는 맵에 정의된 기본 좌표를 먼저 표시할 수 있다. 현재 저장 좌표는 기본 좌표와 일치한다.
