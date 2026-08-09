# WIZ 운영 정적·API 혼합 배포 캐시 해소

- **ID**: 096
- **날짜**: 2026-08-09
- **유형**: 버그 수정

## 작업 요약

운영 React 정적 번들은 최신이지만 WIZ의 비개발 API 코드 캐시가 이전 `api.py`를 계속 실행해 기능이 절반만 반영된 원인을 재현했다. WIZ 일반 빌드 후 운영 기본 세션의 코드 캐시를 최신 bundle 기준으로 활성화했고, 새 빌드 ID와 운영 직접 회귀 검사를 추가했다.

## 원문 요청사항

```text
변경 요약

충녕이 최초 화면에 장소 추천 NPC 소개 표시
자동 추천을 없애고 장소 추천 버튼으로만 실행
일반 대화 입력창과 전송 기능 제거
카카오 Local API에서 실제 세종 장소를 무작위 추첨하고 OpenAI로 추천 문구 생성
카카오 검색만 사용하는 우회 경로 제거
개발 로그 및 회귀 테스트 추가,변경 요약

로그아웃 후 카카오 로그인 시 로그인 화면을 다시 표시하도록 강제 재인증 처리
예술의전당→세종호수공원 귀환 좌표를 안전한 지면으로 변경
전용 회귀 테스트 및 개발 로그 추가
WIZ 프로젝트 빌드 반영 이거 웹에 하나도 반영 안됐음. 문제 찾고 해결해줘. 그리고 원인이 뭔지 알려줘
```

## 변경 파일 목록

- `react-app/src/runtimeBuild.ts`: 운영 iframe과 React 엔트리의 캐시 버전을 리뷰 ID 전용 v9로 갱신
- `src/app/page.home/view.pug`: `/home` iframe 빌드 쿼리를 v9로 갱신
- `react-app/scripts/wizProductionDeployment.test.ts`: 개발 쿠키 없이 운영 카카오 강제 재인증과 실제 장소 추천 응답을 검증
- `react-app/package.json`: 운영 배포 회귀 테스트 명령 추가
- `README.md`: 운영 배포 확인 절차에 신규 테스트 추가
- `src/assets/jochwon-app/`: 새 React 프로덕션 번들을 WIZ 정적 자산에 반영
- `devlog.md`, `devlog/2026-08-09/096-fix-wiz-production-runtime-cache.md`: 작업 이력 기록

## 원인

- WIZ 일반 빌드는 `build/`와 `bundle/`을 최신화했지만 이미 실행 중인 운영 기본 세션의 `app.api.code#main` 캐시는 자동으로 지워지지 않았다.
- 개발 쿠키가 있는 요청은 매 요청 캐시를 비워 최신 `api.py`를 사용했으나 일반 사용자는 이전 캐시를 사용했다.
- 그 결과 React 화면은 최신인데 카카오 OAuth에는 `prompt=login`이 없고, 충녕이의 `operation=chungnyeongPlaceRecommendation`은 추천 대신 설정 상태를 반환하는 혼합 배포가 발생했다.

## 검증 결과

- 개발 쿠키 없는 운영 카카오 OAuth 응답에서 `prompt=login` 확인
- 개발 쿠키 없는 운영 추천 API에서 카카오 실제 세종 장소 및 OpenAI 문구 반환 확인
- 운영 `/home`이 v9 iframe을, 운영 iframe이 신규 `index-J1oj11sQ.js`를 로드하는 것 확인
- 운영 GamePage 번들에서 NPC 소개·`operation` 추천 경로 확인 및 일반 대화 입력창 미포함 확인
- ReviewOps 회귀 테스트 5건, 운영 배포 회귀 테스트 2건, 예술의전당 안전 귀환 전용 테스트 통과
- Python 문법 검사, React·Express 프로덕션 빌드, 성능 검사, WIZ 일반 빌드, `git diff --check` 통과
- 기존 호수공원 포탈 좌표 기대값 2건은 현재 맵 좌표와 오래된 테스트 값 차이로 계속 실패하며 이번 배포 캐시 수정과는 무관함
