# GitHub 최신 main 복구 병합 및 포탈 운영 재배포

## 사용자 요청

GitHub `xericen/SJ` 최신 변경을 pull해 세종호수공원 포탈 위치와 이전 배포로 되돌아간 기능을 복구한다.

## 변경 파일

- GitHub `origin/main`의 WIZ `src/` 전체 최신 소스
- `src/app/page.home/api.py`, `socket.py`, `view.pug`
- `src/model/db/realtime_direct_*`
- `src/assets/jochwon-app/` 최신 React 운영 번들

## 확인 결과

- 원격 커밋 `420cb31`을 fast-forward pull하고 이후 MySQL 협업 보강분을 병합했다.
- 세종호수공원 새 GLB와 포탈 5개 확정 좌표를 확인했다.
- React·TypeScript·서버·WIZ 빌드 및 운영 자산 응답을 확인했다.
