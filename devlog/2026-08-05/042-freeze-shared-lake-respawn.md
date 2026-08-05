# 세종호수공원 공용 리스폰 편집 제거 및 좌표 고정

- **ID**: 042
- **날짜**: 2026-08-05
- **유형**: 설정 변경

## 작업 요약

기존 공용 저장소의 세종호수공원 리스폰 좌표 `(1105, 711, 방향 0)`을 서비스 고정값으로 확정했다. 리스폰 저장 버튼과 클라이언트 저장 로직을 제거하고, 실시간 서버에서도 재설정 요청을 거부해 모든 참여자가 같은 위치에서 시작하도록 통일했다.

## 원문 요청사항

```text
세종호수 공원에 현재 위치로 리스폰하기 버튼이 있는데, 이미 현재 위치로 정해져 있는 리스폰으로 모든 참여자가 리스폰 지역으로 설정되어있다면, 현재 위치로 리스폰하는 버튼 없애주고, 아니라면 그 자리에서 모든 사용자가 동일하게 리스폰될 수 있게 수정해줘
```

## 변경 파일 목록

- `react-app/shared/socket-events.ts`: 세종호수공원 공용 리스폰 좌표를 `(1105, 711, 0)`으로 고정
- `react-app/src/services/respawnPosition.ts`: 네트워크 저장소 대신 공용 고정값 반환
- `react-app/src/pages/GamePage.tsx`: 리스폰 편집 버튼·상태·저장 처리 제거
- `react-app/server/src/index.ts`: 서버 시작 시 DB 값 대신 공용 고정값 적용
- `react-app/server/src/socket/registerSocketHandlers.ts`: 리스폰 변경 요청 차단
- `react-app/index.html`, `src/app/page.home/view.pug`: 운영 빌드 ID v38 갱신
- `src/assets/jochwon-app/`: 최신 React 운영 빌드 반영

## 검증 결과

- 클라이언트·서버 TypeScript 검사 통과
- React 운영 빌드 및 성능 예산 검사 통과
- WIZ 프로젝트 빌드 성공
- 운영 정적 자산 v38 반영 확인
- 운영 번들에서 리스폰 저장 버튼 문구 제거 확인
- 운영 번들에 고정 좌표 `(1105, 711, 0)` 포함 확인
