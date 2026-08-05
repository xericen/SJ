# 내 프로필 활동 이미지 캐시 무효화 및 운영 재배포

## 사용자 원문 요청

> 아직오 내프로필에서 최근 활동기록 이미지 안 잡혀 수정해줘,

- 리뷰 ID: `ojivesvftecvoziykppvtszmodesubns`
- 화면: 내 프로필

## 원인

- 이미지 경로 보정 코드를 기존 해시 청크 파일명에 덮어써 운영 브라우저의 1년 `immutable` 캐시에 이전 코드가 남아 있었다.
- 실제 이미지 URL `/auth/jochwon-assets/images/government-complex-diorama.png`는 HTTP 200으로 정상 응답했다.

## 변경 내용

- 경로가 보정된 프로필 청크를 `GamePage-profile-images-v42.js` 새 파일명으로 발행했다.
- 새 진입 번들 `index-profile-images-v42.js`이 해당 청크를 참조하도록 구성했다.
- iframe과 앱 내부 빌드 ID를 `20260805-profile-images-v42`로 갱신했다.
- React 원본의 이미지 경로 보정 및 로드 실패 대체 처리는 유지했다.

## 변경 파일

- `react-app/src/components/AiSejongProfile.tsx`
- `react-app/index.html`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/index-profile-images-v42.js`
- `src/assets/jochwon-app/assets/GamePage-profile-images-v42.js`
- `devlog.md`
- `devlog/2026-08-05/044-republish-profile-images-with-cache-bust.md`

## 검증 결과

- WIZ 일반 빌드(`clean=false`): 성공
- 공개 index가 신규 진입 번들 및 v42 빌드 ID를 참조함을 확인
- 신규 진입 번들, 프로필 청크, 대체 이미지 공개 URL: 모두 HTTP 200
- 운영 bundle 프로필 이미지 경로 보정 4곳 확인
