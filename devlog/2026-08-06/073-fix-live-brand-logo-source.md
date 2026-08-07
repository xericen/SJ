# 운영 홈 로고 미반영 원인 수정 및 React 원본·WIZ 번들 영속 반영

- 날짜: 2026-08-06
- ID: 073
- 리뷰 ID: `ehvuwuaqzbuuivfbulswmeoygtmxcpqg`

## 사용자 원문

> “세종한바퀴” 옆 이모지와 로딩 표식을 신규 로고로 교체했습니다. 이거https://sj.wizide.com/home  웹으로 들어갔을 떄 수정 안됨.

## 원인

이전 작업은 생성된 WIZ 정적 번들의 CSS에만 로고를 추가했다. 이후 React 원본을 다시 빌드하면서 해당 번들이 교체되어 운영 화면에는 원래 농부 이모지가 다시 노출됐다.

## 변경 내용

- React 원본의 홈 브랜드, 체험 진입 로딩, 월드 로딩 표식을 실제 PNG `img` 요소로 교체했다.
- 공통 로고 이미지 스타일과 React 원본 파비콘 참조를 추가했다.
- 런타임 빌드 ID를 `20260806-brand-logo-source-v170`으로 갱신했다.
- React 프로덕션 번들을 다시 생성하고 WIZ 정적 자산과 동일하게 동기화했다.

## 변경 파일

- `react-app/src/pages/LandingPage.tsx`
- `react-app/src/App.tsx`
- `react-app/src/game/GameCanvas.tsx`
- `react-app/src/styles.css`
- `react-app/index.html`
- `react-app/src/runtimeBuild.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/`
- `devlog.md`
- `devlog/2026-08-06/073-fix-live-brand-logo-source.md`

## 확인 결과

- `npm run build` 성공
- 런타임 엔트리 테스트 6건 통과
- React `dist`와 WIZ 정적 자산 파일 해시 전체 일치
- WIZ 일반 빌드(`clean=false`) 성공
- 운영 `https://sj.wizide.com/home`에서 신규 엔트리 `index-C98BJJXB.js`와 빌드 ID `v170` 제공 확인
- 운영 엔트리의 홈·체험 로딩 브랜드와 WIZ 월드 로딩 청크가 모두 `/assets/brand/sejong-hanbakwi.png`를 사용하는 것을 확인

## 남은 리스크

- 이미 열려 있던 탭은 브라우저 메모리 캐시를 유지할 수 있어 강력 새로고침 또는 탭 재실행이 한 번 필요할 수 있다.
