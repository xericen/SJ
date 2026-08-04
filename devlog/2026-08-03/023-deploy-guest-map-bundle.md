# 최신 비로그인 맵 구경하기 번들을 WIZ 운영 자산에 배포

## 사용자 원문 요청

> 로그인 되어있지 않은데, 아직도 맵 입장하기 뜸, 실제로 너가 실행해봐봐 안 변했음

## 원인

- React 소스와 `react-app/dist`는 수정됐지만 WIZ 운영 화면이 제공하는 `src/assets/jochwon-app/`에는 이전 해시 번들이 남아 있었다.
- WIZ 일반 빌드는 React `dist`를 정적 자산 디렉터리에 자동 복사하지 않으므로 소스 빌드만으로는 운영 화면이 바뀌지 않았다.

## 변경 내용

- 배포 build ID를 `20260803-guest-map-v1`로 갱신해 기존 브라우저 캐시가 최신 진입점을 다시 받도록 했다.
- 최신 React 프로덕션 빌드 전체를 `src/assets/jochwon-app/`에 동기화했다.
- 이전 해시 빌드 산출물 9개를 제거해 React `dist`와 WIZ 정적 자산을 136개 파일로 일치시켰다.

## 변경 파일

- `react-app/index.html`
- `src/assets/jochwon-app/`
- `devlog.md`
- `devlog/2026-08-03/023-deploy-guest-map-bundle.md`

## 확인 결과

- `react-app`에서 `npm run build` 성공
- WIZ `main` 프로젝트 일반 빌드 성공
- 공개 `https://sj.wizide.com/assets/jochwon-app/index.html` 응답에서 build ID `20260803-guest-map-v1`과 최신 해시 `index-BC0f4kjb.js` 확인
- 공개 최신 해시 번들에서 `맵 구경하기`, `3D 맵 확인 후 구경하기` 문구 확인
- 공개 진입점 응답 `HTTP 200`, `cache-control: no-cache`, 최종 수정 시각 `2026-08-03 09:03:25 UTC` 확인
- `react-app/dist`와 `src/assets/jochwon-app` 파일 136개 및 내용 일치

## 남은 리스크

- 이미 열린 리뷰 iframe은 새 build ID를 처리하기 위해 한 번 새로고침될 수 있다.
