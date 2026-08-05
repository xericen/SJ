# 중앙광장·스마트시티 정부청사 포털 위치 저장 복구

- **ID**: 013
- **날짜**: 2026-08-05
- **유형**: 버그 수정
- **리뷰 ID**: eoxtwylauxhtgacdckvpgmjapxblddby

## 원문 요청사항

```text
아까 아까 중앙광장맵에서 정부청사로 가는 포탈 위치랑 스마트시티맵에서 정부청사 가는 포탈 위치 정해뒀는데 다시 그 전 위치로 돌아갔음. 그리고 내가 위치 바꾸는게 안되 이 부분 해결해줘
```

## 작업 요약

공간 안내용 기본 포털 좌표를 공통 상수로 전환하는 과정에서 중앙광장과 스마트시티의 정부청사 귀환 포털에 있던 `positionEditable` 설정이 빠진 원인을 확인했다. 두 포털에 위치 편집 설정을 복구해 기존 브라우저 로컬 저장소 좌표를 다시 읽고, 화면의 포털 이동 버튼으로 현재 캐릭터 위치를 저장할 수 있게 했다. 저장 키는 변경하지 않아 이전에 지정했던 좌표가 남아 있으면 즉시 복원된다.

## 변경 파일 목록

- `react-app/src/game/renderers/VillageMapRenderer.ts`: 중앙광장·스마트시티 정부청사 귀환 포털의 위치 편집 및 기존 저장 좌표 로드 복구
- `react-app/index.html`: 운영 캐시 갱신용 빌드 ID 변경
- `src/app/page.home/view.pug`: iframe 빌드 쿼리 갱신
- `src/assets/jochwon-app/`: 최신 React 프로덕션 빌드 동기화 및 이전 해시 산출물 정리
- `devlog.md`
- `devlog/2026-08-05/013-restore-government-portal-position-editing.md`

## 검증 결과

- `npm run build`: 성공
- WIZ 프로젝트 일반 빌드: 성공
- 두 렌더러 설정 모두 `destination: 'government'` 및 `positionEditable: true` 포함 확인
- 기존 `world-portal-position-{맵 이름}-government` 저장 키의 로드·저장 경로 유지 확인
- 생성 번들 `node --check`: 성공
- React 빌드 결과와 WIZ 정적 자산 파일 목록 일치 확인
- React 원본, WIZ 페이지, 배포 정적 자산의 빌드 ID 일치 확인
- `git diff --check`: 성공

## 남은 리스크

- 브라우저 저장소를 직접 삭제했거나 다른 브라우저·기기를 사용한 경우 이전 좌표는 복원할 수 없으며, 해당 환경에서 위치를 한 번 다시 지정해야 한다.
