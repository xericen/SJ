# 스마트시티 E 체험 진입 시 중앙 테이블 카메라 확대

- **ID**: 012
- **날짜**: 2026-08-04
- **유형**: UX 개선
- **리뷰 ID**: ridytcoiyougrnuuwqzebvhpwvhueuoa

## 원문 요청사항

```text
e 눌렀을 때 중앙 디지털 트윈 테이블 안에 있는 html을 내가 선택해서 홀로그램을 띄우게 하는 거니까, e버튼을 누르면 확대를 해줘서 내가 중앙 디지털 트윈 테이블을 사용할 수 있게 해줘
```

## 작업 요약

스마트시티 체험 활성화 시 중앙 테이블 스크린의 실제 3D 크기와 표면 방향을 계산해 카메라가 약 0.72초 동안 테이블 사용 시점으로 확대되도록 구현했다. 확대된 시점에서도 HTML 투영 UI가 테이블 표면을 계속 따라가며, ESC 종료 시 포커스 상태와 투영 좌표를 초기화해 기존 월드 카메라로 복귀한다.

## 변경 파일 목록

- `react-app/src/game/renderers/VillageMapRenderer.ts`: 테이블 전용 카메라 뷰·전환·종료 초기화 구현
- `react-app/index.html`: 새 번들 캐시 갱신용 빌드 ID 적용
- `src/app/page.home/view.pug`: iframe 빌드 쿼리 갱신
- `src/assets/jochwon-app/`: 최신 React 빌드 결과 동기화
- `devlog.md`
- `devlog/2026-08-04/012-smartcity-table-camera-focus.md`

## 검증 결과

- `npm run build`: 성공
- 카메라 확대 분기와 테이블 HTML 투영 좌표 갱신 연결 확인
- WIZ 프로젝트 빌드: 성공
- 배포 URL 빌드 ID `20260804-sejong-table-focus-v7` 및 HTTP 200 확인

## 남은 리스크

- 화면 비율이 매우 세로로 긴 모바일 환경에서는 테이블 화면 주변 여백이 데스크톱과 다르게 보일 수 있다.
