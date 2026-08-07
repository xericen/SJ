# 최신 해커톤 변경·README·WIZ 번들 GitHub 게시

- **ID**: 005
- **날짜**: 2026-08-07
- **유형**: 문서·배포
- **리뷰 ID**: cwbbogxjkwzznuzsqgvyayjbjbpacqgg

## 작업 요약

ReviewOps에서 누적된 홈 화면 비율 복구, 1320×880 데스크톱 캔버스, 곰 급여·보상 자산 변경을 보존해 공개 저장소 게시 범위로 정리했다. 해커톤 README에는 최신 심사 화면 정책과 베어트리파크 5회 순차 급여·마이홈 보상 동선을 반영하고, WIZ 정적 폴더는 최종 Vite 빌드와 정확히 일치하도록 이전 중간 해시 파일을 제거했다.

## 원문 요청사항

```text
https://github.com/xericen/SJ 여기에 지금까지 한 거 git에 커밋하고 푸시해줘, 아마 많이 바꼈을텐데 db나 등등 그런 것들 다 변경해서 올려주면 돼. readme도 새로 작성해줘 (해커톤용으로 올려주면 됨)
```

## 변경 파일 목록

- `README.md`: 최신 해커톤 심사 포인트, 고정형 데스크톱 캔버스와 곰 생태 미션 동선 문서화
- `react-app/src/pages/LandingPage.css`: 홈 데스크톱 화면의 1320×880 기준 비율과 반응형 처리
- `react-app/scripts/desktopPageLayout.test.ts`: 홈 캔버스 비율 회귀 검증
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/app/page.home/view.scss`: 최신 런타임 식별자와 WIZ 전체 높이·iframe 표시 연결
- `react-app/src/assets/characters/bear.glb`: 곰 급여·마이홈 보상에 사용하는 통합 곰 모델
- `src/assets/jochwon-app/`: 최종 React 프로덕션 산출물과 일치하는 WIZ 배포 번들
- `devlog.md`, `devlog/2026-08-07/002-*.md` ~ `005-*.md`: 누적 변경과 게시 작업 기록

## 확인 결과

- React·Express 전체 빌드 및 성능 예산 통과
- Express 백엔드 테스트 70개 통과, 실제 MySQL 연결과 사용자별 진행도 격리 확인
- 데스크톱 레이아웃 테스트 3개 및 런타임 엔트리 테스트 6개 통과
- React `dist`와 WIZ `src/assets/jochwon-app` 전체 파일 일치
- WIZ 일반 빌드(`clean: false`) 성공
- 운영 `/home`, 정적 index와 최신 JavaScript 엔트리 HTTP 200
- 생성 번들 제외 Git 공백 검사, 비밀정보 패턴 및 40 MiB 초과 신규 파일 검사 통과

## 남은 리스크

- 900px 이하 화면은 별도 반응형 레이아웃이 적용되므로 실제 모바일 기기별 육안 검증이 필요하다.
- 외부 AI·카카오·공공데이터 기능은 운영 키와 제공기관 상태의 영향을 받는다.
- Express·Socket.IO 실시간 기능은 별도 Node 프로세스와 WebSocket 프록시가 정상 가동되어야 한다.
