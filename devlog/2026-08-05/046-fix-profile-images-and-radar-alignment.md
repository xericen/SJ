# 내 프로필 활동 이미지 직접 정적 경로 전환 및 성향 영역 정렬

## 사용자 원문 요청

> 스크린샷보면 안 보이잖아;;;;;;;;;;;;;;;;;;;;; 그리고 앱에서 발견된 나의 성향 왼쪽 정렬로 잘 맞게 수정해줘

- 리뷰 ID: `ojivesvftecvoziykppvtszmodesubns`
- 화면: 내 프로필

## 변경 내용

- 프로필 활동 기록과 추천 코스 이미지를 인증 자산 경로가 아닌 iframe과 동일한 `/assets/jochwon-app/images/...` 정적 경로에서 직접 불러오도록 변경했다.
- 이미지 로드 실패 시 기본 이미지로 대체하는 기존 처리를 유지했다.
- `맵에서 발견한 나의 성향` 카드의 제목과 모든 설명 행을 명시적으로 왼쪽 정렬했다.
- 브라우저의 immutable 캐시를 피하도록 JS, CSS, 진입 번들을 모두 v45 신규 파일명으로 발행했다.

## 변경 파일

- `react-app/src/components/AiSejongProfile.tsx`
- `react-app/src/components/AiSejongProfile.css`
- `react-app/index.html`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/index-profile-layout-v45.js`
- `src/assets/jochwon-app/assets/GamePage-profile-layout-v45.js`
- `src/assets/jochwon-app/assets/GamePage-profile-layout-v45.css`
- `devlog.md`
- `devlog/2026-08-05/046-fix-profile-images-and-radar-alignment.md`

## 검증 결과

- `npm run build`: 성공
- 성능 예산 검사: 성공
- WIZ 일반 빌드(`clean=false`): 성공
- 공개 v45 index, 진입 번들, 프로필 JS/CSS: 모두 HTTP 200
- 공개 활동 이미지 응답: HTTP 200 및 PNG 파일 시그니처 확인
- 공개 CSS에서 성향 카드 왼쪽 정렬 규칙 확인
