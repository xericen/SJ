# 예술의전당 공연 상세 원본 읽기 화면 정돈

- **ID**: 045
- **날짜**: 2026-08-06
- **유형**: 버그 수정 · UX 개선
- **리뷰 ID**: `ucpgkvwdbljhhijvtebeixepohjidmjy`

## 작업 요약

예술의전당 5개 포스터의 `자세히 보기`가 Jina 원문 수집 메타데이터와 Markdown 문법을 그대로 표시하던 문제를 수정했다. WIZ에서 스크립트를 제거한 원본 HTML을 우선 사용하며, 원본 접근 실패 시에는 포스터·공연 정보·상세 이미지만 공연 전용 카드형 HTML로 변환해 표시한다.

## 원문 요청사항

```text
포스터 보면 현재 원본 웹 읽기 화면
https://www.sjac.or.kr/base/nrr/performance/read?menuLevel=2&menuNo=76&performanceNo=650
Title: 세종예술의전당

URL Source: http://www.sjac.or.kr/base/nrr/performance/read?menuLevel=2&menuNo=76&performanceNo=650

Markdown Content:

바로가기 메뉴[본문내용 바로가기](http://www.sjac.or.kr/base/nrr/performance/read?menuLevel=2&menuNo=76&performanceNo=650#cont-sbj)[메인메뉴 바로가기](http://www.sjac.or.kr/base/nrr/performance/read?menuLevel=2&menuNo=76&performanceNo=650#gnb)

프로그램
[모두보기 닫기](http://www.sjac.or.kr/base/nrr/performance/read?menuLevel=2&menuNo=76&performanceNo=650#) 이런 식으로 나오는데 이거 수정해줘 이렇게 나오면 안됨..
```

## 변경 파일 목록

- `react-app/src/services/foodSourcePreview.ts`: 공연 원본 HTML 우선 호출, 수집 메타데이터 제거, Markdown 정돈 및 공연 전용 HTML 렌더러 추가
- `react-app/scripts/artsCenterPoster.test.ts`: 문제의 원문 형식 제거와 WIZ 우선·정돈 폴백 회귀 테스트 추가
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`: 운영 캐시 식별자를 `20260806-clean-arts-performance-reader-v140`으로 갱신
- `src/assets/jochwon-app/`: 최신 React 프로덕션 빌드 산출물 동기화
- `devlog.md`, `devlog/2026-08-06/045-clean-arts-performance-reader.md`: 작업 이력 기록

## 검증 결과

- 공연 상세·먹거리 원본·런타임 경고 테스트 15개 통과
- `npm run build` 성공: TypeScript, Vite 프로덕션 빌드, 성능 예산 검사, 서버 TypeScript 통과
- 빌드 후 런타임 엔트리·공연 상세 테스트 13개 통과
- 실제 5개 공연의 Jina 응답을 변환해 `Title`, `URL Source`, `Markdown Content`, 바로가기 메뉴가 결과 HTML에 남지 않는 것 확인
- `react-app/dist/`와 `src/assets/jochwon-app/` 파일·내용 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공
- 운영 v140 HTML, 엔트리 및 공연 상세 번들 HTTP 200 확인
- `git diff --check` 통과

## 남은 리스크

- 세종예술의전당 원본 서버의 SSL 또는 접근 정책이 정상화되기 전에는 WIZ 원본 HTML 대신 정돈된 읽기 전용 폴백이 표시된다.
- 실제 사용자 세션에서 5개 포스터를 각각 열고 스크롤하는 브라우저 자동 E2E는 현재 환경에서 실행하지 못했다.
