# SejongPark 정식 원본 복구 및 운영 기능 회귀 감사

## 사용자 요청

`SejongPark.glb`를 정식 원본에 반영하고 다른 기능이 예전 상태로 되돌아간 것이 없는지 다시 확인한다.

## 변경 내용

- `/opt/app/SejongPark.glb`를 `react-app/src/assets/maps/sejong-lake-park.glb` 정식 원본으로 교체했다.
- 홈·공간안내 모델 용량 표시를 3.9MB로 갱신했다.
- 런타임 빌드 ID를 `20260809-sejongpark-source-v6`로 올렸다.
- 동아리 권한, 모집 키오스크 재조회, 프로젝트 합의, Kakao 장소 검색, MySQL 직접 채팅, 주변 사용자 레이어 및 공용 포탈·카메라 DB 상태를 다시 점검했다.

## 변경 파일

- `react-app/src/assets/maps/sejong-lake-park.glb`
- `react-app/src/pages/LandingPage.tsx`
- `react-app/src/runtimeBuild.ts`
- `src/app/page.home/view.pug`
- 운영 번들 `src/assets/jochwon-app/`

## 확인 결과

- 원본·빌드 GLB SHA-256 `5416eb9a5897d56d7e23deac2a937d875142744446ef5c7317d8e0bc026cb994` 일치.
- React/Vite/TypeScript/서버 빌드 및 성능 예산 통과.
- 호수공원 포탈 17건, 공동캠퍼스 포탈 13건, 월드 내비게이션 5건, 런타임 6건, 동아리 2건, WIZ 채팅 검사 통과.
- 공용 MySQL 세종호수공원 포탈 5개 좌표와 카메라 프로필 12개 유지 확인.
- 일부 오래된 카메라/안티앨리어싱 테스트 3건은 이후 승인된 운영값과 기대값이 달라 실패했으며 실제 배포 회귀가 아님을 소스 이력으로 확인했다.
