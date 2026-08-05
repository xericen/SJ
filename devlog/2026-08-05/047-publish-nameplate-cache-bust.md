# 충녕이 이름표 운영 캐시 우회 및 신규 번들 발행

## 사용자 원문 요청

> 크기 조정했는데 왜 아직도 크기가 똑같은 거야? ....

## 변경 파일

- `react-app/index.html`
  - 이름표 수정 배포용 빌드 ID를 `20260805-nameplate-cache-v47`로 갱신했습니다.
- `src/app/page.home/view.pug`
  - iframe 빌드 쿼리를 신규 빌드 ID로 변경했습니다.
- `src/assets/jochwon-app/index.html`
  - 운영 엔트리를 캐시되지 않은 `index-nameplate-v47.js`로 전환했습니다.
- `src/assets/jochwon-app/assets/index-nameplate-v47.js`
  - 화면 JS·CSS와 3D 엔진을 모두 신규 v47 파일명으로 참조하도록 발행했습니다.
- `src/assets/jochwon-app/assets/GamePage-nameplate-v47.js`
  - 현재 운영 화면 번들을 신규 파일명으로 복제하고 v47 3D 엔진을 참조하도록 변경했습니다.
- `src/assets/jochwon-app/assets/GamePage-nameplate-v47.css`
  - 현재 운영 화면 스타일을 신규 파일명으로 발행했습니다.
- `src/assets/jochwon-app/assets/WorldEngine-nameplate-v47.js`
  - 충녕이 이름표가 사용자와 동일한 `120 × 30` 크기이고 `안내 NPC` 배지가 제거된 3D 엔진을 신규 파일명으로 발행했습니다.

## 검증 결과

- v47 엔트리에서 신규 화면·스타일·3D 엔진 참조를 정적 확인했습니다.
- v47 3D 엔진에서 충녕이 이름표 `120 × 30` 크기와 단일 `충녕이` 이름을 확인했습니다.
- 신규 번들 JavaScript 구문 검사와 WIZ 프로젝트 일반 빌드를 통과했습니다.
