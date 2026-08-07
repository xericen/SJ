# 동아리 생성 HTML 응답 JSON 파싱 오류 보완

- 원본 요청: `새 동아리 만들기 누르면 Unexpected token '<', "<!DOCTYPE "... is not valid JSON 이게 떠 오류 해결해줘`
- 변경 파일: `react-app/src/components/CampusCommunicationHub.tsx`, `react-app/scripts/campusClubApiFallback.test.ts`
- 변경 내용: `/api/clubs` 응답의 Content-Type을 확인한 뒤 JSON일 때만 파싱하고, WIZ HTML 응답 환경에서는 localStorage fallback으로 동아리 생성·목록을 처리한다.
- 확인: 운영 `/api/clubs`가 WIZ HTML을 반환하는 원인을 확인하고, JSON 응답 여부 및 fallback 정적 테스트를 추가한 뒤 WIZ 빌드·배포를 진행한다.
- 남은 리스크: API가 연결되지 않은 환경의 동아리 데이터는 현재 브라우저에만 저장되며 다른 사용자와 공유되지 않는다.
