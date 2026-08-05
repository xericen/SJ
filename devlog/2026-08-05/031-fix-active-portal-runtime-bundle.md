# 실제 운영 번들의 세종호수공원 포탈 충전 중단 수정

## 사용자 원문 요청

> 포탈 위치 가만히 서있는데, 1,2, 하고 걍 꺼져버림 이 부분 해결해줘, 그리서 현재 세종호수 공원 맵에서 다른 맵으로 이동할 수가 없음.

## 원인

- 운영 `index.html`은 기존 소스 번들이 아닌 `index-nameplate-v47.js` → `GamePage-nameplate-v47.js` → `WorldEngine-nameplate-v47.js` 해시 체인을 실행하고 있었습니다.
- 앞선 포탈 수정은 비활성 `GamePage-vnOFqgno.js`에만 반영되어 실제 브라우저 런타임에는 적용되지 않았습니다.

## 변경 파일

- `src/assets/jochwon-app/assets/WorldEngine-portal-v49.js`
  - 실제 런타임 엔진을 새 캐시 키로 복제하고 5개 포탈의 진입 반경을 140으로 확대했습니다.
  - 최초 포탈 충전 대상을 완료 시점까지 고정해 1~2초 후 근접 판정이 해제되지 않게 했습니다.
  - 프레임 누적이 아닌 실제 경과 시간으로 정확히 3초를 측정합니다.
- `src/assets/jochwon-app/assets/GamePage-portal-v49.js`
  - 새 월드 엔진 번들을 참조하는 캐시 갱신 번들을 생성했습니다.
- `src/assets/jochwon-app/assets/index-portal-v49.js`
  - 새 GamePage와 월드 엔진을 불러오는 엔트리 번들을 생성했습니다.
- `src/assets/jochwon-app/index.html`, `src/app/page.home/view.pug`
  - 실제 실행 엔트리와 iframe 빌드 ID를 `v49`로 전환했습니다.

## 검증 결과

- 로컬 및 운영 URL에서 새 엔트리 → GamePage → WorldEngine 연결을 확인했습니다.
- 5개 포탈의 3초 설정과 고정 충전 로직을 자동 검증했습니다.
- JavaScript 구문 검사와 WIZ 프로젝트 일반 빌드를 통과했습니다.
