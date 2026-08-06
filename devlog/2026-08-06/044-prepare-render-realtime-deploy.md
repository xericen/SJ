# Render 독립 Socket.IO 서버 배포 준비

- **ID**: 044
- **날짜**: 2026-08-06
- **유형**: 설정 변경

## 작업 요약

회사 WIZ·Istio 프록시를 변경하지 않고 Node Socket.IO 서버만 Render에 배포할 수 있도록 Blueprint와 배포 안내를 추가했다. 기존 서버가 `react-app/shared/`와 루트 의존성을 사용하므로 `server` 단독 Root Directory 대신 `react-app` 전체를 Docker build context로 사용하도록 구성했다.

## 원문 요청사항

```text
제가 추천하는 방향
⭐ Render 또는 Railway에 server만 배포
현재:
WIZ
 |
 React
유지
추가:
Render/Railway
 |
 Node Socket.IO 서버
 :3001
구조:
사용자 브라우저

      ↓

sj.wizide.com
(React/WIZ)

      ↓ WebSocket

socket-server.onrender.com
(Node + Socket.IO)
왜 이게 좋은가?
회사 서버를 건드리지 않습니다.
현재 문제:
/socket.io
    ↓
WIZ 서버
이 라우팅 문제인데,
외부 서버를 쓰면:
socketClient.ts

기존:
io("/")

변경:
io("https://내-socket-server주소")
만 하면 됩니다.
실제 작업 순서
1. server 폴더만 별도 배포
Render 기준:
Root Directory:
server
설정
Build:
npm install
npm run build
Start:
npm run start
2. 환경변수 설정
예:
PORT=3001
CORS_ORIGIN=https://sj.wizide.com
현재 CORS도 이미 되어 있다고 했으니 거의 그대로 갑니다.
3. 프론트 주소 변경
현재:
io("/")
또는
io(window.location.origin)
같은 코드일 가능성이 높습니다.
변경:
io("https://socket-server주소")
4. 테스트
브라우저 두 개:
A:
sj.wizide.com
호수공원 입장
B:
sj.wizide.com
호수공원 입장
확인:
A 캐릭터 보임
B 캐릭터 보임
이동 동기화
채팅
한 가지 체크할 부분
server/src/index.ts에서 혹시 이렇게 되어 있으면:
const server = app.listen(3001)
괜찮습니다.
하지만:
localhost
로 바인딩되어 있으면 수정 필요합니다.
좋은 형태:
app.listen(PORT, "0.0.0.0")
제 추천 결론
현재 상태 기준:
방법	추천
회사 Istio 수정	⭐⭐⭐ (정석, 하지만 권한 필요)
Render/Railway 배포	⭐⭐⭐⭐⭐ (현재 상황 최적)
Cloudflare Tunnel	⭐⭐ (임시)
Firebase 변경	❌ (갈아엎음)
민주님은 이미 서버 코드가 있으니까 Render/Railway로 Socket.IO 서버만 띄우는 방향이 제일 빠릅니다.
다음 단계는 server/package.json 확인입니다.
거기에 build, start 스크립트가 있는지 보면 바로 배포 가능 여부 판단할 수 있습니다.
```

## 변경 파일 목록

- `render.yaml`: Render Docker Web Service, 싱가포르 리전, 단일 인스턴스, 운영 CORS 및 필수 비밀 환경변수 Blueprint 추가
- `react-app/server/package.json`: 컴파일된 서버를 실행하는 `start` 스크립트 추가
- `react-app/server/src/index.ts`: Render 프록시 접근을 위한 `0.0.0.0` 명시 바인딩
- `react-app/deploy/README.md`: 실제 모노레포 Root Directory 제약, Render 배포·헬스 체크·프런트 Socket URL 설정 안내 추가
- `devlog.md`: 작업 요약 행 추가
- `devlog/2026-08-06/044-prepare-render-realtime-deploy.md`: 상세 작업 이력 추가

## 검증 결과

- `npm --prefix server run typecheck`: 통과
- `npm --prefix server run build`: 통과
- `node --check react-app/server/dist/server/src/index.js`: 통과
- `npm run test:multiplayer`: 두 클라이언트 입장·이동·근처 채팅·맵 격리 통과
- `render.yaml`: YAML 파싱 통과
- 실제 Render 배포와 Docker 이미지 빌드는 이 환경에 Render 계정·Docker 실행 도구가 없어 미수행
