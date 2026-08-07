# 실제 WIZ 프로젝트에 ReviewOps 부모 origin 보정 반영

- 원본 요청: `16Failed to execute 'postMessage' on 'DOMWindow': The target origin provided ('<URL>') does not match the recipient window's origin ('<URL>'). 이거 다시 한 번 해결해줄래?`
- 변경 파일: `react-app/index.html`, `src/angular/index.pug`
- 변경 내용: 실제 프로젝트 경로에 부모 문서 referrer origin 우선 계산, `allowedOrigins` 고정, ReviewOps SDK origin mismatch 오류 격리를 반영했다.
- 확인: 운영 HTML에 이전 하드코딩 설정이 남아 있음을 확인했으며, WIZ 재빌드 후 새 번들에 반영한다.
- 남은 리스크: 외부 ReviewOps SDK가 이미 캐시된 구번들을 계속 사용하는 동안에는 재현될 수 있다.
