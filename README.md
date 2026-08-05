# 세종한바퀴 · 여기 사람 있음

세종시의 생활권, 공공 공간, 문화·관광 자원과 지역 커뮤니티를 하나의 3D 월드에서 연결하는 웹 서비스입니다. 사용자는 카카오 또는 체험 계정으로 접속해 캐릭터를 만들고, 세종의 여러 공간을 이동하며 이웃·동아리·프로젝트를 만나고 AI 기반 지역 추천과 체험 콘텐츠를 이용할 수 있습니다.

- 운영 화면: `https://sj.wizide.com/home`
- 배포 형태: WIZ Framework + React/Vite 정적 앱 + 선택형 Express/Socket.IO API
- 데이터베이스: MySQL
- 현재 상태: 해커톤 프로토타입

> 이 저장소에는 소스 코드와 공개 가능한 설정 예시만 포함합니다. 실제 DB 주소·계정·비밀번호, API 키, 세션 비밀값은 커밋하지 않습니다.

## 1. 주요 기능

### 계정과 프로필

- 카카오 OAuth 로그인 및 WIZ 서버 세션 연결
- 브라우저 세션별 체험 계정 생성
- 이메일·비밀번호 기반 WIZ 회원가입과 로그인
- 닉네임, 관심사, 생활권, 캐릭터 설정 저장
- 회원 탈퇴 시 사용자와 AI 행동 데이터 삭제 및 카카오 연결 해제 지원
- 새로고침 후 로그인·프로필·캐릭터·현재 월드 복원

### 3D 세종 월드

- 세종 생활권 및 주요 장소를 3D 월드로 탐색
- 키보드 이동, 달리기, 점프, 카메라 회전과 줌
- 비회원의 캐릭터 없는 맵 미리보기 및 자유 카메라 탐색
- 월드별 포털 기준 고정 진입과 공용 리스폰 위치
- 비버·충녕이·사람형 GLB 캐릭터 및 Idle/Walk/Run 애니메이션
- 대형 GLB 실패 시 안전한 fallback 처리

대표 공간:

- 세종호수공원, 베어트리파크, 국립세종수목원
- 정부세종청사 중앙광장, 미래 세종관, 세종예술의전당
- 공동캠퍼스 학생회관·프로젝트실·모집센터
- 동아리 거리, 축제 체험장, 먹거리 체험장
- 천문대, 개인 공간, 조치원 지역 공간

### 스마트시티와 공공 체험

- 미래 세종관 서비스별 디지털 트윈 홀로그램
- 중앙 테이블 HTML 키오스크와 서비스 선택 UI
- 스마트교통·안전·환경·복지 등 세종 서비스 체험
- 실제 GLB 기반 드래그형 스마트시티 라이브 미리보기
- 정부청사 중앙광장 AI 세종 추천센터
- 단계형 분석·추천·시네마틱 피날레 연출
- 소파 앉기, 가구 충돌, 포털 위치 편집·저장

### 이웃·동아리·프로젝트

- 관심사와 생활권 기반 이웃·동아리 탐색
- 동아리 생성·가입, 회장·임원·부원 역할 관리
- 동아리 피드, 사진, 활동 기록과 프로젝트 연결
- 공동캠퍼스 프로젝트 로비·프로젝트실·모집센터 연동
- 장소 투표, 활동 주제, 소개 문구 등 협업 경험
- 연령 그룹과 공개 설정을 고려한 실시간 대화 정책

### AI와 지역 데이터

- OpenAI 기반 충녕이 대화 및 세종 장소 추천
- 대화에서 관심사를 추출해 추천 프로필에 반영
- 공동캠퍼스 동행 장소와 프로젝트 활동 추천
- 세종시·한국관광공사 축제 API 연동
- Kakao Local 기반 주변 장소 검색
- API 키가 없는 개발 환경을 위한 mock provider 지원

## 2. 시스템 구성

```text
Browser
  └─ WIZ /home
      └─ iframe: /assets/jochwon-app/index.html
          ├─ React + Vite UI
          ├─ Three.js / Phaser 3D 월드
          ├─ WIZ App API: /wiz/api/page.home/*
          ├─ WIZ Auth Route: /auth/*
          └─ 선택형 Node API: /api/*, /socket.io/*

WIZ Python
  ├─ 카카오·체험 로그인과 서버 세션
  ├─ 사용자·캐릭터·AI 행동 상태
  └─ Peewee/WIZ ORM → MySQL

Express + Socket.IO
  ├─ 커뮤니티·동아리·프로필·AI 추천 API
  ├─ 실시간 룸·캐릭터·포털 상태
  └─ mysql2 JSON document adapter → MySQL
```

React 원본과 WIZ 배포 번들은 다음처럼 분리되어 있습니다.

