# 중앙광장 GLB 가구 충돌 적용 및 Web UI 사이 키오스크 제거

- **ID**: 002
- **날짜**: 2026-08-05
- **유형**: UX 수정
- **리뷰 ID**: eoxtwylauxhtgacdckvpgmjapxblddby

## 원문 요청사항

```text
중앙광장 맵에 있는 glb파일로 만들어진 가구들 부딪치지 않게 해주고, 프로젝트 가져오기, 일정 저장 및 방문 html 양 옆에 있는 키오스크 2개 glb파일 없애줘.
```

## 작업 요약

중앙광장 GLB의 최상위 오브젝트 구조를 확인해 소파 5개와 화분 3개에 패딩된 충돌 영역을 적용했다. `프로젝트 가져오기`와 `일정 저장 및 방문` Web UI 안쪽에 배치된 `Kiosk_Rear_Left_*`, `Kiosk_Rear_Right_*` 오브젝트 묶음은 렌더링과 충돌 대상에서 제외했다.

## 변경 파일 목록

- `react-app/src/game/renderers/VillageMapRenderer.ts`: 중앙광장 가구 충돌 대상과 숨김 키오스크 접두사 설정
- `react-app/index.html`: 운영 캐시 갱신용 빌드 ID 변경
- `src/app/page.home/view.pug`: iframe 빌드 쿼리 갱신
- `src/assets/jochwon-app/`: 최신 React 프로덕션 빌드 동기화
- `devlog.md`
- `devlog/2026-08-05/002-central-plaza-furniture-collision-and-kiosk-removal.md`

## 검증 결과

- `npm run build`: 성공
- WIZ 프로젝트 일반 빌드: 성공
- 생성 번들 `node --check`: 성공
- 중앙광장 GLB 노드 확인: 소파 5개·화분 3개가 지정 충돌 접두사에 매핑됨
- 생성 번들에서 키오스크 숨김 접두사와 빌드 ID 포함 확인

## 남은 리스크

- 자동 브라우저 이동 테스트는 수행하지 않아, 실제 캐릭터 반경 기준의 가구 가장자리 체감 여유는 운영 화면에서 추가 확인이 필요하다.
