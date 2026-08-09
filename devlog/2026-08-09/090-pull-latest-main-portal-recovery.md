# GitHub 최신 main 복구 병합 및 포탈 운영 재배포

## 사용자 요청

GitHub `xericen/SJ`의 한 시간 전 최신 변경을 pull해 세종호수공원 포탈 위치 등 이전 배포로 되돌아간 기능을 복구한다.

## 변경 내용

- `origin/main`을 `420cb31`까지 fast-forward pull했다.
- pull 전 로컬 작업은 stash로 보존하고 이후 MySQL 동아리·프로젝트·채팅 보강분을 다시 병합했다.
- 원격의 세종호수공원 GLB, 포탈·맵·정부청사 UI 소스를 우선 복구했다.
- 주변 사용자 카드 레이어 보강과 최신 런타임 캐시 식별자를 유지했다.
- 최신 소스로 React와 WIZ 운영 번들을 다시 생성했다.

## 확인 결과

- 로컬 HEAD와 `origin/main`이 `420cb31`로 일치한다.
- 새 SejongPark GLB와 공용 포탈 5개 좌표를 확인했다.
- React·TypeScript·서버·WIZ 빌드 및 관련 포탈·채팅 회귀 검사를 수행했다.
