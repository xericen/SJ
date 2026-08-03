# 동적 iframe URL 차단으로 발생한 `/home` 빈 화면 복구

- **ID**: 006
- **날짜**: 2026-08-03
- **유형**: 버그 수정

## 작업 요약

로그인 콜백 쿼리를 전달하기 위해 추가했던 동적 iframe `src` 바인딩이 Angular Resource URL 보안 검사를 통과하지 못해 `/home`이 빈 화면으로 표시되는 문제를 복구했다.
iframe은 검증된 정적 주소로 되돌리고, OAuth 성공·실패 결과는 React 정적 앱 진입점으로 직접 복귀하도록 변경했다.

## 원문 요청사항

```text
아무것도 안 보이는데 수정해줘
```

## 변경 파일 목록

- `src/app/page.home/view.ts`: 불필요한 동적 iframe URL 생성 제거
- `src/app/page.home/view.pug`: iframe `src`를 정적 React 앱 주소로 복원
- `src/app/page.home/api.py`: OAuth 결과 리다이렉트를 React 앱 진입점으로 변경
- `devlog.md`: 작업 요약 행 추가
- `devlog/2026-08-03/006-restore-home-iframe-rendering.md`: 상세 작업 기록

## 확인 결과

- Python 문법 검사 성공
- `git diff --check` 성공
- WIZ 일반 빌드 성공
- 생성된 WIZ 템플릿에서 정적 iframe 주소 확인
- React 엔트리 HTML·JavaScript·CSS 자산 HTTP 200 응답 확인

## 남은 리스크

- 브라우저 자동화 도구가 없는 환경이라 실제 렌더링 픽셀 검증은 수행하지 못했다.
- 카카오 OAuth 전체 왕복 검증은 WIZ API 런타임 캐시 갱신과 Redirect URI 등록 후 필요하다.
