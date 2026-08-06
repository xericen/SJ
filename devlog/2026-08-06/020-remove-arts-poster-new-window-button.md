# 예술의전당 5개 포스터 상세 화면 새 창 버튼 제거

- **ID**: 020
- **날짜**: 2026-08-06
- **유형**: UX 개선
- **리뷰 ID**: `ucpgkvwdbljhhijvtebeixepohjidmjy`

## 작업 요약

예술의전당의 5개 공연 포스터가 공통으로 사용하는 `자세히 보기` 화면에서 외부 페이지로 이동하는 `새 창` 버튼을 제거했다. 포스터로 돌아가기와 상세 화면 닫기는 유지하고, 남은 헤더 요소가 자연스럽게 배치되도록 열 구성을 정리했다.

## 원문 요청사항

```text
자세히 보기 버튼 누르고, 들어가면 새창 버튼이 있는데 5개 포스터 모드 새창 버튼 없애줘
```

## 변경 파일 목록

- `react-app/src/components/ArtsCenterPosterKiosk.tsx`: 상세 화면의 `새 창` 링크와 불필요한 아이콘 import 제거
- `react-app/src/components/ArtsCenterPosterKiosk.css`: 링크 제거 후 상세 헤더를 3열로 정렬
- `react-app/scripts/artsCenterPoster.test.ts`: `새 창` 문구와 `_blank` 링크가 재등장하지 않는 회귀 검증 추가
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`: 운영 캐시 식별자를 `20260806-remove-arts-detail-new-window-v117`로 갱신
- `src/assets/jochwon-app/`: 최신 React 프로덕션 빌드 산출물 동기화
- `devlog.md`, `devlog/2026-08-06/020-remove-arts-poster-new-window-button.md`: 작업 이력 기록

## 검증 결과

- `npm run build` 성공: TypeScript, Vite 프로덕션 빌드, 성능 예산 검사, 서버 TypeScript 통과
- 빌드 후 `npx tsx --test scripts/artsCenterPoster.test.ts scripts/runtimeWarnings.test.ts scripts/runtimeEntry.test.ts` 성공: 12개 테스트 통과
- `react-app/dist/`와 `src/assets/jochwon-app/` 파일·내용 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공
- 신규 산출물에서 `새 창` 문구와 `target="_blank"` 링크가 없는 것을 확인
- `git diff --check` 통과

## 남은 리스크

- 실제 사용자 세션에서 5개 포스터를 각각 열어 상세 헤더를 확인하는 브라우저 자동 E2E는 현재 환경에서 실행하지 못했다.
