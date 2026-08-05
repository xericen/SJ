# 중앙광장 귀환 포털 위치 편집 및 GLB 소파 앉기 기능 추가

- **ID**: 004
- **날짜**: 2026-08-05
- **유형**: UX 수정
- **리뷰 ID**: eoxtwylauxhtgacdckvpgmjapxblddby

## 원문 요청사항

```text
정부 청사로 돌아가는 포탈 위치 내가 변경할 수 있게 해줘, 그리고 쇼파에 e 눌러서 앉을 수 있게 해줘(전망대, 쇼파 참괘서 glb파일 찾아서 똑같이 앉게 해주면 됨)
```

## 작업 요약

중앙광장의 정부청사 귀환 포털을 캐릭터의 현재 위치로 옮길 수 있도록 편집 버튼을 연결하고 브라우저 로컬 저장소에 위치가 유지되도록 했다. 전망대와 중앙광장 GLB를 비교해 같은 소파 모델 접두사를 확인한 뒤, 중앙광장 소파 5개에 근접 감지와 `E` 키 앉기·일어나기 동작 및 안내 UI를 추가했다. 중앙광장에 작성된 가구 충돌 영역이 실제 이동 판정에 사용되도록 전체 충돌 모드도 활성화했다.

## 변경 파일 목록

- `react-app/src/game/renderers/VillageMapRenderer.ts`: 귀환 포털 위치 편집 허용, 중앙광장 소파 좌석 생성·근접 감지·앉기 동작, 가구 충돌 적용
- `react-app/src/pages/GamePage.tsx`: 포털 위치 변경 버튼과 소파 `E` 상호작용 안내 추가
- `react-app/src/pages/GamePage.css`: 소파 상호작용 안내 스타일 추가
- `react-app/index.html`: 운영 캐시 갱신용 빌드 ID 변경
- `src/app/page.home/view.pug`: iframe 빌드 쿼리 갱신
- `src/assets/jochwon-app/`: 최신 React 프로덕션 빌드 동기화
- `devlog.md`
- `devlog/2026-08-05/004-central-plaza-portal-editor-and-sofa-seating.md`

## 검증 결과

- `npm run build`: 성공
- WIZ 프로젝트 일반 빌드: 성공
- 생성된 GamePage 번들 2개 `node --check`: 성공
- 중앙광장과 전망대 GLB 노드 확인: 동일 소파 모델 접두사로 각각 5개·6개 확인
- React 원본, WIZ 페이지, 배포 정적 자산의 빌드 ID 일치 확인
- `git diff --check`: 성공

## 남은 리스크

- 자동 브라우저 캐릭터 조작 테스트는 수행하지 않아, 실제 화면에서 소파별 착석 높이·방향과 상호작용 거리의 체감 확인이 필요하다.
- 포털 위치는 브라우저 로컬 저장소 기준으로 유지되므로 다른 브라우저나 기기에는 공유되지 않는다.
