# 원격 개인 팜 생태 미션 병합 및 MySQL·WIZ 연동

## 사용자 요청

> https://github.com/LeeDoHyung760/JoChiWon-Communications 여기에 새로 푸시되어있는데, pull해줘. 내가 만든거는 수정하지말고 그 위에 새로운 거 병합해주는 느낌으로! - 개인 팜 진행도 MongoDB 모델/API -> my sql로 변경
> - 수목원 꽃 수집
> - 개인 팜 꽃 심기
> - 베어트리파크 먹이 수집
> - 먹이 지점 완료
> - 개인 팜 보상 표시 연결
> - 관련 클라이언트 API/미션 UI
> - 꽃 미션 설정
> - 개인 팜 곰 모델 자산

## 변경 내용

- 기존 ReviewOps 변경 88개 파일을 체크포인트 커밋 `381388a`로 먼저 보존했다.
- 원격 `upstream/main`의 신규 커밋 `92acc2c`을 병합 이력으로 연결하고 React 원본 아래에 개인 팜 변경분을 적용했다.
- 기존 WIZ 공용 포털, 고정 호수 리스폰, 맵 미리보기, 로컬·소셜 로그인 분리, AI 연구소 렌더링은 유지했다.
- Mongoose 개인 팜 모델을 Express `mysql2` JSON 문서 어댑터의 `personal_farm_progress` collection으로 변경했다.
- WIZ MySQL용 `personal_farm_progress` Peewee 모델과 API를 추가하고 회원 탈퇴 시 연관 진행도도 삭제하도록 했다.
- 수목원 꽃 수집, 개인 팜 꽃 심기, 베어트리파크 먹이 수집·5개 먹이 지점, 보상 해금·표시를 연결했다.
- 개인 팜 코티지 GLB, 곰 FBX, 수목원·베어트리파크·개인 팜 포털을 공용 좌표에 추가했다.
- 빌드 성능 예산이 GLB뿐 아니라 FBX도 25 MiB 한도로 검사하도록 확장했다.
- README의 기능, 데이터 모델, API, 자산 예산 설명을 갱신했다.
- 런타임 빌드 ID를 `20260805-personal-farm-mysql-v76`으로 올리고 WIZ 정적 번들 142개를 동기화했다.

## 주요 변경 파일

- `react-app/server/src/models/PersonalFarmProgress.ts`
- `react-app/server/src/routes/personalFarm.ts`
- `react-app/server/src/services/personalFarmProgressService.ts`
- `react-app/server/src/services/personalFarmProgressService.test.ts`
- `react-app/src/components/PersonalFarmProgressExperience.tsx`
- `react-app/src/services/personalFarmApi.ts`
- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/shared/personal-farm.ts`
- `react-app/shared/world-portals.ts`
- `src/app/page.home/api.py`
- `src/model/db/personal_farm_progress.py`
- `src/model/struct/user.py`
- `README.md`

## 확인 결과

- React·Vite·Express 전체 빌드 성공
- 백엔드 전체 테스트 58개 통과
- 개인 팜 MySQL 계정 격리·중복 방지·미션 완료·보상 해금·인증 위조 방지 9개 테스트 통과
- 캐릭터, 온실, 온실 AI, 포털, 카메라, `postMessage`, 런타임 엔트리, 다중 사용자 검증 통과
- Python 구문 검사 및 WIZ 클린 빌드 성공
- 실제 MySQL `sj_hackathon.personal_farm_progress` 테이블 생성·조회 성공
- WIZ 배포 자산 142개 일치, `/home`·런타임 엔트리·곰 FBX HTTP 200
- 성능 예산 통과: 초기 엔트리 286 KiB, 최대 JS gzip 310 KiB, 최대 3D 자산 21.64 MiB

## 남은 확인

- 실행 중인 WIZ 앱 프로세스가 이전 Python API 모듈을 유지하고 있어 `personal_farm_progress` 운영 API는 프로세스 재시작 후 최종 확인이 필요하다.
- 현재 컨테이너에는 systemd가 없어 `wiz service restart app`을 실행할 수 없었다.
