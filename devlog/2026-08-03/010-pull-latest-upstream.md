# GitHub 최신 공동캠퍼스·맞춤형 체험 기능 WIZ 동기화

- **ID**: 010
- **날짜**: 2026-08-03
- **유형**: 기능 동기화

## 작업 요약

GitHub `main` 브랜치의 최신 공동캠퍼스, 모집센터, 학생회관, 프로젝트 로비, 개인 공간 및 충녕 AI 변경을 현재 WIZ 프로젝트 구조에 병합했다.
원격 MongoDB 모델은 기존 배포 환경에 맞는 MySQL JSON 저장 모델로 변환하고, 최신 React 빌드 산출물을 WIZ 정적 자산에 동기화했다.

## 원문 요청사항

```text
현재 내가 https://github.com/LeeDoHyung760/JoChiWon-Communications 푸시했는데 최신버전으로 pull해줘.
```

## 변경 파일 목록

- `react-app/src/`, `react-app/shared/`: 최신 공동캠퍼스·맞춤형 체험 UI, 맵, 서비스 및 공유 타입 반영
- `react-app/server/src/`: 충녕 AI API·테스트 반영 및 모집 프로필 요청 MySQL 저장 호환 처리
- `react-app/scripts/`: 최신 공간 생성·렌더링 스크립트 반영
- `src/assets/jochwon-app/`: 최신 React 프로덕션 번들 동기화
- `devlog.md`, `devlog/2026-08-03/010-pull-latest-upstream.md`: 작업 이력 기록

## 확인 결과

- GitHub 원격 최신 커밋 `a2e9fb0` 병합
- React·Vite·Express 전체 빌드 성공
- 백엔드 자동 테스트 43개 통과
- 최신 `dist`와 WIZ 정적 자산 동기화 완료
- WIZ 프로젝트 일반 빌드 성공

## 남은 리스크

- 대형 3D 에셋과 500KB 초과 JavaScript·CSS 청크가 있어 초기 로딩과 캐시 용량 최적화가 필요하다.
- 실제 운영 MySQL 데이터와 로그인 세션을 이용한 신규 충녕 AI·모집 요청 흐름은 브라우저 수동 확인이 필요하다.
