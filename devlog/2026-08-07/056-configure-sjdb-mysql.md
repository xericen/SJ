# 056 WIZ·Express DB를 sjdb MySQL 서비스와 sj_hackathon 스키마로 통일

- 요청: `sjdb.zcs-jenqqybjaftn.svc.cluster.local` / `172.21.30.86` MySQL에 사용자 계정으로 연결.
- 확인: 지정 서비스에 TCP·MySQL 인증이 성공했고, 서버의 실제 스키마 목록에서 `sj_hackathon`은 존재하지만 `sjdb`는 존재하지 않았다.
- 변경 파일: `config/database.py`, `bundle/config/database.py`, `react-app/server/.env`.
- 변경 내용: WIZ `base`·`post` 저장소를 모두 MySQL로 전환하고, WIZ 및 Express 연결 호스트를 Kubernetes 서비스 DNS로 지정했다. 실제 존재하는 `sj_hackathon` 스키마를 사용하도록 설정했다.
- 확인: `SELECT DATABASE(), @@hostname`이 `sj_hackathon` 및 `sjdb-64b555d95f-ztvmg`를 반환, Express `npm run typecheck` 통과, WIZ `main` 프로젝트 빌드 성공.
