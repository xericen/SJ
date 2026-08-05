# 스마트시티 테이블·홀로그램 균형 구도 및 서비스 버튼 겹침 수정

- **ID**: 001
- **날짜**: 2026-08-05
- **유형**: 버그 수정
- **리뷰 ID**: ridytcoiyougrnuuwqzebvhpwvhueuoa

## 원문 요청사항

```text
너무 확대한 거 같은데, 이걸 선택하고 앞에 있는 홀로그램도 봐야하니까 제대로 해줘, 스마트 서비스 안에 있는  html도 잘 나오게 다시 수정해줘
```

## 작업 요약

E 체험 진입 카메라가 중앙 테이블 스크린만 가득 채우던 구도를 전시관의 기존 시선 방향, 홀로그램 위치, 테이블 사용 거리를 함께 반영하는 균형 구도로 변경했다. 전역 `nav` 고정 높이가 테이블의 3열 2행 서비스 버튼에 상속되어 두 행이 겹치던 문제도 컴포넌트 범위의 레이아웃 초기화로 수정했다.

## 변경 파일 목록

- `react-app/src/game/renderers/VillageMapRenderer.ts`: 테이블·홀로그램 동시 노출 카메라 구도 및 거리 보정
- `react-app/src/components/SmartCityExperience.css`: 테이블 내 `nav` 높이·정렬 초기화, 6개 버튼의 독립 행 크기와 오버플로 보강
- `react-app/index.html`: 운영 캐시 갱신용 빌드 ID 적용
- `src/app/page.home/view.pug`: iframe 빌드 쿼리 갱신
- `src/assets/jochwon-app/`: 최신 React 빌드 결과 동기화
- `devlog.md`
- `devlog/2026-08-05/001-smartcity-balanced-focus-and-table-ui.md`

## 검증 결과

- `npm run build`: 성공
- WIZ 프로젝트 일반 빌드: 성공
- 운영 URL의 빌드 ID `20260805-sejong-balanced-focus-v8` 및 HTTP 200 확인
- Playwright 1536×864 실제 이동·E 진입 검증: 성공
- 서비스 버튼 6개의 모든 쌍 교차 영역 0, 강제 클릭 없이 6개 모두 선택 및 `active` 전환 확인
- 중앙 테이블 HTML, 서비스별 3D 홀로그램, 벽면 설명 동시 노출 확인

## 남은 리스크

- 매우 좁은 모바일 세로 화면에서는 테이블 글자 크기와 클릭 영역이 데스크톱보다 작게 보일 수 있어 별도 실기기 확인이 필요하다.
