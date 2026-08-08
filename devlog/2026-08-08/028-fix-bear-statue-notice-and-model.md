# 곰 급여 완료 알림 연결 및 베어트리 곰동상 GLB 노드 설치

- 원 요청: 먹이 5개 완료 시 마이홈 곰동상 설치 문구를 표시하고 `new-beartree.glb`의 `tripo_node_663ac3ae-202d-4035-bde3-3b143688b477` 곰동상을 집 옆에 설치.
- 변경 파일: `react-app/src/game/GameCanvas.tsx`, `react-app/src/pages/GamePage.tsx`, `react-app/src/services/bearStatueAssetFactory.ts`.
- 변경 내용: 급여 완료 콜백을 GamePage 알림 스택까지 연결하고, 기존 임의 bear 모델 대신 지정 GLB 노드를 로드하며 원본 재질을 유지.
- 확인: React 빌드 및 WIZ 배포 후 운영 index/해시 번들에서 변경 문자열과 bridge 응답을 확인.
