# 스마트시티 중앙 테이블 인월드 HTML 키오스크 선택 UI 구현

- **ID**: 011
- **날짜**: 2026-08-04
- **유형**: UX 개선
- **리뷰 ID**: ridytcoiyougrnuuwqzebvhpwvhueuoa

## 원문 요청사항

```text
e를 누르면 현재 웹으로  나오고 있는데, 그 테이블에서 내가 클릭해서 홀로그램이 나오게 하고 싶어, 예를 들어 프로젝트실 로비에 있는 키오스크처럼, 내가 키오스크 안에 html을 사용해서 만들잖아, 그거 처럼 스마트 시티캡에서도 앞에 있는 테이블로 내가 선택할 수 있게 해줘
```

## 작업 요약

화면 하단에 고정되어 있던 스마트 서비스 선택 도크와 안내 카드를 제거하고, 중앙 디지털 트윈 테이블의 3D 스크린 투영 좌표에 HTML UI가 맞물리도록 변경했다. 프로젝트실 전광판과 같은 원근 사변형 변환을 사용해 카메라 시점이 바뀌어도 테이블 표면을 따라 UI가 배치된다. 테이블 안에서 6개 서비스를 직접 클릭하고 진행 상태·충녕이 설명·ESC 종료 안내를 확인할 수 있으며, 선택 결과는 기존 전면 홀로그램과 후면 설명 화면에 연결된다.

## 변경 파일 목록

- `react-app/src/components/SmartCityExperience.tsx`: 테이블 스크린 좌표 구독, 원근 변환, 인월드 서비스 선택 UI 구현
- `react-app/src/components/SmartCityExperience.css`: 테이블 키오스크 전용 HTML 화면 스타일 구현
- `react-app/index.html`: 새 번들 캐시 갱신용 빌드 ID 적용
- `src/app/page.home/view.pug`: iframe 빌드 쿼리 갱신
- `src/assets/jochwon-app/`: 최신 React 빌드 결과 동기화
- `devlog.md`
- `devlog/2026-08-04/011-smartcity-table-html-kiosk.md`

## 검증 결과

- 중앙 테이블 스크린 투영 이벤트와 HTML 원근 변환 연결 확인
- 서비스 6종 버튼의 기존 홀로그램·후면 설명 변경 이벤트 연결 유지 확인
- `npm run build`: 성공
- WIZ 프로젝트 빌드: 성공
- 배포 URL 빌드 ID `20260804-sejong-table-kiosk-v6` 및 HTTP 200 확인

## 남은 리스크

- 테이블이 화면에서 매우 작게 보이는 모바일 환경에서는 6개 버튼의 직접 클릭 영역이 좁을 수 있다.