```text
react-app/                         React·Vite·Express 원본
react-app/dist/                    Vite 빌드 결과, Git 제외
src/assets/jochwon-app/            WIZ가 제공하는 버전 관리 정적 번들
src/app/page.home/                 /home iframe과 WIZ App API
src/portal/season/route/auth/      인증·체험 로그인·번들 CORS 라우트
```

Vite의 `base`는 `/auth/jochwon-assets/`입니다. 해시 번들은 WIZ 인증 라우트가 `src/assets/jochwon-app/`에서 읽어 CORS 헤더와 장기 캐시 헤더를 포함해 제공합니다. `/home`의 iframe 진입 파일에는 빌드 쿼리를 붙여 새 배포 시 오래된 브라우저 캐시를 갱신합니다.

## 3. 기술 스택

| 영역 | 기술 |
|---|---|
| WIZ 프런트 어댑터 | Angular, TypeScript, Pug, SCSS |
| 서비스 프런트엔드 | React, TypeScript, Vite |
| 3D·게임 | Three.js, Phaser, GLB/GLTF, `@google/model-viewer` |
| WIZ 백엔드 | Python, WIZ App API, WIZ Session, Peewee ORM |
| Node 백엔드 | Express 5, Socket.IO, TypeScript |
| 데이터베이스 | MySQL 8 계열, `mysql2`, WIZ MySQL ORM |
| AI·지역 API | OpenAI, Kakao Local, 세종시 API, 한국관광공사 API |
| 검증 | TypeScript compiler, Vite build, Node test runner, WIZ build |

MongoDB와 Mongoose는 현재 런타임에서 사용하지 않습니다. 기존 문서형 모델 호출부는 `react-app/server/src/database/mysqlJsonModel.ts`의 MySQL 어댑터로 호환합니다.

## 4. 저장소 구조

```text
.
├── .env.example                    WIZ 배포 환경변수 예시
├── config-sample/
│   ├── database.py                 WIZ MySQL namespace 예시
│   └── secret.py                   WIZ 외부 API 비밀값 예시
├── devlog.md                       변경 이력 인덱스
├── devlog/YYYY-MM-DD/              작업별 상세 기록
├── react-app/
│   ├── .env.example                Vite 공개 환경변수 예시
│   ├── src/                        React UI, 3D 월드, 상태·서비스
│   ├── public/                     공개 이미지·폰트·정적 파일
│   ├── scripts/                    GLB 검사·생성·미리보기 도구
│   ├── shared/                     클라이언트·서버 공용 타입과 이벤트
│   └── server/
│       ├── .env.example            Express 운영 환경변수 예시
│       └── src/                    API, Socket.IO, MySQL 모델, 테스트
├── src/
│   ├── app/page.home/              WIZ 서비스 진입·인증·행동 API
│   ├── controller/                 WIZ 인증·권한 전처리
│   ├── model/                      WIZ 사용자·행동 상태 모델
│   ├── portal/                     WIZ 공용 패키지와 인증 라우트
│   └── assets/jochwon-app/         운영용 React 정적 번들
└── tools/                           캐릭터·GLB 회귀 검증 도구
```

`react-app/src/assets/maps/`에는 운영에 필요한 GLB와 미리보기가 포함됩니다. 일부 파일이 수십 MB이므로 새 대형 자산을 추가하기 전 저장소 크기와 Git LFS 적용 여부를 검토해야 합니다.

## 5. 데이터베이스

### WIZ 데이터 모델

WIZ ORM은 `config/database.py`의 `base` namespace를 사용합니다.

| 테이블 | 용도 | 주요 데이터 |
|---|---|---|
| `user` | WIZ 로그인·프로필 | 이메일, bcrypt 비밀번호, 이름, 캐릭터, 역할 |
| `ai_behavior_state` | 월드 행동 상태 | 사용자 ID, 버전, JSON payload |

`src/model/struct.py`가 시작 시 테이블을 `safe=True`로 생성합니다. 회원 탈퇴는 트랜잭션 안에서 행동 상태를 먼저 삭제하고 사용자 레코드를 삭제합니다.

### Express 데이터 모델

Express 서버는 시작할 때 다음 공용 문서 테이블을 생성합니다.

```sql
CREATE TABLE IF NOT EXISTS jochwon_documents (
  collection_name VARCHAR(80) NOT NULL,
  document_id VARCHAR(64) NOT NULL,
  document_data LONGTEXT NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (collection_name, document_id),
  KEY idx_jochwon_documents_collection (collection_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

주요 collection은 `users`, `clubs`, `community_posts`, `direct_rooms`, `direct_messages`, `ai_place_recommendations`, `joint_campus_recommendations`, `campus_feature_portals`, `recruitment_profile_requests`, `world_respawn_positions`입니다.

운영 DB 계정에는 해당 스키마에 대한 `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `CREATE` 권한이 필요합니다. `root` 대신 이 서비스 전용 최소 권한 계정을 사용하세요.

