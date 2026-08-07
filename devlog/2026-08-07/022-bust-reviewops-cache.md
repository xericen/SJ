# ReviewOps origin 수정용 운영 캐시 버전 갱신

- 원본 요청: `CDN 캐시가 갱신되기 전까지는 이전 번들이 잠시 제공될 수 있습니다. 배포 후 강력 새로고침하면 최신 origin 설정이 적용됩니다. 해줘봐`
- 변경 파일: `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`
- 변경 내용: React 정적 HTML과 WIZ iframe URL의 빌드 식별자를 새 값으로 갱신해 이전 HTML·번들이 재사용되지 않도록 했다.
- 확인: React 빌드 후 정적 번들을 WIZ asset 위치에 동기화하고 WIZ 프로젝트 빌드를 실행한다.
- 남은 리스크: 이미 열린 탭은 새 iframe URL을 읽기 전까지 이전 문서를 유지할 수 있다.
