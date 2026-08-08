# 프로젝트실 전체 필터 왼쪽 시작 정렬

## 사용자 원본 요청

> 가운데에 위치한 ‘전체’ 버튼을 왼쪽부터 시작하게 해달라.

## 변경 파일

- `src/assets/jochwon-app/index.html`: 프로젝트실 공개 보드 필터 네비게이션에 왼쪽 정렬 규칙 추가
- `devlog.md`
- `devlog/2026-08-08/024-project-room-filter-left-align.md`

## 확인 결과

- WIZ `main` 프로젝트 연결 상태 확인
- WIZ 빌드 성공: `Project 'main' build completed.`
- `.project-room-tools nav`에 `justify-content: flex-start`가 적용되도록 확인

## 남은 리스크

- 브라우저 캐시가 기존 HTML을 유지할 수 있으므로 웹 확인 시 강력 새로고침이 필요할 수 있습니다.
