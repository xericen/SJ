# 베어트리파크 관찰·서식 조사 지점 및 마이홈 포탈 제거

- **ID**: 068
- **날짜**: 2026-08-05
- **유형**: UX 정리
- **리뷰 ID**: fcxythrwehrrelwteeqgegazjvkxooaz

## 사용자 요청

> 베어트리파크에 있는 대표곰 관찰, 서식 환경 설계 조사, 먹이 구역 곰 관찰, 서식 환경 설계 조사 다 없애줘, 개인팜으로 이동하는 포탈도 없애줘

## 변경 내용

- 베어트리파크 렌더러 설정에서 대표 곰 관찰과 먹이 구역 곰 관찰 지점을 제거했다.
- 같은 맵의 서식 환경 설계 조사 지점과 연결된 먹이 체험 앵커를 모두 제거해 표식·근접 상호작용·미션 카드가 나타나지 않도록 했다.
- 베어트리파크에서 마이홈으로 이동하는 포탈을 3D 렌더러와 공용 포탈 기본값에서 제거했다.
- WIZ 공용 포탈 키에서도 베어트리파크→마이홈 경로를 제거하고, Express 저장 모델이 삭제된 과거 DB 항목을 다시 노출하지 않도록 활성 포탈 키 필터를 추가했다.
- 베어트리파크의 권한 사용자용 공용 포탈 편집 목록도 비워 삭제된 마이홈 포탈을 다시 만들 수 없도록 했다.
- AI 연구소의 불곰·반달가슴곰 조사 지점과 수목원·공간 안내에서 마이홈으로 들어가는 경로는 유지했다.
- 런타임 빌드 ID를 `20260805-clean-bear-tree-park-v81`로 갱신하고 React 산출물을 WIZ 정적 번들에 동기화했다.

## 주요 변경 파일

- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/shared/world-portals.ts`
- `react-app/src/pages/GamePage.tsx`
- `react-app/server/src/models/WorldPortalPosition.ts`
- `src/app/page.home/api.py`
- `react-app/scripts/bearTreePortals.test.ts`
- `react-app/src/runtimeBuild.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/*`

## 확인 결과

- `npm run test:bear-tree-portals` 성공: 기존 고정 포탈 3개 유지, 관찰·조사 지점과 마이홈 포탈 제거 4개 통과
- 포토존 회귀 테스트 3개와 축제 포탈 고정 회귀 테스트 4개 통과
- 런타임 엔트리 캐시 회귀 테스트 2개 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 성능 예산 통과: 초기 엔트리 287 KiB, 최대 JS gzip 310 KiB, 최대 3D 자산 21.64 MiB
- Python 구문 검사, React `dist`와 WIZ 정적 번들 전체 비교, WIZ 일반 빌드 성공
- 운영 v81 엔트리·UI·렌더러 청크 HTTP 200 확인
- 운영 렌더러 청크에서 `대표 곰 관찰`, `먹이 구역 곰 관찰` 문구 제거 확인
- `git diff --check` 통과

## 남은 리스크

- 이미 v80 이하 화면을 열어 둔 사용자는 새로고침해야 제거된 지점과 포탈이 사라진다.
- 실행 중인 WIZ Python 프로세스는 기존 공용 레이아웃 레코드를 캐시해 API 응답에 베어트리파크→마이홈 항목을 아직 포함하지만, v81 렌더러에는 해당 포탈 정의가 없어 화면에는 생성되지 않는다. 프로세스 재시작 후 새 활성 키 필터가 적용되면 API 목록에서도 제외된다.
- 실제 3D 화면을 직접 이동하며 모든 이전 지점 좌표를 확인하는 수동 시각 검증은 수행하지 않았다.
