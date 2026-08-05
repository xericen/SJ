# 누적 기능·DB·운영 문서 정리 및 xericen/SJ 게시

- **ID**: 051
- **날짜**: 2026-08-05
- **유형**: 문서화·보안·배포
- **리뷰 ID**: cwbbogxjkwzznuzsqgvyayjbjbpacqgg

## 원문 요청사항

```text
https://github.com/xericen/SJ 여기에 지금까지 한 거 git에 커밋하고 푸시해줘, 아마 많이 바꼈을텐데 db나 등등 그런 것들 다 변경해서 올려주면 돼.  readme도 새로 작성해줘 (자세히)
```

## 작업 요약

이전 게시 이후 누적된 3D 월드, 공용 포털, 세종호수공원, 예술의전당, 먹거리, 프로필, 성능 및 Node 운영 배포 변경을 하나의 Git 이력으로 정리했다. README를 현재 WIZ·React·Express·Socket.IO·MySQL 구조와 실제 운영 정책에 맞춰 확장하고, 공용 포털 DB 책임, 고정 좌표, 권한, 회귀 테스트와 배포 절차를 상세히 기록했다.

푸시 전 문서와 설정의 환경변수 이름을 실제 코드와 맞추고 중복 devlog ID를 042~047로 정리했다. Git에서 제외된 실제 DB·API 설정 파일의 권한은 `600`으로 제한했으며, Docker 빌드 컨텍스트에서는 대형 클라이언트 자산을 제외했다.

## 변경 파일 목록

- `react-app/src/`, `react-app/shared/`: 월드 이동·포털·카메라·이름표·프로필·예술·먹거리 체험 및 공용 이벤트
- `react-app/server/src/`: MySQL 공용 포털 모델, 권한 검사, 실시간 동기화, 상태 검사와 런타임 저장 경로
- `src/app/page.home/api.py`, `src/model/`: WIZ 세션 기반 포털 조회·저장 API와 `world_portal_layout` MySQL 모델
- `react-app/src/assets/maps/club-street-festival-map.glb`: Meshopt·WebP 최적화 자산
- `react-app/scripts/`: 성능 예산, 다중 사용자, 포털·카메라·postMessage·공연·먹거리 회귀 테스트
- `react-app/server/Dockerfile`, `react-app/deploy/`, `react-app/.dockerignore`: Node 운영 컨테이너와 Nginx 프록시 구성
- `src/assets/jochwon-app/`, `react-app/index.html`, `src/app/page.home/view.pug`: v64 운영 정적 번들과 캐시 식별자
- `README.md`: 최신 기능, 아키텍처, MySQL, 환경변수, 실행·배포·API·테스트·보안·제한사항 상세 문서
- `devlog.md`, `devlog/2026-08-05/`: 누적 ReviewOps 작업과 게시 이력

## 확인 결과

- 원격 `origin/main`과 작업 기준 커밋 일치 후 게시 준비
- React·Vite·Express 전체 빌드 및 성능 예산 검사 성공
- 초기 진입 JavaScript 283 KiB, 최대 gzip JavaScript 310 KiB, 최대 GLB 21.64 MiB
- Express 백엔드 테스트 43개 통과
- 캐릭터·온실·온실 AI 및 포털 11개·카메라 2개·postMessage 2개 테스트 통과
- 예술의전당·먹거리 회귀 테스트 10개와 실제 MySQL 기반 2클라이언트 실시간 검증 통과
- Python 구문 검사, WIZ 일반 빌드, React/WIZ 정적 자산 140개 일치
- 운영 `/home`, v64 진입 HTML·JavaScript·최적화 GLB·공식 포스터 5개 HTTP 200
- npm 운영 의존성 취약점 0건, 소스·문서 Git 공백 및 devlog 링크·중복 ID 검사 통과
- 생성된 `model-viewer` vendor 청크의 shader/template 내부 공백은 빌드 결과 동일성을 위해 원본 유지
- 실제 환경 파일 Git 제외 및 파일 권한 `600` 확인

## 남은 리스크

- 실제 운영 Node 컨테이너와 Nginx 프록시 갱신은 운영 호스트 권한이 있는 담당자가 `react-app/deploy/` 절차로 적용해야 한다.
- WebGL 카메라·포스터 크롭·포털 체감과 외부 Kakao Map·YouTube iframe 정책은 운영 브라우저에서 최종 확인해야 한다.
- 현재 최대 GLB는 성능 예산 이내지만 저속 네트워크에서 최초 공간 진입 지연이 있을 수 있다.
