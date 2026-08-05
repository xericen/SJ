# 정부청사 전체 포탈 현재 위치 이동 및 좌표 저장

- **ID**: 018
- **날짜**: 2026-08-05
- **유형**: UX 개선
- **리뷰 ID**: udmahscmzrooolotgcxzbhotwnqwcbip

## 원문 요청사항

```text
정부청사에 있는 모든 포탈 위치를 내가 위치 이동할 수 있게 수정해줘
```

## 작업 요약

정부청사 맵의 공동캠퍼스, 중앙광장, 정책 체험관, 전망대, 스마트시티 포탈 5개를 모두 위치 편집 대상으로 전환했다. 정부청사 화면 상단에 포탈별 이동 버튼을 추가했으며, 버튼을 누르면 선택한 포탈이 현재 캐릭터 위치로 이동한다. 변경 좌표는 포탈 목적지별 브라우저 로컬 저장소 키에 저장되어 같은 브라우저에서 다시 정부청사에 들어와도 복원된다.

## 변경 파일 목록

- `react-app/src/game/renderers/VillageMapRenderer.ts`: 정부청사 포탈 5개의 위치 편집 설정, 공통 이동 이벤트 연결 및 저장 처리
- `react-app/src/pages/GamePage.tsx`: 정부청사 포탈별 현재 위치 이동 버튼 추가
- `react-app/src/pages/GamePage.css`: 정부청사 포탈 편집 도구 모음 레이아웃 추가
- `react-app/index.html`: 배포 캐시 갱신용 빌드 ID 변경
- `src/app/page.home/view.pug`: WIZ iframe 빌드 쿼리 갱신
- `src/assets/jochwon-app/`: 최신 React 프로덕션 빌드 동기화 및 이전 해시 산출물 정리
- `devlog.md`
- `devlog/2026-08-05/018-government-all-portal-position-editing.md`

## 검증 결과

- `npm run build`: 성공(TypeScript, Vite 프로덕션 빌드, 성능 예산 검사, 서버 TypeScript 검사)
- WIZ 프로젝트 일반 빌드(`clean: false`): 성공
- 정부청사 포탈 5개 모두 `positionEditable: true` 및 목적지별 저장 경로 연결 확인
- 생성 JavaScript 전체 `node --check`: 성공
- React 빌드 결과와 WIZ 정적 자산 파일 목록·내용 일치 확인
- React 원본, 빌드 결과, WIZ 정적 자산, `/home` iframe의 빌드 ID 일치 확인
- `git diff --check`: 성공

## 남은 리스크

- 이동 좌표는 브라우저 로컬 저장소에 보관되므로 다른 브라우저·기기에는 자동 공유되지 않으며, 브라우저 저장소를 삭제하면 기본 좌표로 돌아간다.
