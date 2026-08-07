# 자연 맵 카메라 잠금 운영 정적 자산 반영 및 sj.wizide.com 검증

- 날짜: 2026-08-07
- 작업 ID: 019
- 리뷰 ID: rftazmwmdgilhtqsqmhtmxidaeroraqs

## 사용자 요청

> 운영 URL sj.wizide.com 배포 반영 검증은 하지 않았습니다. 로컬 빌드 기준 확인입니다. 왜 여기랑 연결 안되어있어? 서버 설정 해뒀는데

## 변경 사항

- 운영 URL이 이전 React 번들을 내려주던 원인을 확인했다.
  - `project/main/src/assets/jochwon-app/`에는 최신 빌드가 반영됐지만, 공개 서버가 참조하는 루트 `src/assets/jochwon-app/`와 `src/app/page.home/view.pug`는 이전 빌드 ID와 이전 번들을 유지하고 있었다.
- `react-app/src/runtimeBuild.ts` 빌드 ID를 `20260807-nature-bear-camera-publish-v203`으로 갱신했다.
- `project/main/src/app/page.home/view.pug`와 `src/app/page.home/view.pug`의 iframe `_build` 값을 `20260807-nature-bear-camera-publish-v203`으로 갱신했다.
- `react-app/dist/` 프로덕션 산출물을 `project/main/src/assets/jochwon-app/` 및 `src/assets/jochwon-app/`에 동기화했다.

## 변경 파일

- `react-app/src/runtimeBuild.ts`
- `project/main/src/app/page.home/view.pug`
- `project/main/src/assets/jochwon-app/`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/`

## 검증

- `npm run build` 성공.
- `diff -qr react-app/dist project/main/src/assets/jochwon-app` 차이 없음.
- `diff -qr react-app/dist src/assets/jochwon-app` 차이 없음.
- `wiz_project_build(clean=false)` 성공.
- 운영 정적 인덱스 `https://sj.wizide.com/assets/jochwon-app/index.html?_build=20260807-nature-bear-camera-publish-v203`에서 새 빌드 ID와 `assets/index-B2rWPnNy.js` 제공 확인.
- 운영 도메인에서 직접 진입해 1440x900 캡처로 확인:
  - `previewMap=garden`: 국립세종수목원 맵 렌더링 및 카메라 조절 패널 미노출 확인.
  - `previewMap=bear-tree-park`: 베어트리파크 맵 렌더링 및 카메라 조절 패널 미노출 확인.
  - `previewMap=bear-play-zone`: 곰 체험소 맵 렌더링 및 카메라 조절 패널 미노출 확인.

## 남은 리스크

- 운영 `/home`은 Angular 셸이 클라이언트에서 iframe을 구성하므로, HTTP 본문 grep만으로 iframe src를 직접 확인하기는 어렵다. 대신 같은 운영 도메인의 실제 React 정적 인덱스와 세 맵 진입 화면을 브라우저 캡처로 확인했다.
