# ReviewOps 런타임·채팅·장소·정부청사 보강

## 사용자 원문 요청

리뷰 `smmmgeiqkxuoqcguvcokxvfbfzirqqtl`에서 전체 채팅 띄어쓰기 허용, 정부청사 더미 추천 제거와 단일 프롬프트 확인, 프로젝트실 카카오 장소 검색·모집글 키오스크 분리·전원 합의 완료, 로그인/게스트 전환 시 런타임 캐시 초기화, 1:1 추천의 `지도보기` 및 카카오맵 연결, 장소 선택 제거, 관련 AI 프롬프트 재확인과 운영 배포를 요청했다.

## 변경 파일

- `react-app/src/game/GameCanvas.tsx`
- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/src/pages/GamePage.tsx`
- `react-app/src/App.tsx`
- `react-app/src/services/accountData.ts`
- `react-app/src/components/DirectRecommendation.tsx`
- `react-app/src/components/ProjectRoomInteractions.tsx`
- `react-app/server/src/services/ai/governmentCourse.ts`
- `react-app/server/src/routes/api.ts`
- `react-app/scripts/reviewOpsRegression.test.ts`
- `src/app/page.home/api.py`
- `src/app/page.home/socket.py`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/index.html`

## 원인 및 조치

- Phaser의 전역 키 캡처와 Three.js 키 처리의 contenteditable/IME 예외 누락을 해제했다. 전송 시 `trim()`은 앞뒤에만 적용되고 내부 공백은 유지된다.
- 로그아웃·게스트 나가기에서 계정 범위 local/session cache와 Socket.IO 연결을 함께 정리한다. GameCanvas unmount가 Phaser scene, physics object, Three.js renderer와 listener를 파기한다.
- 운영 프로젝트 장소 검색을 WIZ Kakao Local API로 연결하고 인증, 키 누락, upstream/CORS, 0건 오류를 분리했다.
- 1:1 추천 결과의 동작을 `지도보기`로 통일하고 Kakao `place_url`을 우선 사용한다.
- 정부청사 코스의 규칙 기반 가짜 fallback을 제거하고 `GOVERNMENT_COURSE_RECOMMENDER_PROMPT` 하나만 사용하며 실제 Kakao 후보 2~4곳만 허용했다.
- 기존 1:1·충녕이 장소 추천, 식물 감정 기록, 학생회관 친구 추천 경로가 서버 프롬프트/도구와 연결된 상태임을 재확인했다.

## 검증

- `오늘 세종 어디 갈까?` 내부 공백 보존 regression test 통과
- ReviewOps regression 3건 통과
- OpenAI·Kakao provider 실제 요청 성공, Kakao 검색 결과 15건 확인
- React/Vite/TypeScript/Express 빌드와 성능 예산 검사 통과
- WIZ 일반 빌드 성공 및 운영 URL에서 신규 `index-BLDFnyeg.js` 응답(HTTP 200) 확인
- 기존 campus portal regression은 13건 중 9건 통과, 문자열 포맷을 고정한 4건 실패
- 실제 다중 계정 브라우저 시나리오는 이 환경에 로그인 계정이 없어 자동 실행하지 못했다.
