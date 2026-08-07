# React Hook 순서 오류 수정 및 WIZ 재배포

- 사용자 요청: 운영 번들에서 발생한 Minified React error #310을 수정한다.
- 원인: GreenhouseExperience의 식물 관심사 초기화 useEffect가 비활성 상태의 조건부 return 아래에 있어 렌더링 상태에 따라 Hook 호출 순서가 달라졌다.
- 변경 파일: react-app/src/components/GreenhouseExperience.tsx, 배포 정적 자산 src/assets/jochwon-app/.
- 변경 내용: 관심 식물 useEffect를 조건부 return보다 위로 이동해 모든 렌더에서 동일한 Hook 순서를 보장했다.
- 확인: 자연·포탈 정적 테스트 12개 통과, React/Vite 빌드 및 성능 검사 통과, git diff --check, WIZ main 프로젝트 빌드 성공.
