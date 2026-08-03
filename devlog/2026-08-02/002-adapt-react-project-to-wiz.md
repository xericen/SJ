# React 프로젝트 WIZ 정적 어댑터 통합

## 사용자 원본 요청

> Not Found The requested URL was not found on the server. 현재 위즈에 맞춰서 바꿔줘

## 원인

- 저장소 전체 교체로 WIZ가 `/home`을 구성하는 `src/app/page.home`과 Angular/WIZ 프로젝트 구조가 제거됐다.
- 가져온 프로젝트는 React·Vite 프런트엔드와 Express·Socket.IO 백엔드로 구성되어 WIZ가 직접 빌드하거나 라우팅할 수 없는 구조였다.

## 작업 내용

- 기존 WIZ 프로젝트 구조를 백업 브랜치에서 복구했다.
- 가져온 저장소 전체를 `react-app/` 아래로 이동해 원본 소스와 서버를 유지했다.
- Vite의 정적 자산 경로를 상대 경로로 바꾸고 API 기본 주소를 현재 호스트 기준으로 조정했다.
- React 프런트엔드를 빌드하여 `src/assets/jochwon-app/`에 배치했다.
- WIZ `page.home`을 전체 화면 iframe 어댑터로 변경해 `/home`에서 React 화면을 제공하도록 했다.

## 변경 파일

- `react-app/`: React·Vite·Express 원본 프로젝트 전체
- `react-app/vite.config.ts`
- `react-app/src/config/api.ts`
- `react-app/src/pages/CommunityPage.tsx`
- `src/assets/jochwon-app/`: WIZ 제공용 정적 빌드
- `src/app/page.home/view.pug`
- `src/app/page.home/view.scss`
- `src/app/page.home/view.ts`
- `README.md`
- `devlog.md`
- `devlog/2026-08-02/002-adapt-react-project-to-wiz.md`

## 확인 결과

- React 클라이언트·Express 서버 TypeScript 빌드 성공
- WIZ 일반 빌드 성공
- `https://sj.wizide.com/home` HTTP 200
- `https://sj.wizide.com/assets/jochwon-app/index.html` HTTP 200 및 `세종한바퀴` 번들 확인
- React 캐릭터 테스트와 Greenhouse 테스트 성공
- 이번 작업에서 직접 수정한 WIZ 어댑터·React 설정·문서 파일의 `git diff --check` 통과

## 남은 리스크

- Express·Socket.IO·MongoDB 기능은 별도 Node 백엔드를 배포하거나 WIZ API로 이식하기 전까지 동작하지 않는다.
- WIZ 의존성 감사에서 보안 취약점 경고가 확인되어 호환성 검토 후 단계적 업데이트가 필요하다.
- 정적 3D 자산 때문에 배포 번들 용량이 크다.
- 복구한 기존 WIZ·vendor 파일 일부에는 과거부터 존재하던 줄 끝 공백 경고가 남아 있다.
