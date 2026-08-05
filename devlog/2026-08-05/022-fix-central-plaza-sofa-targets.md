# 중앙광장 화분의 소파 오인식 제거 및 실제 소파 앉기 연결

- **ID**: 022
- **날짜**: 2026-08-05
- **유형**: 버그 수정
- **리뷰 ID**: eoxtwylauxhtgacdckvpgmjapxblddby

## 원문 요청사항

```text
앞에 있는 소파에 e버튼을 누르면 앉게 해줘야하는데, 프로젝트 가져오기 앞에 있는 화분에 소파로 인식이 들어가는 오류가 있어, 이 부분 해결해줘
```

## 작업 요약

중앙광장 GLB의 자동 생성 노드명을 분석해 기존 소파 대상으로 지정했던 `7c513...` 노드 5개가 실제로는 화분임을 확인했다. 앉기 대상을 실제 전면 소파인 `d2b5...001`, `d2b5...002` 두 개로 제한하고, 소파 충돌 영역 밖의 정면 대기 위치를 크기에 따라 계산해 그 위치에서만 E키 안내와 앉기가 활성화되도록 수정했다.

## 변경 파일 목록

- `react-app/src/game/renderers/VillageMapRenderer.ts`: 실제 소파 노드 지정, 정면 상호작용 위치 계산, 화분 오인식 제거
- `react-app/index.html`: 운영 캐시 갱신용 빌드 ID 변경
- `src/app/page.home/view.pug`: iframe 빌드 쿼리 갱신
- `src/assets/jochwon-app/`: 최신 React 프로덕션 빌드 동기화
- `devlog.md`
- `devlog/2026-08-05/022-fix-central-plaza-sofa-targets.md`

## 검증 결과

- GLB 노드 검사: 실제 소파 대상 2개 존재 및 화분 노드 5개 제외 확인
- `npm run build`: 성공
- 성능 예산 검사: 성공
- WIZ 프로젝트 일반 빌드: 성공
- 생성 번들 `node --check`: 성공
- React 원본, WIZ 페이지, 배포 정적 자산의 빌드 ID 일치 확인
- `git diff --check`: 성공

## 남은 리스크

- 실제 화면에서 두 소파의 모델별 앉기 자세와 정면 감지 거리 체감은 최종 확인이 필요하다.
