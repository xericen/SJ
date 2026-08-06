# 런타임 엔트리 SyntaxError 자동 복구

- **ID**: 014
- **날짜**: 2026-08-06
- **유형**: 버그 수정
- **리뷰 ID**: aqfdpmzrjubtgclzlefkcbkbdnvpvuez

## 작업 요약

오류가 보고된 v106 `index-ClCqmKsC.js`는 현재 운영에서 이미 제거되어 요청 시 404를 반환하고, 최신 운영 HTML도 해당 파일을 참조하지 않는 것을 확인했다. 오래 열린 iframe이나 브라우저의 immutable 캐시에 손상된 엔트리가 남아 있을 때 같은 현상이 반복되지 않도록 정적 module script를 오류 감지형 동적 로더로 교체했다. 새 로더는 엔트리의 구문 분석 또는 초기 실행이 실패하면 Cache API와 서비스 워커를 정리하고, 고유 `_entry_retry` 쿼리를 붙여 한 번 자동 재요청한다. 재시도까지 실패한 경우에만 새로고침 안내를 표시한다. 운영 iframe과 엔트리를 v110으로 재발행했다.

## 원문 요청사항

```text
index-ClCqmKsC.js?_build=20260806-boy1-neutral-head-pose-v106:1 Uncaught SyntaxError: Unexpected token ',' (at index-ClCqmKsC.js?_build=20260806-boy1-neutral-head-pose-v106:1:1) 이 부분 헤결해줘
```

## 변경 파일 목록

- `react-app/src/runtimeBuild.ts`: 런타임 빌드 ID를 `20260806-runtime-entry-auto-recovery-v110`으로 갱신
- `react-app/vite.config.ts`: 정적 엔트리를 구문·초기 실행 오류 감지형 동적 import 로더로 변환하고 고유 재시도 쿼리 적용
- `react-app/scripts/runtimeEntry.test.ts`: 생성 로더 구조와 실제 실패 시 캐시 정리·재시도 이동을 검증하는 회귀 테스트 추가
- `src/app/page.home/view.pug`: 세종한바퀴 iframe을 v110으로 갱신
- `src/assets/jochwon-app/index.html`, `src/assets/jochwon-app/assets/index-DGQ8oMHS.js`, `src/assets/jochwon-app/assets/GamePage-Cg-9VDuc.js`, `src/assets/jochwon-app/assets/GamePage-C3Ew5D8c.js`: v110 자동 복구 로더와 운영 실행 청크 반영
- `devlog.md`, `devlog/2026-08-06/014-runtime-entry-syntax-auto-recovery.md`: 작업 이력 기록

## 검증 결과

- `npm run test:runtime-entry` 성공: 빌드 ID·엔트리 연결·자동 복구 구조·실제 실패 재시도, 총 4개 통과
- postMessage 및 세종호수공원 5개 포탈 회귀 테스트 총 13개 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 프로덕션 빌드, 성능 예산 검사, 서버 TypeScript 통과
- WIZ 프로젝트 일반 빌드(`clean: false`) 성공
- 생성된 모든 JavaScript와 인라인 자동 복구 로더 구문 검사 통과
- VM 검사에서 엔트리 SyntaxError 발생 시 캐시 정리 후 `_entry_retry` URL로 이동하는 것을 확인
- 운영 v110 HTML에서 v106 파일 참조가 제거되고 자동 복구 로더가 제공되는 것을 확인
- 운영 엔트리·GamePage·월드 청크 3개가 HTTP 200을 반환하고 로컬 산출물과 SHA-256이 일치함을 확인
- 대상 파일 `git diff --check` 통과

## 남은 리스크

- 보고 당시 브라우저에 저장된 v106 파일 본문은 운영에서 이미 제거되어 첫 글자가 쉼표였던 정확한 생성·캐시 경로는 재현하지 못했다. 이미 열려 있는 v106 문서는 새 로더 자체가 없으므로 한 번 새로고침해야 하며, v110부터 동일한 엔트리 오류는 한 차례 자동 복구된다.
