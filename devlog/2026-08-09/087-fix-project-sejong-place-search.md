# 프로젝트 장소 검색 전용 카카오 Local API 복구

- 사용자 요청: 프로젝트실에서 `세종시 안에서 일치하는 장소를 찾지 못했어요`만 표시되는 장소 검색 오류 해결
- 변경 파일: `src/route/sejong-place-search/app.json`, `src/route/sejong-place-search/controller.py`, `src/app/page.home/view.pug`, `react-app/src/components/ProjectRoomInteractions.tsx`, `react-app/src/runtimeBuild.ts`, 운영 정적 번들
- 변경 내용: 설정 상태 API를 장소 결과로 오인하던 호출을 제거하고, 로그인 사용자 전용 서버 측 카카오 Local 검색 라우트를 연결했다. 세종특별자치시 주소 결과만 반환한다.
- 검증 결과: React·서버·WIZ 빌드와 성능 검사를 통과했다. WIZ 서비스를 갱신한 뒤 운영 전용 경로가 홈 HTML 대신 JSON 401을 반환해 라우팅 및 인증 적용을 확인했다.
