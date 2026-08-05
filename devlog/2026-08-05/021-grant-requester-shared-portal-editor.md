# 요청자 전용 전체 맵 포탈 권한 및 WIZ 공용 저장 연결

- **ID**: 021
- **날짜**: 2026-08-05
- **유형**: 버그 수정

## 작업 요약

WIZ 카카오 로그인과 별도 Node 세션 사이의 권한 단절로 포탈 편집 권한이 전달되지 않던 문제를 수정했다. 요청자 카카오 계정에 `portal_editor` 전용 역할을 부여하고, WIZ 인증 세션으로 검증되는 공용 포탈 저장·조회 API와 클라이언트 동기화를 연결했다.

## 원문 요청사항

```text
남은 리스크
모든 사용자에게 변경 위치를 저장·공유하려면 운영 실시간 서버 재배포와 요청자 계정의 portalEditor 권한 설정이 필요합니다. 현재 화면에서 포탈을 옮기는 동작 자체는 수정됐습니다. 나한테 이 권한을 주고, 내가 현재 각 맵들 포탈 위치를 바꾸려고 하는데 안됨 해결해줘..
```

## 변경 파일 목록

- `src/model/db/world_portal_layout.py`: 30개 공용 포탈 좌표 레이아웃 저장 모델 추가
- `src/model/struct.py`: 공용 포탈 레이아웃 테이블 초기화 등록
- `src/app/page.home/api.py`: WIZ 세션 기반 편집 권한 확인 및 공용 좌표 조회·저장 API 추가
- `react-app/src/services/worldPortalPositions.ts`: 공용 포탈 API 클라이언트 추가
- `react-app/src/App.tsx`: 공간 안내 입장 시 WIZ 공용 좌표 우선 적용
- `react-app/src/game/GameCanvas.tsx`: 현재 위치 저장 및 접속 사용자 주기 동기화 연결
- `react-app/src/pages/GamePage.tsx`: WIZ 권한 결과에 따른 전체 맵 편집 버튼 표시
- `react-app/index.html`, `src/app/page.home/view.pug`: 운영 빌드 ID v33 갱신
- `src/assets/jochwon-app/`: 최신 React 운영 빌드 반영
- 운영 `user` 테이블: 유일한 카카오 계정 역할을 `portal_editor`로 변경

## 검증 결과

- Python 구문 검사 통과
- 클라이언트·서버 TypeScript 검사 통과
- React 운영 빌드 및 성능 예산 검사 통과
- WIZ 클린 빌드 성공
- 운영 API에서 비로그인 저장 403 차단 확인
- 요청자 권한 세션으로 포탈 저장 200 성공 및 `canEdit: true` 확인
- 비로그인 공용 조회에서 30개 포탈과 저장 좌표 재조회 확인
- 운영 정적 자산 v33 및 공용 포탈 API 클라이언트 반영 확인
