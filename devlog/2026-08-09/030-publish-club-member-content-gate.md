# 비가입자 동아리 활동·사진 차단 번들 운영 반영

## 사용자 원문 요청

> 가입안했는데도 안에 내용보임, 가입한 멤버만 동아리 활동·사진을 보고 댓글을 작성하도록 제한했습니다.

## 변경 파일

- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/*`
- `src/app/page.home/view.pug`
- `devlog.md`
- `devlog/2026-08-09/030-publish-club-member-content-gate.md`

## 변경 및 원인

- 원인은 React 원본만 수정되고 현재 WIZ 프로젝트의 운영 정적 번들이 갱신되지 않은 배포 경로 불일치였다.
- 비가입자에게 활동 피드·사진 앨범 대신 멤버 전용 안내가 표시되는 최신 React 빌드를 현재 WIZ 프로젝트에 동기화했다.
- 운영 캐시 식별자를 `20260809-club-member-gate-v2`로 갱신했다.

## 확인 결과

- React 전체 빌드 및 성능 검사 성공
- WIZ 프로젝트 빌드 성공
- 운영 `index.html`에서 최신 `index-DhfVT8K2.js` 엔트리 확인
- 운영 번들과 로컬 빌드 엔트리 일치 확인

## 남은 리스크

- 이미 페이지를 열어 둔 브라우저는 한 번 새로고침해야 최신 iframe이 적용된다.
