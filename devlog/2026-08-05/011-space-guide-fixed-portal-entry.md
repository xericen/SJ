# 공간 안내 16개 월드의 포털 기준 고정 진입 적용

## 사용자 원문 요청

> 공간안내에서 각 맵들 입장하기 누르면 그 맵에 있는 포탈위치에서 시작하게 해줘. 그 값을 고정으로 나 뿐만 아니고 다른 사용자들도 다 그렇게 갈 수 있게 해줘

## 원인

- 공간 안내 진입 좌표가 월드별 임의 시작점으로 `App.tsx`에 중복 정의되어 포털 위치와 일치하지 않았다.
- 여러 월드의 포털이 `positionEditable`과 브라우저 `localStorage`를 사용해 사용자마다 다른 위치로 표시될 수 있었다.

## 변경 내용

- 공간 안내에 노출되는 16개 월드의 대표 포털 좌표를 `worldGuideEntryPoints.ts`에 단일 값으로 정의했다.
- 공간 안내의 `입장하기`와 `맵 구경하기`가 모두 대표 포털에서 월드 안쪽으로 140px 떨어진 안전 진입점을 사용하도록 변경했다.
- 포털 재진입이 즉시 발생하지 않도록 입장 방향을 월드 중심 쪽으로 고정했다.
- 렌더러의 대표 포털도 같은 공통 좌표를 사용하고, 사용자별 로컬 위치 편집값을 사용하지 않도록 고정했다.
- 새 빌드 ID `20260805-space-guide-portal-entry-v22`를 적용하고 WIZ 정적 자산을 최신 빌드와 동기화했다.

## 변경 파일

- `react-app/index.html`
- `react-app/src/App.tsx`
- `react-app/src/game/worldGuideEntryPoints.ts`
- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/`
- `devlog.md`
- `devlog/2026-08-05/011-space-guide-fixed-portal-entry.md`

## 확인 결과

- 16개 월드 모두 포털과 진입점 사이의 안전거리 140px 및 월드 안쪽 방향을 자동 검증
- `npm run build` 성공
- WIZ `main` 프로젝트 일반 빌드 성공
- 운영 환경의 로그인 상태 공간 안내에서 `축제 부스 입장하기`를 실행해 포털 앞 캐릭터 배치 및 게임 화면 렌더링 확인
- 브라우저 콘솔 애플리케이션 오류 없음
- React 빌드 산출물과 WIZ 정적 자산의 완전 일치 확인

## 남은 리스크

- 향후 GLB에서 포털 위치를 변경할 때는 `WORLD_GUIDE_PORTAL_POSITIONS` 공통 좌표도 함께 갱신해야 한다.
