# WIZ main 프로젝트 빌드·운영 반영 확인

- 원본 요청: `위즈에서 실제 빌드, 배포까지 하게 해줘`
- 변경 파일: 프로젝트 빌드 산출물 및 `devlog.md`
- 변경 내용: WIZ 현재 프로젝트 `main`을 대상으로 일반 빌드를 실행하고 운영 반영을 확인했다.
- 확인: WIZ workspace 상태에서 `/opt/app/project/main`을 확인했고, 빌드 성공(`Project 'main' build completed`) 후 `https://sj.wizide.com/home` 응답의 `Last-Modified`가 빌드 시각으로 갱신되었으며 수정된 `isClosedMessageChannel` 코드가 운영 HTML에 포함되었다.
- 남은 리스크: 이미 열린 브라우저 탭은 이전 iframe 문서를 유지할 수 있으므로 새로고침이 필요하다. 브라우저 확장 프로그램 자체 오류는 별도다.
