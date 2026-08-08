# 곰·수목원 완료 marker 연결 및 운영 번들 누락 기능 조사

- 원요청: 곰체험소의 입장·먹이·춤·개인 타이머·동상, 수목원의 순서별 꽃 배치와 꽃 5종 AI 분석을 복원한다.
- 변경 파일: `src/assets/jochwon-app/assets/experience-signal-bridge.js`
- 변경: 실제 운영 저장값인 `bear-wildlife-comparison-v2:*`의 흔적 연구 완료를 곰체험소 대표 완료 signal로 연결했다.
- 조사 결과: 현재 운영 진입 번들에는 `ramba`, 곰 먹이/개인 타이머/동상, 순서별 꽃 배치, 꽃 5종 AI 분석 UI 및 실행 로직이 확인되지 않았다. 해당 기능은 별도 구현 없이는 복원되지 않는다.
- 검증: bridge 구문 검사 및 diff 검사. 실제 브라우저 행동 검증은 미실행.