### WIZ MySQL 설정

공개 예시는 `config-sample/database.py`에 있습니다. 배포 환경변수를 주입하거나, Git에서 제외되는 `config/database.py`에 같은 구조로 설정합니다.

```bash
SJ_DB_HOST=db.example.internal
SJ_DB_PORT=3306
SJ_DB_USER=jochwon_app
SJ_DB_PASSWORD=replace-with-a-secret
SJ_DB_NAME=jochwon
```

`base`와 `post` namespace는 현재 동일한 MySQL 데이터베이스를 가리키도록 구성합니다.

## 6. 환경변수

### Vite 클라이언트

`react-app/.env.example`을 `react-app/.env.local`로 복사합니다.

| 변수 | 기본값 | 설명 |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | Express API 기준 URL |
| `VITE_SOCKET_URL` | 현재 origin | Socket.IO 서버 URL |
| `VITE_CHARACTER_DEBUG` | `false` | 개발 캐릭터 디버그 UI |

`VITE_` 변수는 브라우저 번들에 포함되므로 비밀값을 넣으면 안 됩니다.

### Express 서버

`react-app/server/.env.example`을 `react-app/server/.env`로 복사한 뒤 값을 입력합니다.

필수 운영 항목:

| 변수 | 설명 |
|---|---|
| `NODE_ENV` | `production` 권장 |
| `PORT` | Express/Socket.IO 포트 |
| `CLIENT_ORIGIN` | 허용할 프런트 origin 한 개 |
| `MYSQL_HOST`, `MYSQL_PORT` | MySQL 접속 위치 |
| `MYSQL_USER`, `MYSQL_PASSWORD` | 애플리케이션 DB 계정 |
| `MYSQL_DATABASE` | 사용할 스키마 이름 |
| `AUTH_SESSION_SECRET` | 32자 이상의 무작위 세션 비밀값 |

선택 연동 항목:

| 변수 | 설명 |
|---|---|
| `AI_PROVIDER` | `auto`, `mock`, `openai` |
| `PLACE_PROVIDER` | `auto`, `mock`, `kakao` |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | AI 추천·분석·충녕이 |
| `KAKAO_REST_API_KEY` | 카카오 로그인·장소 검색 |
| `KAKAO_REDIRECT_URI` | Express 카카오 콜백 URL |
| `KAKAO_CLIENT_SECRET` | 카카오 앱에서 사용 시 입력 |
| `SEJONG_API_KEY` | 세종시 축제 API |
| `TOUR_API_KEY` | 한국관광공사 API |
| `ALLOW_MOCK_FALLBACK` | 외부 provider 실패 시 mock 허용 여부 |

타임아웃, 재시도, 검색 반경, 추천 개수와 캐시 한도는 `react-app/server/.env.example`에 모두 정리되어 있습니다.

### WIZ 비밀 설정

`config-sample/secret.py`를 참고해 Git에서 제외된 `config/secret.py` 또는 배포 Secret에 설정합니다.

- `OPENAI_API_KEY`, `OPENAI_MODEL`
- `KAKAO_REST_API_KEY`, `KAKAO_CLIENT_SECRET`, `KAKAO_ADMIN_KEY`
- `KAKAO_LOGIN_SCOPES`, `KAKAO_SERVICE_TERMS`
- `SEJONG_API_KEY`, `TOUR_API_KEY`

카카오 WIZ 콜백은 운영 origin의 `/wiz/api/page.home/login`을 사용합니다. Kakao Developers의 Redirect URI와 정확히 일치해야 합니다.

## 7. 로컬 실행

요구사항:

- Node.js 20 이상
- npm
- MySQL 8 계열
- WIZ Framework 개발 환경

React와 Express 의존성을 설치합니다.

```bash
cd react-app
npm ci
npm --prefix server ci
```

환경 파일을 준비한 뒤 프런트와 서버를 함께 실행합니다.

```bash
cp .env.example .env.local
cp server/.env.example server/.env
npm run dev
```

- Vite: `http://localhost:5173`
- Express: `http://localhost:3001`
- 상태 확인: `GET http://localhost:3001/health`

Vite 개발 서버는 `/api`와 `/socket.io`를 로컬 Express 서버로 프록시합니다.

## 8. 빌드와 WIZ 반영

React·Express 전체 TypeScript 빌드:

```bash
cd react-app
npm run build
```

이 명령은 다음을 순서대로 실행합니다.

1. React TypeScript project build
2. Vite 프로덕션 번들 생성
3. Express TypeScript build

React 수정 후 `react-app/dist/`를 WIZ 정적 자산에 정확히 동기화해야 합니다. 해시가 바뀐 이전 파일이 남지 않도록 삭제 동기화를 사용합니다.

