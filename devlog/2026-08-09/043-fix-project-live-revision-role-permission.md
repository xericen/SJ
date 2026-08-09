# 프로젝트 역할 권한 및 아이디어 실시간 동기화 재수정

- **ID**: 043
- **날짜**: 2026-08-09
- **유형**: 버그 수정

## 작업 요약

브라우저 로컬 시각이 공용 초안보다 최신으로 계산돼 다른 사용자의 아이디어를 폐기하던 문제를 서버 revision 기반 동기화로 교체했다. 역할 편집은 팀장에게만 허용하고 서버도 비팀장 초안의 역할 변경을 보존하지 않도록 제한했다.

## 원문 요청사항

```text
프로젝트실에서 역할은 팀장만 정할 수 있게 해주고, 아이디어보드 실시간으로 다른 사람이 추가한 거 볼 수 있게해줘, 테마왐 먹거리도 동일하게 아이디어 추가하는 거 실시간으로 볼 수 있게해줘,  다시 확인하고 해줘라 좀,, 실시간으로 보여야하는데 안 보임
```

## 변경 파일 목록

- `react-app/src/components/ProjectRoomInteractions.tsx`: revision 기반 공용 초안 수신 및 팀장 전용 역할 UI
- `src/app/page.home/api.py`: 초안 revision 증가, 동시 아이디어 병합, 비팀장 역할 변경 차단
- `src/app/page.home/socket.py`: 프로젝트 아이디어 이벤트를 프로젝트 방 전체에 전송
- `react-app/scripts/verifyMultiplayer.ts`: 두 클라이언트 장소·테마·축제·먹거리 실시간 검증
- `react-app/scripts/reviewOpsRegression.test.ts`: 권한 및 revision 회귀 검사
- `src/app/page.home/view.pug`: 운영 iframe 빌드 식별자 갱신
- `src/assets/jochwon-app/`: 운영 프로덕션 번들 갱신

## 검증 결과

- 두 독립 Socket.IO 클라이언트의 장소·테마·축제·먹거리 아이디어 실시간 수신 검증 통과
- TypeScript 및 WIZ Python 문법 검사 통과
- ReviewOps 회귀 테스트 통과
- React 프로덕션 빌드와 성능 예산 검사 통과
- WIZ 클린 빌드 및 운영 정적 번들 HTTP 200 확인
