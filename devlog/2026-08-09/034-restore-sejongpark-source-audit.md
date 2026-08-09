# SejongPark 정식 원본 복구 및 운영 기능 회귀 감사

## 사용자 요청

새 세종호수공원 GLB를 정식 원본으로 복구하고 다른 기능의 회귀 여부를 확인한다.

## 변경 파일

- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/` 운영 번들

## 확인 결과

- 새 운영 GLB의 SHA-256이 정식 `SejongPark.glb`와 일치한다.
- 홈·공간안내·실제 월드가 동일한 새 GLB를 참조하도록 빌드했다.
- 공용 포탈·카메라 DB와 최근 동아리·모집·프로젝트·채팅 기능이 유지되는 것을 확인했다.
- React/Vite/TypeScript/서버 및 WIZ 빌드와 관련 회귀 검사를 완료했다.
