# 랜딩·개인 프로필 데스크톱 한 화면 UI 재구성

## 사용자 원문 요청

> 현재 랜딩 페이지와 개인 프로필 페이지의 UI가 세로로 너무 길어서 핵심 정보를 한눈에 확인하기 어렵다. 기능·데이터·API를 변경하지 말고 두 페이지의 레이아웃과 UI만 데스크톱 1화면 중심으로 재구성해줘. 랜딩은 Hero 2열, 압축 체험 흐름, 4개 공간 카드를 첫 화면에 배치하고, 프로필은 요약·키워드·레이더·최근 활동 4개·AI 요약·추천 코스를 첫 화면에 배치해줘. 저장 관심사·성장 히스토리·전체 활동·AI 상세 분석은 탭 또는 모달로 이동하고 1366×768, 1440×900, 1920×1080, 390×844 반응형을 확인해줘. 로그인·게스트·프로필·AI·추천·게임·데이터·API는 수정하지 마.

## 변경 파일

- `react-app/src/pages/LandingPage.tsx`: 랜딩 본문을 Hero와 4개 압축 공간 카드로 재배치하고 체험 흐름을 펼치기 상세로 이동했다.
- `react-app/src/pages/LandingPage.css`: 901px 이상은 `100dvh` 한 화면, 900px 이하는 자연스러운 세로 스크롤이 되도록 반응형 레이아웃을 추가했다.
- `react-app/src/components/AiSejongProfile.tsx`: 프로필 요약, 핵심 성향, 최근 활동 4개, AI 요약, 추천 3개를 첫 화면에 배치하고 긴 정보는 4개 상세 탭 및 활동 상세 모달로 이동했다.
- `react-app/src/components/AiSejongProfile.css`: 데스크톱 고정 대시보드, 상세 패널 내부 스크롤, 태블릿·모바일 1열 전환 스타일을 추가했다.
- `react-app/scripts/desktopPageLayout.test.ts`: 두 화면의 한 화면 구조, 표시 개수, 상세 패널, 반응형 스크롤 계약을 검증한다.
- `react-app/package.json`: 새 UI 계약 테스트 실행 명령을 등록했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`: 배포 런타임 ID를 `20260806-desktop-page-layout-v184`로 맞췄다.
- `src/assets/jochwon-app/`: 새 React 운영 빌드 산출물을 동기화했다.
- `devlog.md`, 이 문서: 작업 및 검증 결과를 기록했다.

## 검증 결과

- `npm run build`: 통과. 클라이언트 TypeScript, Vite 운영 빌드, 성능 예산, 서버 TypeScript 검사 완료.
- `npm run test:desktop-page-layout`: 3/3 통과.
- `npx tsx --test scripts/landingResponsiveStats.test.ts`: 2/2 통과.
- `npm run test:runtime-entry`: 6/6 통과.
- `npx tsx --test scripts/socialProfileActions.test.ts`: 7/7 통과.
- `npm run test:world-ux-layout`: 5/5 통과.
- `git diff --check`: 통과.
- WIZ `main` 프로젝트 일반 빌드(`clean=false`): 통과.
- 운영 `/home`과 정적 번들에서 런타임 ID, `welcome-home-dashboard`, `profile-detail-tabs`, 4개 프로필 세부 탭 문자열 응답 확인.
- 뷰포트 CSS 계약: 1366×768, 1440×900, 1920×1080은 페이지 전체 스크롤을 막고 남은 높이를 grid로 분배하며, 390×844는 1열과 페이지 세로 스크롤을 허용한다.

## 범위 확인

- 이 작업에서는 로그인·게스트 처리, API 호출, 데이터 계산, AI 프롬프트, 추천 데이터, 게임 화면·맵·GLB·멀티플레이·채팅 코드를 변경하지 않았다.
- 기존 상세 내용은 삭제하지 않고 펼치기, 탭, 상세 모달로 이동했다.
