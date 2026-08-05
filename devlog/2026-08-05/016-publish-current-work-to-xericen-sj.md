# 누적 ReviewOps 변경 문서화·보안 검증 및 xericen/SJ 게시

- **ID**: 016
- **날짜**: 2026-08-05
- **유형**: 문서화·배포

## 작업 요약

스마트시티 홀로그램·정부청사 AI 추천센터·월드 포털 진입 등 아직 커밋되지 않았던 ReviewOps 변경과 최신 WIZ 번들을 하나의 이력으로 정리했다.
README를 실제 WIZ·React·Express·MySQL 이중 런타임 기준으로 전면 개편하고, 공개 가능한 DB·비밀 설정 예시와 Vite 환경변수 예시를 보완했다.
전체 빌드·테스트·MySQL·운영 URL·민감정보를 확인한 뒤 `xericen/SJ`의 원격 이력을 포함해 `main` 브랜치로 게시한다.

## 원문 요청사항

```text
https://github.com/xericen/SJ 여기에 지금까지 한 거 git에 커밋하고 푸시해줘, 아마 많이 바꼈을텐데 db나 등등 그런 것들 다 변경해서 올려주면 돼.  readme도 새로 작성해줘 (자세히)
```

## 변경 파일 목록

- `react-app/src/`: 스마트시티 홀로그램·라이브 미리보기, 정부청사 AI 추천센터, 고정 월드 진입과 관련 UI·게임 로직
- `src/app/page.home/`, `src/assets/jochwon-app/`: WIZ 진입 캐시 갱신과 최신 React 운영 번들
- `README.md`: 서비스 기능, 아키텍처, MySQL, 환경변수, 실행·배포·API·보안·제한사항 상세 문서
- `.env.example`, `react-app/.env.example`, `react-app/server/.env.example`: WIZ·Vite·Express 공개 설정 예시
- `config-sample/database.py`, `config-sample/secret.py`: MySQL namespace와 WIZ API 비밀 설정 예시
- `react-app/scripts/runGreenhouseTests.mjs`: 파일 감시 없이 실행되는 안정적인 온실 테스트 러너
- `devlog.md`, `devlog/2026-08-04/`, `devlog/2026-08-05/`: 누적 ReviewOps 및 게시 작업 이력

## 확인 결과

- React·Vite·Express 전체 빌드 성공
- 백엔드 자동 테스트 43개 통과
- 캐릭터 이동, 온실, 온실 AI 테스트 통과
- React `dist`와 WIZ 정적 자산 140개 파일 일치
- WIZ 프로젝트 일반 빌드 성공
- MySQL `sj_hackathon` 연결 및 문서 collection 조회 성공
- 운영 `/home`, 진입 HTML, 최신 JavaScript 번들 HTTP 200
- 소스·문서 Git 공백 검사와 추적 파일의 개인키·운영 DB 호스트 패턴 검사 통과
- 생성된 vendor 번들의 upstream shader 공백은 빌드 결과 동일성을 위해 원본 유지

## 남은 리스크

- 일부 JavaScript 청크가 500KB를 넘고 최대 45MB급 GLB가 있어 초기 로딩 최적화가 필요하다.
- AI 추천·동아리·Socket.IO 기능은 별도 Node 배포와 실제 다중 사용자 환경에서 최종 확인해야 한다.
- 실제 DB·API 자격증명은 저장소가 아닌 배포 Secret에서 별도로 관리해야 한다.
