# ReviewOps 미리보기 보존 후 최신 프로젝트·동아리 경험 병합

- **ID**: 001
- **날짜**: 2026-08-04
- **유형**: 기능 동기화

## 작업 요약

ReviewOps에서 추가한 비회원 맵 미리보기와 WIZ 진입 복구 변경을 먼저 커밋으로 보존했다.
이후 GitHub `main`의 최신 프로젝트룸·동아리 거리 경험 연동을 `react-app/` 구조에 병합하고 신규 동아리 모델을 기존 MySQL 저장소에 맞게 변환했다.

## 원문 요청사항

```text
현재 내가 https://github.com/LeeDoHyung760/JoChiWon-Communications 푸시했는데 최신버전으로 pull해줘. 현재 내가 리뷰옵스에서 수정한거는 두고, 그 이후만 병합해주면 돼
```

## 변경 파일 목록

- `react-app/src/`: 프로젝트룸·동아리 거리 연동 UI, 완료 화면, 지붕 표지, 브리지 서비스 반영
- `react-app/server/src/`: 프로젝트 장소 추천, 동아리 API·소켓 반영 및 동아리 MySQL 모델 추가
- `react-app/shared/socket-events.ts`: 프로젝트룸 인스턴스 실시간 이벤트 반영
- `react-app/src/assets/maps/club-street-festival-map.glb`: 최신 동아리 거리 맵 반영
- `src/assets/jochwon-app/`: 최신 React 프로덕션 번들 동기화
- `devlog.md`, `devlog/2026-08-04/001-merge-project-club-experience.md`: 작업 이력 기록

## 확인 결과

- GitHub 원격 최신 커밋 `53c71c2` 병합
- React·Vite·Express 전체 빌드 성공
- 백엔드 자동 테스트 43개 통과
- React `dist`와 WIZ 정적 자산 136개 파일 일치
- WIZ 프로젝트 일반 빌드 성공

## 남은 리스크

- 일부 JavaScript 청크와 대형 3D 동아리 거리 에셋으로 초기 로딩 최적화가 필요하다.
- 프로젝트룸 인스턴스와 동아리 활동 연동은 다중 사용자 브라우저 환경에서 최종 수동 확인이 필요하다.
