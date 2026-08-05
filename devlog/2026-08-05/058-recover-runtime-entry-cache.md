# 런타임 엔트리 ReferenceError 캐시 복구

- **ID**: 058
- **날짜**: 2026-08-05
- **유형**: 버그 수정
- **리뷰 ID**: aqfdpmzrjubtgclzlefkcbkbdnvpvuez

## 작업 요약

콘솔에 보고된 `index-CzROTvJS.js`를 운영 서버·로컬 산출물과 대조한 결과 현재 파일은 동일한 SHA-256의 정상 Vite 모듈이었고, 구문 검사와 자유 변수 검사에서도 정의되지 않은 `n`이 발견되지 않았다. 동일 파일 경로에 과거 응답이 `immutable` 캐시로 남은 상황에서도 재사용되지 않도록 런타임 빌드 ID를 단일 상수로 관리하고, 메인 엔트리 내용에 빌드 ID를 포함해 파일 해시를 변경했다. 생성 HTML의 엔트리 URL에도 같은 `_build` 쿼리를 붙여 파일명과 쿼리를 함께 갱신하도록 보강했다. 운영 iframe을 v72로 올려 새 `index-BXoqgrka.js`를 사용하도록 재배포했다.

## 원문 요청사항

```text
Uncaught ReferenceError: n is not defined
    at index-CzROTvJS.js:1:1 수정ㅎ줘
```

## 변경 파일 목록

- `react-app/src/runtimeBuild.ts`: v72 런타임 빌드 ID 단일 상수 추가
- `react-app/src/main.tsx`: 실행 문서에 런타임 빌드 ID를 기록해 엔트리 내용 해시 갱신 보장
- `react-app/vite.config.ts`: 생성 엔트리 URL에 동일한 `_build` 쿼리를 자동 부여하는 HTML 변환 추가
- `react-app/tsconfig.node.json`: Vite 설정에서 공유 빌드 ID 파일을 검사하도록 범위 확장
- `react-app/index.html`: 빌드 시 단일 ID로 치환되는 플레이스홀더 적용
- `react-app/scripts/runtimeEntry.test.ts`, `react-app/package.json`: 소스·WIZ·생성 HTML의 빌드 ID 및 이중 캐시 무효화 회귀 테스트 추가
- `src/app/page.home/view.pug`: 세종한바퀴 iframe을 `20260805-runtime-entry-recovery-v72`로 갱신
- `src/assets/jochwon-app/index.html`, `src/assets/jochwon-app/assets/index-BXoqgrka.js`, `src/assets/jochwon-app/assets/GamePage-B86KsK49.js`, `src/assets/jochwon-app/assets/GamePage-BAGhJ-qv.js`: v72 운영 엔트리와 연결 청크 반영
- `devlog.md`, `devlog/2026-08-05/058-recover-runtime-entry-cache.md`: 작업 이력 기록

## 검증 결과

- `npm run test:runtime-entry` 성공: 단일 빌드 ID와 엔트리 파일명·쿼리 이중 갱신, 총 2개 통과
- 포탈·postMessage·축제 귀환 포탈 회귀 테스트 총 16개 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 프로덕션 빌드, 성능 예산 검사, 서버 TypeScript 통과
- WIZ 프로젝트 일반 빌드(`clean: false`) 성공
- 생성된 모든 JavaScript와 재포맷한 새 엔트리의 `node --check` 통과
- 새 `index-BXoqgrka.js` 정적 검사에서 `Cannot find name 'n'` 진단이 없음을 확인
- 운영 HTML에서 오류 파일 `index-CzROTvJS.js` 참조가 제거되고, 새 엔트리에 v72 쿼리가 함께 연결된 것을 확인
- 운영 엔트리·GamePage·월드 청크 3개가 HTTP 200을 반환하고 로컬 산출물과 SHA-256이 일치함을 확인
- 대상 파일 `git diff --check` 통과

## 남은 리스크

- 보고 당시 브라우저의 캐시 저장 내용을 직접 추출할 수 없어 과거 응답 내부의 정확한 `n` 참조 위치는 재현하지 못했다. 새 배포는 파일 해시와 요청 쿼리를 모두 변경하므로 기존 `index-CzROTvJS.js` 캐시를 사용하지 않으며, 이미 열려 있던 탭은 한 번 새로고침해야 v72 문서를 로드한다.
