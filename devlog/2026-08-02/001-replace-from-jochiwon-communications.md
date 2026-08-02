# JoChiWon-Communications 저장소 전체 교체

## 사용자 원본 요청

> https://github.com/LeeDoHyung760/JoChiWon-Communications 여기에 있는 것들로 전부 바꿔줘 pull해줘

## 작업 내용

- 지정한 저장소의 `main` 브랜치(`05589e5`)를 가져와 현재 프로젝트의 추적 파일 전체를 교체했다.
- 기존 프로젝트 커밋은 `backup/before-jochiwon-import-20260802` 브랜치와 `previous-origin` 원격으로 보존했다.
- 기존 WIZ 런타임 전용 파일은 `/opt/app/backups/main-before-jochiwon-import-20260802-runtime`으로 이동해 복구 가능하게 유지했다.
- 현재 `origin`을 `https://github.com/LeeDoHyung760/JoChiWon-Communications.git`로 변경하고 `main` 추적 브랜치를 연결했다.

## 변경 파일

- 대상 저장소 `main` 브랜치의 전체 추적 파일
- `devlog.md`
- `devlog/2026-08-02/001-replace-from-jochiwon-communications.md`

## 확인 결과

- 루트 및 `server/` 의존성 `npm ci` 성공, 취약점 0건
- `npm run build` 성공: 클라이언트 TypeScript·Vite와 서버 TypeScript 빌드 완료
- `npm run test:character` 성공
- `CHOKIDAR_USEPOLLING=true npm run test:greenhouse` 성공
- 대상 저장소 추적 파일에서 개인키·GitHub/OpenAI 토큰 패턴 및 환경설정 비밀 파일이 없음을 확인

## 참고

- 새 프로젝트는 WIZ/Angular가 아니라 React·Vite·Express·Socket.IO 기반이므로 기존 WIZ 빌드·배포 방식과 호환되지 않는다.
