# 운영 번들 구문 오류 및 postMessage origin 불일치 수정

- **ID**: 037
- **날짜**: 2026-08-05
- **유형**: 버그 수정
- **리뷰 ID**: aqfdpmzrjubtgclzlefkcbkbdnvpvuez

## 작업 요약

콘솔에 남은 `index-DQqa_7_A.js` 구문 오류가 현재 운영 HTML에서 더 이상 참조되지 않는 과거 해시임을 확인하고, 전체 Vite 산출물을 새 v57 캐시 식별자와 정상 엔트리로 재발행했다. 축제 영상 iframe이 YouTube의 개인정보 보호 origin과 일반 origin 사이에서 전환돼도 고정 target origin 때문에 경고를 반복하지 않도록 지정된 iframe 창에 비민감 재생 명령을 전달하고, 수신 시에는 창과 공식 origin 두 곳을 모두 검증하도록 수정했다. 중첩된 세종한바퀴 iframe에 주입되는 ReviewOps SDK도 실제 직계 부모 origin을 사용하도록 초기 설정을 보정했다.

## 원문 요청사항

```text
Uncaught SyntaxError: Unexpected token ',' (at index-DQqa_7_A.js:1:1)
28Failed to execute 'postMessage' on 'DOMWindow': The target origin provided ('<URL>') does not match the recipient window's origin ('<URL>'). 이런 오류 뜨는데 해결해줘
```

## 변경 파일 목록

- `react-app/src/services/youtubeMessaging.ts`: 허용할 YouTube 임베드 origin과 안전한 명령 전송 target 설정 추가
- `react-app/src/components/LakeParkExperiences.tsx`: 지정 iframe 대상 메시지 전송, 공식 YouTube origin·source 검증, iframe `origin` 쿼리 연결
- `react-app/index.html`: 중첩 ReviewOps SDK의 부모 origin을 실제 직계 부모로 정규화하고 캐시 식별자를 v57로 갱신
- `react-app/scripts/postMessageOrigins.test.ts`, `react-app/package.json`: YouTube origin 회귀 테스트와 실행 명령 추가
- `src/app/page.home/view.pug`: 세종한바퀴 iframe을 v57로 갱신
- `src/assets/jochwon-app/index.html`, `src/assets/jochwon-app/assets/index-DijexYNr.js`, `src/assets/jochwon-app/assets/GamePage-B7jXQWgw.js`, `src/assets/jochwon-app/assets/GamePage-CJMKAiCL.js`: 새 운영 엔트리와 연결 청크 반영
- `devlog.md`, `devlog/2026-08-05/037-fix-runtime-syntax-and-postmessage-origin.md`: 작업 이력 기록

## 검증 결과

- `npm run test:postmessage` 성공: 공식 YouTube origin 허용과 리디렉션 프레임 전송 설정, 총 2개 통과
- `npm run test:lake-portals` 성공: 세종호수공원 5개 포탈 포함 총 6개 통과
- `tsx --test scripts/artsCenterJump.test.ts` 성공: 예술의전당 이동 회귀 테스트 총 4개 통과
- `tsc -p tsconfig.app.json --noEmit` 성공
- `npm run build` 성공: 클라이언트 TypeScript, Vite 프로덕션 빌드, 성능 예산 검사, 서버 TypeScript 통과
- WIZ 프로젝트 일반 빌드(`clean: false`) 성공
- 생성된 모든 JavaScript에 대한 `node --check` 통과
- 운영 v57 HTML에서 과거 `index-DQqa_7_A.js` 참조가 제거되고 `index-DijexYNr.js` 엔트리가 연결된 것을 확인
- v57 엔트리·GamePage·월드/포탈 청크 3개가 운영 서버에서 HTTP 200을 반환하고 로컬 산출물과 SHA-256이 일치함을 확인
- 중첩 iframe의 ReviewOps 설정이 주입된 고정 origin 대신 실제 부모 origin으로 정규화되는 것을 VM 회귀 검사로 확인
- 대상 파일 `git diff --check` 통과

## 남은 리스크

- ReviewOps SDK 주입과 YouTube 외부 iframe을 포함한 실제 리뷰 브라우저 콘솔은 현재 환경에서 자동 조작할 수 없어 화면 단위 E2E는 수행하지 못했다. 대신 동일 운영 HTML의 스크립트 주입 순서, origin 상태 전이, 생성 번들 구문과 운영 자산 일치 여부를 검증했다.
