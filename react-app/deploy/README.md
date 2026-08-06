# Express · Socket.IO 운영 배포

이 디렉터리는 실시간 다중 사용자 서버를 운영 환경에 배포하기 위한 Docker Compose와 Nginx 예시를 제공합니다. Node 프로세스는 `127.0.0.1:3001`에만 바인딩하고, 공개 트래픽은 기존 HTTPS 프록시를 통해 전달하는 구성을 전제로 합니다.

회사 인프라의 프록시를 변경할 수 없을 때는 저장소 루트의 [`render.yaml`](../../render.yaml)로 Node 서버만 Render에 배포할 수 있습니다. 서버가 `react-app/shared/`와 루트 의존성을 함께 사용하므로 Render의 Root Directory를 `server`로 설정하면 안 됩니다. Blueprint가 지정한 `react-app` Docker build context와 `server/Dockerfile`을 그대로 사용합니다.

## 1. 환경 변수 준비

```bash
cp server/.env.example server/.env
chmod 600 server/.env
```

`MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`를 운영 MySQL 값으로 설정합니다. `CLIENT_ORIGIN`은 공개 프런트 주소(운영 기준 `https://sj.wizide.com`) 하나로 제한합니다. AI 기능을 운영할 때만 `OPENAI_API_KEY`를 입력합니다. `.env`는 Git에 포함되지 않습니다.

## 2. 컨테이너 실행

`react-app/`에서 다음을 실행합니다.

```bash
docker compose -f deploy/docker-compose.yml up -d --build
docker compose -f deploy/docker-compose.yml ps
curl --fail http://127.0.0.1:3001/health/ready
```

`/health/live`는 프로세스 생존 여부, `/health/ready`는 MySQL 연결과 실시간 서버 준비 여부를 확인합니다. 방 상태의 JSON 파일은 이름 있는 Docker 볼륨에 저장되어 컨테이너 재생성 후에도 유지됩니다.

## 3. HTTPS 프록시 연결

[`nginx/jochwon-node.conf.example`](./nginx/jochwon-node.conf.example)의 두 `location` 블록을 `sj.wizide.com`의 기존 TLS `server` 블록에 포함합니다.

```bash
nginx -t
systemctl reload nginx
```

`/socket.io/`에는 WebSocket 업그레이드 헤더가 반드시 필요합니다. 프록시 적용 후 브라우저 두 개 또는 시크릿 창을 함께 열어 위치 이동과 근처 채팅이 서로 전달되는지 확인합니다.

## 4. 자동 다중 사용자 검증

```bash
npm run build
npm run test:multiplayer
```

검증 스크립트는 임시 포트에서 컴파일된 운영 서버를 실행하고 두 WebSocket 클라이언트의 입장, 이동 브로드캐스트, 근처 채팅, 맵 이동 후 방 격리를 검사합니다. 실제 운영 MySQL 연결도 준비 상태 검사에 포함됩니다.

## 5. 운영 명령

```bash
docker compose -f deploy/docker-compose.yml logs -f realtime-api
docker compose -f deploy/docker-compose.yml restart realtime-api
docker compose -f deploy/docker-compose.yml pull
docker compose -f deploy/docker-compose.yml up -d --build
```

방 상태 볼륨을 삭제하면 런타임 상태가 초기화되므로 운영 중 `down -v`는 사용하지 않습니다.

## 6. Render 독립 배포

1. Render Dashboard에서 이 저장소의 `render.yaml`을 사용하는 Blueprint를 생성합니다.
2. 생성 과정에서 `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `AUTH_SESSION_SECRET`을 입력합니다.
3. 배포가 끝나면 아래 주소가 JSON을 반환하는지 확인합니다.

```bash
curl --fail https://{render-service}.onrender.com/health/ready
```

4. WIZ에 포함할 React 앱을 빌드할 때 Render 서비스 주소를 지정합니다.

```bash
VITE_SOCKET_URL=https://{render-service}.onrender.com npm run build
```

`CLIENT_ORIGIN`은 Blueprint에서 `https://sj.wizide.com`으로 제한합니다. Render가 제공하는 `PORT`를 서버가 사용하며, 서버는 외부 프록시가 접근할 수 있도록 `0.0.0.0`에 바인딩됩니다.

현재 맵·사용자·그룹 상태는 Node 프로세스 메모리에 있으므로 Render 인스턴스는 1개로 유지합니다. 여러 인스턴스로 확장하려면 먼저 Socket.IO Redis 어댑터와 공유 상태 저장소를 도입해야 합니다.
