# 카카오 계정 프로필·체험 데이터 DB 원본 저장 및 복원

- 사용자 요청: "카카오로그인 사용자는 데이터베이스에 전부 정보 저장해야지 왜 캐시로 프로필을 저장해"
- 변경 파일:
  - `src/model/db/account_profile_snapshot.py`
  - `src/model/db/account_data_snapshot.py`
  - `src/model/struct.py`
  - `src/model/struct/user.py`
  - `src/app/page.home/api.py`
  - `react-app/src/services/accountData.ts`
  - `react-app/src/App.tsx`
- 처리 내용:
  - 카카오 계정 프로필을 아바타 설정 값과 분리한 `account_profile_snapshot` DB 테이블에 저장한다.
  - 체험·활동 관련 계정 로컬 데이터를 `account_data_snapshot` DB 테이블에 계정 ID별로 저장하고 로그인 시 복원한다.
  - 로그인 중 4초 간격, 페이지 종료, 게스트 전환 및 로그아웃 직전에 서버 동기화를 수행한다.
  - 회원 탈퇴 시 두 계정 스냅샷도 함께 삭제한다.
- 검증:
  - Python 문법 검사 통과.
  - React TypeScript·프로덕션 빌드·성능 검사 통과.
