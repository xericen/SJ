# 최신 해커톤 제출 문서·누적 ReviewOps 변경 게시

- **ID**: 017
- **날짜**: 2026-08-06
- **유형**: 문서·릴리스
- **리뷰 ID**: cwbbogxjkwzznuzsqgvyayjbjbpacqgg

## 사용자 요청

> https://github.com/xericen/SJ 여기에 지금까지 한 거 git에 커밋하고 푸시해줘, 아마 많이 바꼈을텐데 db나 등등 그런 것들 다 변경해서 올려주면 돼. readme도 새로 작성해줘 (해커톤용으로 올려주면 됨)

## 변경 내용

- 해커톤 README를 최신 기능에 맞춰 다시 작성했다. 14종 수목원 기억나무·충녕 AI 분석, 마이홈 정원·좌석·침대, 축제 이미지·카카오 지도·충돌, 공간별 카메라와 공용·로컬 포털 정책을 심사 동선과 기능 설명에 반영했다.
- WIZ 정적 엔트리의 빌드 쿼리, 로드 실패 자동 복구, CSS 선로딩과 로컬 SUIT 폰트 구성까지 운영 아키텍처에 문서화했다.
- 마이홈 상호작용, 수목원 성장형 탐험, 호수공원·베어트리파크·마이홈 카메라, 공동캠퍼스 렌더링, 모집센터·동아리 거리·정부청사·스마트시티 포털, 프로젝트실 전광판과 홈 런타임 안정화 변경을 릴리스에 포함했다.
- 정부청사·중앙광장·스마트시티 포털 정책 변경 뒤 남아 있던 축제·공동캠퍼스·마이홈 회귀 테스트 기대값을 현재 서버 정책에 맞춰 갱신했다.
- 최신 React `dist`에 없는 중간 빌드 해시 자산 34개를 WIZ 정적 디렉터리에서 제거해 제출 산출물을 단일 빌드로 정리했다.
- 실제 `.env`, MySQL 접속 정보, API 키와 개인키는 Git에서 계속 제외했다.

## 주요 변경 파일

- `README.md`
- `devlog.md`, `devlog/2026-08-05/080-*.md` ~ `083-*.md`
- `devlog/2026-08-06/001-*.md` ~ `017-publish-latest-hackathon-release.md`
- `react-app/package.json`, `react-app/vite.config.ts`, `react-app/scripts/*.test.ts`
- `react-app/shared/*`, `react-app/server/src/rooms/*`, `react-app/server/src/socket/*`, `react-app/server/src/services/ai/*`
- `react-app/src/App.tsx`, `react-app/src/components/*`, `react-app/src/data/*`, `react-app/src/game/*`, `react-app/src/pages/*`, `react-app/src/services/*`, `react-app/src/styles.css`
- `src/app/page.home/api.py`, `src/app/page.home/view.pug`
- `src/assets/jochwon-app/index.html`, `src/assets/jochwon-app/assets/*`

## 확인 결과

- `git fetch origin` 후 원격 추가 커밋이 없음을 확인했다.
- `npm run build` 성공: React·Express TypeScript, Vite 프로덕션 빌드와 성능 예산 통과
- 성능 예산 통과: 초기 엔트리 243 KiB, 최대 JavaScript gzip 310 KiB, 최대 3D 자산 21.64 MiB
- Express 백엔드 테스트 58개 통과 및 실제 MySQL `sj_hackathon` 연결·개인 팜 사용자 격리 검증 성공
- 월드·포털·카메라·마이홈·축제·수목원·런타임 보안 회귀 테스트 66개 통과
- 캐릭터 이동, 수목원 기본·AI 분석과 2클라이언트 실시간 통신 검증 통과
- 생성 JavaScript 18개 `node --check` 통과
- React `dist`와 WIZ 정적 자산 143개 전체 일치 확인
- WIZ Python API 구문 검사 및 WIZ 일반 빌드 성공
- `xericen/SJ`의 `main` 브랜치로 누적 변경을 커밋·푸시한다.

## 남은 리스크

- 최대 21.64 MiB 3D 자산과 Phaser 지연 로딩 청크는 첫 방문 네트워크 환경에 따라 로딩 시간이 달라질 수 있다.
- 카메라 거리, 캐릭터 비율과 충돌 영역의 최종 체감은 각 맵을 운영 브라우저로 직접 순회하는 수동 확인이 필요하다.
- OpenAI, Kakao와 공공데이터 연동은 운영 키·할당량·외부 제공기관 상태에 영향을 받는다.
