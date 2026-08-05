# Express · Socket.IO 운영 배포

이 디렉터리는 실시간 다중 사용자 서버를 운영 환경에 배포하기 위한 Docker Compose와 Nginx 예시를 제공합니다. Node 프로세스는 `127.0.0.1:3001`에만 바인딩하고, 공개 트래픽은 기존 HTTPS 프록시를 통해 전달하는 구성을 전제로 합니다.

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
