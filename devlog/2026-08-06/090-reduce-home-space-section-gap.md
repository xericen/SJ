# 홈 공간 섹션 사이의 과도한 세로 여백 축소

- **ID**: 090
- **날짜**: 2026-08-06
- **유형**: 버그 수정
- **리뷰 ID**: nmzgknprmocskmxxhwqmgokmgqtzhxlu

## 작업 요약
홈의 “세종을 경험하는 4개의 공간” 카드 섹션과 전체 공간 보기 화면의 동일 섹션 주변 세로 여백을 줄였다.
기존 해시 번들을 직접 변경하지 않고 전용 오버라이드 스타일을 추가해 런타임 기능과 카드 크기는 유지했다.

## 원문 요청사항
```text
세종을 경험하는 4개의 공간 이랑 세종을 경험하는 4개의 공간 이 부분 사이에 빈 공간이 너무 큰데 이 부분 줄여줘
```

## 변경 파일 목록
- `src/assets/jochwon-app/reviewops-spacing.css`
  - 홈 데스크톱 공간 섹션의 grid gap, 상단 padding, 제목 하단 margin 축소
  - 전체 공간 보기 화면의 제목 상·하단 margin 축소
  - 작은 화면의 공간 섹션 padding과 제목 margin도 완만하게 축소
- `src/assets/jochwon-app/index.html`
  - 전용 여백 보정 스타일시트 링크 및 캐시 구분자 추가
- `devlog.md`
  - 작업 요약 행 추가
- `devlog/2026-08-06/090-reduce-home-space-section-gap.md`
  - 작업 상세 기록 추가

## 확인 결과
- WIZ 일반 빌드(`clean: false`) 성공
- `build/src/assets/jochwon-app/` 및 `bundle/src/assets/jochwon-app/`에 새 스타일 파일과 링크가 포함된 것을 확인
- 기존 런타임 JS/CSS 엔트리 경로가 그대로 유지되는 것을 확인
