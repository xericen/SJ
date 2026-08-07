# 홈 iframe 높이 축소 복구 및 전체 화면 표시 보장

- **ID**: 003
- **날짜**: 2026-08-07
- **유형**: 버그 수정
- **리뷰 ID**: nmzgknprmocskmxxhwqmgokmgqtzhxlu

## 작업 요약
첨부 스크린샷을 기준으로 React 홈 콘텐츠가 작아진 것이 아니라 WIZ 페이지의 iframe 높이가 기본 높이 수준으로 축소된 문제를 확인했다.
페이지 호스트에 뷰포트 높이를 명시하고 래퍼와 iframe이 그 높이를 100% 상속하도록 복구해 홈 화면이 아래까지 가득 표시되도록 수정했다.

## 원문 요청사항
```text
현재 위에만 이렇게 되는 걸로 변했어,, 아래까지 잘 보이게 ㅐ줘야하는데 왜 갑자기 작아진거임
```

## 변경 파일 목록
- `src/app/page.home/view.scss`
  - 페이지 호스트에 `height/min-height: 100vh` 복구
  - iframe에 `height: 100%` 명시
  - 높이 축소를 유발하던 flex 자동 크기와 위쪽 이동 보정 제거
- `devlog.md`
  - 작업 요약 행 추가
- `devlog/2026-08-07/003-restore-home-iframe-height.md`
  - 작업 상세 기록 추가

## 확인 결과
- WIZ 일반 빌드(`clean: false`) 성공
- 생성된 `bundle/www/main.js`의 `wiz-page-home` 스타일에 `100vh` 호스트와 `100%` iframe 높이가 포함된 것을 확인
- 운영 `main.js`에서 갱신된 홈 컴포넌트 스타일 제공 확인

## 남은 리스크
- ReviewOps 캡처 환경의 브라우저 캐시가 남아 있으면 한 차례 새로고침이 필요할 수 있다.
