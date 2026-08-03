# GitHub 최신 변경 WIZ 동기화

## 사용자 요청

> 깃에 새로 커밋해놨는 데 다 가져와줘 최신으로, 현재 로그인 하는 것도 깃에서 다 안 가져온 거 같음.

## 변경 내용

- GitHub `origin/main`의 최신 커밋까지 fetch하고 로컬 `main`에 병합했다.
- WIZ 통합 과정에서 이동된 React 원본 경로를 고려해 최신 `LandingPage` 변경과 GLB 맵 5개를 `react-app/` 원본에 반영했다.
- 최신 React 소스로 Vite 번들을 다시 만들고 `src/assets/jochwon-app/`을 새 산출물로 동기화했다.
- 기존 WIZ 통합과 MySQL 백엔드 변경은 별도 로컬 커밋으로 보존한 뒤 병합했다.

## 변경 파일

- `react-app/src/pages/LandingPage.tsx`
- `react-app/src/assets/maps/club-street-festival-map.glb`
- `react-app/src/assets/maps/government-central-plaza.glb`
- `react-app/src/assets/maps/observatory-interior.glb`
- `react-app/src/assets/maps/project-room.glb`
- `react-app/src/assets/maps/sejong-smartcity-exhibition.glb`
- `src/assets/jochwon-app/`
- `devlog.md`
- `devlog/2026-08-03/004-sync-latest-github-into-wiz.md`

## 확인 결과

- 로컬 Git 이력에 `origin/main` 최신 커밋 포함 확인
- React·Vite·Express 전체 빌드 성공
- 백엔드 자동 테스트 41개 통과
- React `dist`와 WIZ 정적 번들의 파일 수 및 엔트리 파일 일치 확인
- WIZ `main` 프로젝트 일반 빌드 성공

## 남은 사항

- 최신 GLB 중 일부는 10~45MB로 커져 초기 로딩 속도와 전송량 최적화가 필요하다.
- 원격 변경을 WIZ 구조에 맞춰 재배치했으므로 로컬 브랜치는 원격보다 추가 통합 커밋만큼 앞선 상태다.
