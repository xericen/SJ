# 3D·번들 로딩 최적화 및 Node 실시간 운영 배포 검증

- **ID**: 017
- **날짜**: 2026-08-05
- **유형**: 성능·운영 배포·검증

## 작업 요약

45.75 MB 동아리 거리 GLB를 Meshopt와 WebP 기반으로 1.81 MB까지 축소하고 GLTFLoader에 Meshopt 디코더를 연결했다. 게임 이벤트 버스에서 불필요한 Phaser 의존성을 제거하고 Phaser를 지연 로딩 가능한 독립 청크로 분리했다. 빌드마다 초기 진입 청크, gzip JavaScript, GLB 크기를 제한하는 성능 예산 검사를 추가했다.

Express·Socket.IO 서버에는 MySQL 준비 상태 엔드포인트, 영속 런타임 디렉터리, Docker Compose, 컨테이너 상태 검사와 Nginx WebSocket 프록시 예시를 추가했다. 컴파일된 운영 서버와 실제 MySQL을 사용해 두 Socket.IO 클라이언트의 입장·이동·근처 채팅·방 격리를 자동 검증했다.

## 원문 요청사항

```text
남은 리스크
500KB 초과 번들과 최대 45MB급 GLB의 로딩 최적화가 필요합니다.
Express·Socket.IO 기능은 별도 Node 운영 배포와 다중 사용자 검증이 필요합니다. 해줘
```

## 변경 파일 목록

- `react-app/src/assets/maps/club-street-festival-map.glb`: Meshopt·WebP 압축 3D 자산
- `react-app/src/game/events.ts`: Phaser 비의존 경량 이벤트 버스
- `react-app/src/game/renderers/VillageMapRenderer.ts`: Meshopt GLB 로딩 지원
- `react-app/vite.config.ts`: Phaser 독립 청크와 번들 경고 기준
- `react-app/scripts/checkPerformanceBudgets.mjs`: JavaScript·GLB 성능 예산 검사
- `react-app/scripts/verifyMultiplayer.ts`: 실제 서버·MySQL 기반 2클라이언트 검증
- `react-app/package.json`, `react-app/package-lock.json`: 빌드·검증 명령과 보안 업데이트
- `react-app/server/src/index.ts`: live·ready 상태 검사
- `react-app/server/src/rooms/roomStore.ts`, `react-app/server/.env.example`: 운영 상태 저장 경로
- `react-app/server/Dockerfile`, `react-app/.dockerignore`: Node 운영 컨테이너
- `react-app/deploy/`: Compose·Nginx·운영 절차
- `README.md`: 성능 예산, 운영 배포와 다중 사용자 검증 문서
- `react-app/index.html`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/`: 캐시 식별자와 최신 WIZ 정적 번들

## 확인 결과

- React·Vite·Express 전체 빌드 및 성능 예산 검사 성공
- 초기 진입 JavaScript 242 KiB, 최대 gzip JavaScript 310 KiB
- 동아리 거리 GLB 45.75 MB → 1.81 MB, 현재 최대 GLB 21.64 MiB
- GLB 구조 검증 오류 0건, 필수 동아리 부스 노드 보존 확인
- 백엔드 테스트 43개, 캐릭터·온실·온실 AI 테스트 통과
- 실제 MySQL 준비 상태와 두 WebSocket 클라이언트의 입장·이동·근처 채팅·맵 격리 통과
- npm production 의존성 취약점 0건
- React `dist`와 WIZ 정적 자산 140개 일치
- WIZ 일반 빌드 성공, 운영 `/home`·진입 HTML·최신 JavaScript 번들 HTTP 200
- Docker Compose YAML 구문 및 Git 공백·비밀정보 패턴 검사 통과

## 남은 리스크

- 현재 작업 환경에는 Docker·Nginx 실행 파일과 운영 서버 제어 권한이 없어 제공한 운영 구성을 실제 호스트에 적용하는 단계는 인프라 운영자가 수행해야 한다.
- 현재 최대 GLB는 예산 이내지만 21.64 MiB이므로 저속 네트워크에서는 공간 최초 진입이 지연될 수 있다.
- GLB 검증기의 Meshopt 확장 해석 제한과 원본의 일부 tangent 자동 생성 경고가 있으며 Three.js 런타임 디코더로 대응한다.
