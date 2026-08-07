# 내 프로필 대시보드 크기 및 카드 균형 조정

- 날짜: 2026-08-07
- 리뷰 ID: `ojivesvftecvoziykppvtszmodesubns`
- 사용자 원문: "내 프로필이 너무 크게 나와서 크기 작게 조절해줘 관심ㄹ레이더 크기 잘 맞게 수정해주고, 최근 활동도 맞게 수정해줘"

## 변경 내용

- 데스크톱 프로필 창의 최대 크기를 1040×760px로 축소하고 화면 중앙 여백을 확보했습니다.
- 키워드·관심사 레이더와 최근 활동 영역을 동일한 1:1 열 비율로 맞췄습니다.
- 관심사 레이더를 카드 내부에서 76%로 축소하고 설명 영역 간격과 글자 크기를 정돈했습니다.
- 최근 활동은 최신 4건 고정 구조를 유지하면서 행 이미지, 본문, 시간·점수 열을 카드 크기에 맞게 축소했습니다.
- 운영 캐시를 우회하기 위해 `20260807-profile-compact-v195` 빌드 식별자와 전용 스타일 자산을 발행했습니다.

## 변경 파일

- `react-app/src/components/AiSejongProfile.css`
- `src/assets/jochwon-app/assets/profile-compact-v195.css`
- `src/assets/jochwon-app/index.html`
- `src/app/page.home/view.pug`
- `devlog.md`
- `devlog/2026-08-07/007-compact-profile-dashboard.md`

## 확인 결과

- `react-app`의 `npm run build` 통과: TypeScript, Vite 프로덕션 빌드, 성능 예산 검사, 서버 TypeScript 검사 성공.
- WIZ `main` 프로젝트 일반 빌드 성공.
- 운영 인덱스가 신규 빌드 ID와 전용 CSS를 참조함을 확인했습니다.
- 운영 CSS가 HTTP 200으로 제공되며 1040×760px 프로필, 1:1 카드 열, 레이더 축소, 최근 활동 4행 배치 규칙을 포함함을 확인했습니다.
