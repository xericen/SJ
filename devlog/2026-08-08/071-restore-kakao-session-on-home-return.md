# 카카오 로그인 성공 쿼리 유실 시 서버 세션으로 프로필 생성 흐름 복구

- 원본 요청: 카카오로그인하면 -> 프로필 생성으로 넘어갔음, 근데 현재 카카오로그인하면 홈화면 즉 로그인이 안됨. 이 부분 해결해줘 제발.. 다른건 건들이지말고 이것만 해주라
- 리뷰 ID: ryiqkvrfnnzenehhisukfuqipechlhcb
- 변경 파일: `react-app/src/App.tsx`, `react-app/src/services/accountProfile.ts`, `react-app/src/runtimeBuild.ts`, `react-app/scripts/localSocialAuth.test.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/index.html`, `src/assets/jochwon-app/assets/*`, `devlog.md`, 본 상세 기록
- 변경 내용: 카카오 인증 뒤 성공 쿼리가 사라지고 `/home`이 다시 열려도 WIZ 서버 세션을 조회해 로그인 상태를 복구하도록 보강했다. 저장 프로필이 없으면 프로필 생성 1단계로 이동하고, 기존 프로필이 있으면 기존 완료 흐름을 유지한다. 명시적 로그아웃 때 서버 세션도 종료해 자동 복구 부작용을 차단했다.
- 확인: 소셜 인증 테스트 4개와 런타임·메시지 테스트 8개 통과, React 프로덕션 빌드 및 WIZ `main` 일반 빌드 성공. 운영 엔트리에서 신규 빌드 ID·`/wiz/api/page.home/me` 세션 복구 코드 확인, 프로필 생성 청크 HTTP 200 확인.
- 남은 리스크: 실제 카카오 QR 인증 입력은 사용자 계정과 휴대폰이 필요해 자동화 환경에서 대신 완료하지 못했으며, 인증 이후 서버 세션 복구 경로를 모의 테스트와 운영 배포 코드로 검증했다.
