# 홈 공간 카드 섹션을 상단 소개 영역에 밀착 배치

- **ID**: 092
- **날짜**: 2026-08-06
- **유형**: 버그 수정
- **리뷰 ID**: nmzgknprmocskmxxhwqmgokmgqtzhxlu

## 작업 요약
이전의 소폭 margin 조정만으로는 여백 축소가 충분히 체감되지 않아, 데스크톱 홈 소개 콘텐츠를 아래쪽에 정렬하고 공간 카드 섹션과의 grid 간격을 제거했다.
생성된 정적 번들만 수정하지 않고 React 원본 스타일을 변경해 이후 빌드에도 조정값이 유지되도록 했으며, 전체 공간 보기 화면의 제목 주변 여백도 추가로 축소했다.

## 원문 요청사항
```text
변경 요약

홈과 전체 공간 보기 화면의 “세종을 경험하는 4개의 공간” 주변 세로 여백을 축소했습니다. 너 줄여줘 너무 공간이 크다
```

## 변경 파일 목록
- `react-app/src/pages/LandingPage.css`
  - 홈 소개 영역과 공간 카드 섹션의 grid gap을 0으로 변경
  - 소개 문구와 월드 미리보기를 하단 정렬하여 카드 섹션 위의 빈 공간 제거
  - 공간 섹션 상단 padding 및 제목 하단 margin 축소
  - 전체 공간 보기 제목의 상·하단 margin 추가 축소
- `react-app/src/runtimeBuild.ts`
  - 런타임 빌드 ID를 `20260806-compact-home-space-gap-v187`로 갱신
- `src/app/page.home/view.pug`
  - iframe 빌드 쿼리를 v187로 갱신
- `src/assets/jochwon-app/**`
  - v187 React 프로덕션 산출물 동기화
- `devlog.md`
  - 작업 요약 행 추가
- `devlog/2026-08-06/092-tighten-home-space-section-layout.md`
  - 작업 상세 기록 추가

## 확인 결과
- `npm run build`: 성공
- `npm run test:desktop-page-layout`: 3/3 통과
- `npm run test:runtime-entry`: 6/6 통과
- React `dist`와 WIZ 정적 엔트리·CSS 동기화 확인
- WIZ 일반 빌드(`clean: false`) 성공
- 운영 URL에서 v187 엔트리와 변경 CSS가 HTTP 200으로 제공되는 것을 확인

## 남은 리스크
- 리뷰 스크린샷 원본이 제공되지 않아 정확한 지목 위치는 문구와 현재 DOM 구조를 기준으로 판단했다.
