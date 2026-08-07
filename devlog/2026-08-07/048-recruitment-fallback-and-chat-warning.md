# 모집 동기화·충녕 API fallback 경고 제거 및 모집글 저장 보강

- 사용자 요청: `recruitment sync failed` JSON 파싱 오류와 충녕이 API 주소 오류를 해결하고 모집글 등록을 가능하게 한다.
- 원인: 운영 `/api/community`가 HTML fallback을 반환하고, 충녕이 API도 동일하게 연결되지 않아 예외 fallback 경로가 콘솔 경고를 출력했다. 모집센터 작성 폼은 API 실패 시 로컬 저장 fallback이 없었다.
- 변경 파일: `react-app/src/components/RecruitmentCenterDesk.tsx`, 배포 정적 자산 `src/assets/jochwon-app/`.
- 변경 내용: 모집 동기화에서 HTML·네트워크 실패를 로컬 데이터로 정상 처리하고 경고 로그를 제거했다. 충녕이 API 실패 시 로컬 규칙 추천으로 조용히 전환하며, 모집글 등록 실패 시 로컬 저장소와 모집 목록에 즉시 반영한다.
- 확인: React/Vite 빌드 및 성능 검사 통과, `git diff --check` 통과, WIZ `main` 프로젝트 빌드 성공.
