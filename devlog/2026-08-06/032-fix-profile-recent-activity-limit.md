# 내 프로필 최근 활동 고정 표시 및 하단 더보기 제거

- 날짜: 2026-08-06
- 리뷰 ID: `ojivesvftecvoziykppvtszmodesubns`
- 사용자 원문: "내 프로필에 최근 활동 기록에 모든 기록 더보기 버튼 없애줘 , 구리고 활동기록 지금 있는 칸만 딱 넣어주면 될듯, 계속 최근 활동은 쌓이는데 네모칸 길이는 길어지지 않게, 나머지는 전체보기에서 보면 되게 해주면 됨"

## 변경 내용

- 최근 활동 카드에는 누적 기록 중 최신 4건만 표시하도록 고정했습니다.
- 카드 하단의 `모든 기록 더보기` / `최근 기록만 보기` 버튼과 관련 상태·스타일을 제거했습니다.
- 카드 헤더의 `전체 보기`는 유지해 모든 누적 기록을 상세 패널에서 확인할 수 있게 했습니다.
- 운영 브라우저의 immutable 캐시를 우회하도록 신규 런타임 청크·엔트리와 빌드 식별자 `20260806-profile-records-v129`를 발행했습니다.

## 변경 파일

- `react-app/src/components/AiSejongProfile.tsx`
- `react-app/src/components/AiSejongProfile.css`
- `src/assets/jochwon-app/assets/GamePage-profile-records-v129.js`
- `src/assets/jochwon-app/assets/index-profile-records-v129.js`
- `src/assets/jochwon-app/index.html`
- `src/app/page.home/view.pug`
- `devlog.md`
- `devlog/2026-08-06/032-fix-profile-recent-activity-limit.md`

## 확인 결과

- `react-app`의 `npm run build` 통과: TypeScript, Vite 프로덕션 빌드, 성능 예산 검사, 서버 TypeScript 검사 성공.
- WIZ `main` 프로젝트 일반 빌드 성공.
- 운영 URL에서 신규 인덱스·엔트리·GamePage 청크가 모두 HTTP 200으로 제공됨을 확인했습니다.
- 운영 GamePage 청크가 `records.slice(0,4)`를 사용하고, 하단 더보기 문구·클래스는 포함하지 않으며, `전체 보기`와 `모든 활동 기록` 상세 경로는 유지함을 확인했습니다.
