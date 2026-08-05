# 내 프로필 활동 기록 사진 배포 경로 수정

## 사용자 원문 요청

> 현재 사진을 잘 못 잡는데 이 부분 수정해줘

- 리뷰 ID: `ojivesvftecvoziykppvtszmodesubns`
- 화면: 내 프로필

## 변경 내용

- 프로필 활동 기록과 추천 코스의 `/images/...` 경로를 Vite 배포 기준 경로(`/auth/jochwon-assets/images/...`)로 보정했다.
- 이미지 로드가 실패하면 프로필 기본 장소 이미지로 한 번 대체하도록 오류 처리를 추가했다.
- 브라우저가 최신 번들을 불러오도록 빌드 식별자를 `20260805-profile-images-v40`으로 갱신했다.
- React 소스와 현재 WIZ 운영 번들 모두에 동일한 이미지 경로 보정을 반영했다.

## 변경 파일

- `react-app/src/components/AiSejongProfile.tsx`
- `react-app/index.html`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/`
- `devlog.md`
- `devlog/2026-08-05/043-fix-profile-activity-images.md`

## 검증 결과

- `npm run build`: 성공
- 성능 예산 검사: 성공
- WIZ 클린 빌드 및 후속 일반 빌드: 성공
- WIZ bundle의 활성 프로필 청크에 `/auth/jochwon-assets/images/` 경로 보정 4곳 포함 확인
- 대체 이미지 파일 존재 확인
