# 프로젝트 장소 검색 전용 카카오 Local API 복구

- 사용자 요청: 프로젝트실에서 `세종시 안에서 일치하는 장소를 찾지 못했어요`만 표시되는 장소 검색 오류 해결
- 변경 파일: `src/route/sejong-place-search/app.json`, `src/route/sejong-place-search/controller.py`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/**`
- 변경 내용: 로그인 사용자 전용 서버 측 카카오 Local 검색 라우트를 추가하고 프로젝트 장소 검색 UI를 해당 경로에 연결했다. 세종특별자치시 주소 결과만 반환한다.
- 검증 결과: React·서버·WIZ 빌드와 성능 검사를 통과했다. WIZ 서비스를 갱신한 뒤 운영 전용 경로가 JSON 인증 응답을 반환하는 것을 확인했다.
