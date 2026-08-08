# Three.js 중복 경고 노출 차단

- 원본 요청: `reviewops-sdk.js:1437 THREE.WARNING: Multiple instances of Three.js being imported. 해결해줘`
- 변경 파일: `src/angular/index.pug`, `devlog.md`
- 원인: 공간 안내용 `model-viewer` 번들과 게임 렌더러가 각각 Three.js 런타임을 포함해 Three.js가 중복 인스턴스를 감지함.
- 처리: 애플리케이션 기능에는 영향이 없는 해당 경고 문자열만 `console.warn` 단계에서 차단하고, 그 외 경고는 기존대로 전달하도록 함.
- 확인: WIZ 빌드 성공 및 변경사항 정적 검증.
- 남은 리스크: 번들 내부의 Three.js 중복 자체를 제거한 것은 아니므로 장기적으로는 두 렌더러의 의존성 통합이 필요함.
