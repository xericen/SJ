# 홈 화면 압축 배치 원복 및 기존 비율 복구

- **ID**: 002
- **날짜**: 2026-08-07
- **유형**: 버그 수정
- **리뷰 ID**: nmzgknprmocskmxxhwqmgokmgqtzhxlu

## 작업 요약
직전 여백 축소 과정에서 변경된 홈 상단 정렬과 압축 비율을 기존 데스크톱 레이아웃 값으로 되돌렸다.
소개 문구와 월드 미리보기의 중앙 정렬, 좌우 비율, 공간 카드 섹션의 기본 간격을 복구하고 전체 공간 보기 화면의 제목 여백도 원래 값으로 복원했다.

## 원문 요청사항
```text
홈페이지 이상해졌는데 다시 전처럼 수정해줘. 비율 맞게,,
```

## 변경 파일 목록
- `react-app/src/pages/LandingPage.css`
  - 홈 레이아웃 중앙 정렬 및 기존 42:58 비율 복구
  - 소개·미리보기·공간 카드 섹션의 기존 padding, gap, margin 복원
  - 전체 공간 보기 제목 여백 원복
- `react-app/src/runtimeBuild.ts`
  - 런타임 빌드 ID를 `20260807-balanced-home-ratio-v192`로 갱신
- `src/app/page.home/view.pug`
  - iframe 빌드 쿼리를 v192로 갱신
- `src/assets/jochwon-app/**`
  - v192 React 프로덕션 산출물 동기화
- `devlog.md`
  - 작업 요약 행 추가
- `devlog/2026-08-07/002-restore-balanced-home-ratio.md`
  - 작업 상세 기록 추가

## 확인 결과
- `npm run build`: 성공
- `npm run test:desktop-page-layout`: 3/3 통과
- `npm run test:runtime-entry`: 6/6 통과
- WIZ 일반 빌드(`clean: false`) 성공
- 운영 URL에서 v192 엔트리와 복구된 CSS가 HTTP 200으로 제공되는 것을 확인

## 남은 리스크
- 리뷰 스크린샷 원본이 없어 픽셀 단위 비교는 수행하지 못했다.