```bash
rsync -a --delete react-app/dist/ src/assets/jochwon-app/
```

이후 WIZ 프로젝트 일반 빌드(`clean=false`)를 실행하고 `/home`을 확인합니다. `src/app/page.home/view.pug`의 `_build` 쿼리도 새 배포 식별자로 갱신하면 브라우저 캐시로 인한 빈 화면을 방지할 수 있습니다.

Express·Socket.IO는 WIZ 정적 빌드에 자동 포함되지 않습니다. 이 API를 운영에서 사용할 경우 별도 Node 프로세스로 배포하고 `/api`, `/socket.io` 리버스 프록시를 구성해야 합니다.

## 9. API 개요

### WIZ App API

| 함수 | 설명 |
|---|---|
| `signup`, `login`, `me`, `logout` | WIZ 계정과 세션 |
| `save_avatar` | 사용자 캐릭터 저장 |
| `kakao_start` | 카카오 OAuth 시작 |
| `withdraw` | 계정·연관 데이터 삭제 |
| `behavior_state` | 월드별 AI 행동 상태 조회·저장 |
| `api_config_status` | 비밀값 노출 없는 provider 설정 상태 |

### Express REST API

| 경로 | 설명 |
|---|---|
| `/health` | 서버 상태 |
| `/api/auth` | 로그인·카카오 인증·세션 |
| `/api/account`, `/api/profile` | 계정 삭제와 프로필 |
| `/api/community` | 커뮤니티 게시물 |
| `/api/clubs` | 동아리 생성·가입·역할·활동 |
| `/api/direct-rooms` | 1:1 대화 추천과 만남 장소 |
| `/api/ai` | 장소·공동캠퍼스 AI 추천 |
| `/api/chungnyeong` | 충녕이 AI 도구 |
| `/api/festivals` | 세종·관광공사 축제 데이터 |

Socket.IO는 룸 입장·퇴장, 캐릭터 이동, 채팅, 공용 리스폰, 공동캠퍼스 포털 위치와 프로젝트룸 상태를 동기화합니다.

## 10. 테스트와 검증

백엔드 자동 테스트:

```bash
cd react-app/server
npm test
```

추가 검증:

```bash
cd react-app
npm run test:character
npm run test:greenhouse
npm run verify:providers
```

커밋 전 최소 확인 항목:

- `npm run build` 성공
- 백엔드 테스트 전체 통과
- React `dist`와 `src/assets/jochwon-app` 파일 일치
- WIZ 일반 빌드 성공
- `/home`과 최신 정적 번들 HTTP 200
- MySQL 연결 및 `jochwon_documents` 조회 성공
- `git diff --check` 통과
- `.env`, 실제 DB 정보, API 키, 개인키 미추적
- `devlog.md`와 날짜별 상세 devlog 작성

## 11. 보안 원칙

- 실제 `.env`, `config/`, 인증서, 개인키와 DB 데이터 파일은 Git에서 제외합니다.
- 비밀번호는 bcrypt 해시만 저장하고 API 응답에서 제거합니다.
- WIZ 카카오 OAuth는 `state`를 사용해 요청을 검증합니다.
- Express 세션 쿠키는 서명하고 운영에서는 HTTPS·보안 쿠키를 사용합니다.
- API 요청 크기, 추천 입력 길이, provider 타임아웃과 캐시 크기를 제한합니다.
- 회원 탈퇴는 서버에서 인증한 현재 사용자만 수행할 수 있어야 합니다.
- 운영 CORS의 `CLIENT_ORIGIN`은 실제 서비스 origin 하나로 제한합니다.
- DB는 외부 공개를 피하고 애플리케이션 전용 최소 권한 계정을 사용합니다.
- 커밋 전 비밀정보 패턴과 대용량 파일을 다시 검사합니다.

## 12. 알려진 제한사항

- WIZ Python API와 Express API가 공존하므로 운영 기능별 책임과 프록시 구성을 명확히 유지해야 합니다.
- 일부 커뮤니티·알림 데이터는 프로토타입용 seed 또는 브라우저 상태를 사용합니다.
- 실시간 다중 사용자 기능은 단일 브라우저 테스트만으로 완전히 검증할 수 없습니다.
- 외부 AI·지역 API 기능은 키, 할당량, 응답 지연과 제공기관 장애의 영향을 받습니다.
- 일부 JavaScript 청크가 500KB를 넘고 대형 GLB가 있어 초기 로딩 최적화가 필요합니다.
- 현재 대형 3D 자산은 일반 Git으로 관리됩니다. 자산 증가 시 Git LFS 또는 별도 CDN을 권장합니다.

## 13. 변경 이력

작업 요약은 [`devlog.md`](devlog.md), 상세 구현·검증 기록은 `devlog/YYYY-MM-DD/`에서 확인할 수 있습니다.
