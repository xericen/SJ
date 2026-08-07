# 공동캠퍼스 포탈과 이름표를 기존 크기의 2/3로 축소

- **ID**: 093
- **날짜**: 2026-08-06
- **유형**: UX 개선
- **리뷰 ID**: ubhnpywyyudignpzxnhbzznfezhtzgax

## 작업 요약
공동캠퍼스의 모집센터, 프로젝트실 등 6개 이동 포탈을 기존 크기의 2/3로 축소했다. 이름표는 포탈 루트의 자식 요소이므로 같은 비율로 함께 축소되며, 이동 판정 범위와 고정 좌표는 유지했다. 매 프레임 실행되는 포탈 맥동 애니메이션이 축소 배율을 덮어쓰지 않도록 기준 배율에 맥동값을 곱하도록 수정했다.

## 원문 요청사항
```text
각 포탈 크기를 2/3정도 줄여주고,  이름표도 줄여줘. 모집센터, 프로젝트실 등등
```

## 변경 파일 목록
- `react-app/src/game/campusPortalVisual.ts`
  - 공동캠퍼스 전용 포탈 표시 배율(2/3) 정의
- `react-app/src/game/renderers/VillageMapRenderer.ts`
  - 공동캠퍼스 포탈 및 이름표에 축소 배율 적용
  - 포탈 맥동 애니메이션에서도 기준 축소 배율 유지
- `react-app/scripts/campusPortals.test.ts`
  - 6개 포탈의 표시 배율, 이름표 계층, 이동 판정 범위 유지 회귀 테스트 추가
- `react-app/src/runtimeBuild.ts`
  - 런타임 빌드 ID를 `20260806-campus-portals-two-thirds-v188`로 갱신
- `src/app/page.home/view.pug`
  - iframe 빌드 쿼리를 v188로 갱신
- `src/assets/jochwon-app/**`
  - v188 React 프로덕션 산출물 동기화
- `devlog.md`
  - 작업 요약 행 추가
- `devlog/2026-08-06/093-shrink-campus-portals.md`
  - 작업 상세 기록 추가

## 확인 결과
- `npm run test:campus-portals`: 12/12 통과
- `npm run test:world-portal-visual`: 3/3 통과
- `npm run test:runtime-entry`: 6/6 통과
- `npm run build`: 클라이언트 TypeScript, Vite, 성능 검사, 서버 TypeScript 빌드 성공
- React `dist`와 WIZ 정적 자산 142개 동기화 확인
- WIZ 일반 빌드(`clean: false`) 성공
- 운영 홈과 v188 정적 엔트리가 HTTP 200으로 제공되는 것을 확인

## 남은 리스크
- 리뷰 스크린샷이 없어 실제 화면의 체감 크기는 수치와 렌더링 구조를 기준으로 검증했다.
- 이름표도 정확히 2/3로 축소되어 화면 해상도에 따라 글자가 작게 느껴질 수 있다.
