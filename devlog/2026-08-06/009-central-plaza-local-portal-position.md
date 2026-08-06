# 중앙광장 정부청사 귀환 포탈 로컬 위치 유지 수정

- **ID**: 009
- **날짜**: 2026-08-06
- **유형**: 버그 수정
- **리뷰 ID**: eoxtwylauxhtgacdckvpgmjapxblddby

## 원문 요청사항

```text
정부 청사로 돌아가는 포탈 위치 내가 변경할 수 있게 해줘, 현재 위치 변경되었다가 원래 자리로 돌아감
```

## 작업 요약

중앙광장에서 브라우저별 포탈 편집 버튼과 공용 포탈 편집 UI가 같은 위치에 중복 노출되어, 공용 버튼이 로컬 저장 동작을 가로채던 원인을 수정했다. 중앙광장과 스마트시티는 공용 편집 UI에서 제외하고 전용 `현재 위치로 포탈 이동` 버튼만 사용하게 했다. 중앙광장 귀환 포탈은 `sharedPosition: false`와 기존 로컬 저장 키를 유지하므로 2.5초 공용 좌표 갱신 및 맵 재진입 후에도 사용자가 지정한 위치가 유지된다.

## 변경 파일 목록

- `react-app/src/pages/GamePage.tsx`: 중앙광장·스마트시티의 중복 공용 포탈 편집 UI 제거
- `react-app/scripts/smartCityPortalPosition.test.ts`: 중앙광장 로컬 포탈 편집 회귀 검사 추가
- `react-app/src/runtimeBuild.ts`: 런타임 빌드 ID 갱신
- `src/app/page.home/view.pug`: iframe 빌드 쿼리 갱신
- `src/assets/jochwon-app/`: 최신 React 프로덕션 빌드 동기화
- `devlog.md`
- `devlog/2026-08-06/009-central-plaza-local-portal-position.md`

## 검증 결과

- 중앙광장·스마트시티 포탈 위치 회귀 테스트 3건 통과
- 런타임 엔트리·빌드 ID 테스트 2건 통과
- `npm run build`: 성공
- 성능 예산 검사: 성공
- WIZ 프로젝트 일반 빌드: 성공
- 생성 GamePage 번들 2개 `node --check`: 성공
- React 빌드와 WIZ 정적 자산 143개 파일 목록 일치 확인
- `git diff --check`: 성공

## 남은 리스크

- 포탈 위치는 현재 브라우저 로컬 저장소에 보관되므로 브라우저 데이터 삭제 또는 다른 브라우저·기기에서는 다시 지정해야 한다.
