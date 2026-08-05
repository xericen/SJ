# 해커톤 제출 README 개편 및 누적 ReviewOps 변경 게시

- **ID**: 079
- **날짜**: 2026-08-05
- **유형**: 문서·릴리스
- **리뷰 ID**: cwbbogxjkwzznuzsqgvyayjbjbpacqgg

## 사용자 요청

> https://github.com/xericen/SJ 여기에 지금까지 한 거 git에 커밋하고 푸시해줘, 아마 많이 바꼈을텐데 db나 등등 그런 것들 다 변경해서 올려주면 돼. readme도 새로 작성해줘 (해커톤용으로 올려주면 됨)

## 변경 내용

- 루트 README를 해커톤 심사자가 서비스 목적과 차별점을 빠르게 파악할 수 있도록 문제 정의, 핵심 해결 방식, 운영 링크와 7단계 시연 동선 중심으로 개편했다.
- 17개 월드의 통합 탐색 기준, 마이홈 생태 미션, 실내 출입·좌석 상호작용, 베어트리파크·공동캠퍼스 고정 포털 정책을 최신 구현에 맞춰 문서화했다.
- WIZ Python API와 Express·Socket.IO 서버가 함께 MySQL을 사용하는 구조, 환경변수, 빌드·배포·검증·보안 원칙을 상세히 정리했다.
- ReviewOps에서 누적된 곰 가족 포토존, 마이홈 공간 안내, 곰 체험소 정리, 월드 도착점과 카메라·이동 통일, 고정 포털 변경 및 회귀 테스트를 하나의 릴리스로 포함했다.
- 해시가 변경된 React 프로덕션 번들을 WIZ 정적 자산으로 반영하고 이전 해시 파일을 정리했다.
- 실제 `.env`, DB 접속 정보, API 키와 개인키는 Git에서 계속 제외했다.

## 주요 변경 파일

- `README.md`
- `devlog.md`, `devlog/2026-08-05/064-*.md` ~ `079-publish-hackathon-submission.md`
- `react-app/package.json`, `react-app/scripts/*.test.ts`
- `react-app/shared/world-portals.ts`
- `react-app/src/components/*`, `react-app/src/game/*`, `react-app/src/pages/*`, `react-app/src/services/*`
- `react-app/server/src/models/*`, `react-app/server/src/rooms/roomStore.ts`, `react-app/server/src/socket/registerSocketHandlers.ts`
- `src/app/page.home/api.py`, `src/app/page.home/view.pug`
- `src/assets/jochwon-app/index.html`, `src/assets/jochwon-app/assets/*`

## 확인 결과

- `git fetch origin` 후 원격 추가 커밋이 없고 로컬 누적 통합 커밋만 앞서 있음을 확인했다.
- `npm run build` 성공: React·Express TypeScript, Vite 프로덕션 번들, 성능 예산 통과
- 성능 예산 통과: 초기 엔트리 286 KiB, 최대 JavaScript gzip 310 KiB, 최대 3D 자산 21.64 MiB
- Express 백엔드 테스트 58개 통과 및 실제 MySQL `sj_hackathon` 연결·개인 팜 사용자 격리 검증 성공
- 포토존·베어트리파크·공동캠퍼스·마이홈·축제·월드 이동·런타임·카메라·메시지 회귀 테스트 41개 통과
- 캐릭터 이동과 온실 체험 테스트 통과
- React `dist`와 WIZ 정적 자산의 전체 파일·내용 일치 확인
- WIZ Python API 구문 검사 및 WIZ 일반 빌드 성공
- 비밀정보 패턴, 비예시 `.env`, 50 MiB 초과 추적 파일이 없고 소스·문서 Git 공백 검사 통과(생성 번들 제외)
- `xericen/SJ`의 `main` 브랜치로 누적 변경을 커밋·푸시한다.

## 남은 리스크

- 최대 21.64 MiB 3D 자산과 Phaser 지연 로딩 청크는 첫 방문 네트워크 환경에 따라 로딩 시간이 달라질 수 있다.
- WIZ와 선택형 Node 백엔드의 모든 실시간 기능은 실제 운영 프록시에서 다중 사용자 수동 검증이 추가로 필요하다.
- OpenAI, Kakao와 공공데이터 연동은 운영 키·할당량·외부 제공기관 상태에 영향을 받는다.
