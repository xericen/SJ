# ReviewOps sandbox CORS 흰 화면 및 로그인 후 온보딩 순서 수정

- **ID**: 017
- **날짜**: 2026-08-03
- **유형**: 버그 수정

## 작업 요약

실제 Chromium에서 ReviewOps와 동일한 `sandbox="allow-scripts allow-forms allow-popups allow-downloads"` 환경을 구성해 사용자 성공 URL을 재현했다.
흰 화면의 직접 원인은 `origin: null`인 성공 창이 React ES module과 CSS를 요청할 때 운영 정적 응답에 CORS 헤더가 없어 브라우저가 번들 실행 자체를 차단한 것이었다.
기존 인증 라우트에 React 자산 전용 CORS 응답 경로를 추가하고 Vite 운영 자산 기준 경로를 해당 라우트로 전환했다.
sandbox에서 브라우저 저장소가 차단될 때는 현재 문서용 메모리 저장소를 제공해 초기설정과 게임 진입까지 진행되도록 했다.
또한 이전 로컬 체험 기록이 있어도 로그인 직후에는 항상 1단계 프로필 설정부터 시작하도록 초기화해, 새로고침만으로 호수공원에 자동 진입하지 않게 했다.

## 원문 요청사항

```text
https://sj.wizide.com/assets/jochwon-app/index.html?login=success&userId=5018328866&nickname=%EC%B9%B4%EC%B9%B4%EC%98%A4+%EC%82%AC%EC%9A%A9%EC%9E%90&profileImage=&_build=20260803-respawn-v3 이렇게 누르면 새 창으로 가고 아무것도 안 뜸, 원래는 로그인하기 누르면 카카오톡 로그인한 후에 -> 메타버스 초기설정 이렇게 들어가야하는데 아무것도 안 뜨니까 넘어갈 수가 없음. 그래서 새로고침하면 혼자서 갑자기 세종호수 공원 입성함 이러면 안 됨. 무조건 뭐가 문제인지 찾고 해결해줘. 그리고 되는지 확인까지 너가 스스로 해줘
```

## 변경 파일 목록

- `react-app/vite.config.ts`: 운영 자산 기준 경로를 CORS 지원 인증 라우트로 변경
- `src/portal/season/route/auth/controller.py`: React 자산 안전 경로 검증 및 CORS/CORP 헤더 응답 추가
- `react-app/index.html`: sandbox 저장소 차단 시 현재 문서용 메모리 Storage fallback 추가
- `react-app/src/App.tsx`: 로그인 성공 시 과거 로컬 완료 상태를 무시하고 초기설정 1단계부터 시작
- `react-app/src/services/aiSejongProfile.ts`: 초기설정 렌더링 중 저장소 접근 예외 방지
- `src/assets/jochwon-app/`: 수정된 React 프로덕션 번들 동기화
- `devlog.md`: 작업 요약 행 추가
- `devlog/2026-08-03/017-fix-sandbox-cors-onboarding-flow.md`: 상세 작업 기록

## 확인 결과

- 수정 전 동일 sandbox에서 JS/CSS CORS 차단, 빈 `#root`, 흰 화면을 실제 Chromium으로 재현
- React·Vite·Express 전체 빌드 성공
- Python 구문 검사 및 WIZ 일반 빌드 성공
- 운영 JS/CSS 응답의 `Access-Control-Allow-Origin: *` 및 `Cross-Origin-Resource-Policy: cross-origin` 확인
- 동일 sandbox에서 성공 URL이 “세종에서 만날 나를 소개해 주세요” 1단계를 렌더링하는 것 확인
- 필수값 입력 후 “메타버스 속 나를 만들어요” 2단계와 캐릭터 저장 버튼 노출 확인
- 캐릭터 저장 전에는 호수공원에 진입하지 않고, 저장 후에만 세종호수공원 월드가 표시되는 것 확인
- 월드 진입 뒤 새로고침하면 랜딩 화면으로 돌아가며 자동 재입장하지 않는 것 확인
- `git diff --check` 성공

## 남은 리스크

- ReviewOps의 가장 엄격한 sandbox에서는 축제 목록 등 일부 부가 API 요청이 CORS로 차단될 수 있으나 로그인·초기설정·캐릭터 저장·호수공원 진입 핵심 흐름은 브라우저 테스트를 통과했다.
- 메모리 Storage fallback은 현재 창에서만 유지되므로 sandbox 창을 새로고침하면 초기 상태로 돌아간다.
