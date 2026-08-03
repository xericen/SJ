# 여기 사람 있음

## JoChiWon Communications WIZ 통합

`react-app/`에는 `LeeDoHyung760/JoChiWon-Communications`의 React·Vite·Express 원본 소스가 보존되어 있습니다. 프런트엔드는 상대 경로 기반으로 빌드하여 `src/assets/jochwon-app/`에 배치하고, WIZ `/home` 페이지가 격리된 iframe으로 해당 정적 앱을 제공합니다.

```text
react-app/                         React·Vite·Express 원본
react-app/dist/                    React 빌드 결과(커밋 제외)
src/assets/jochwon-app/            WIZ가 제공하는 정적 프런트엔드 번들
src/app/page.home/                 /home iframe 어댑터
```

React 프런트엔드 수정 후에는 `react-app/`에서 `npm run build`를 실행하고 `dist/` 결과를 `src/assets/jochwon-app/`에 갱신한 뒤 WIZ 일반 빌드를 실행합니다. Express·Socket.IO·MySQL API는 WIZ Python 런타임에 자동 포함되지 않으므로 별도 백엔드 배포 또는 WIZ API 이식이 필요합니다. 백엔드 환경변수 형식은 `react-app/server/.env.example`을 참고합니다.

세종시 생활권을 기반으로 가까운 이웃, 동아리, 지역 활동을 연결하는 로컬 커뮤니티 웹 서비스입니다. 사용자는 관심사와 생활권을 선택하고 캐릭터로 동네 공간을 탐색하며, 주변 이웃과 모임을 발견할 수 있습니다.

> 현재 저장소는 해커톤 프로토타입입니다. 회원가입·로그인은 서버와 데이터베이스에 연결되어 있지만, 채팅·알림·일부 커뮤니티 활동은 사용자 경험 검증을 위한 시뮬레이션 데이터로 동작합니다.

## 주요 기능

### 지역 기반 탐색

- 세종시 1~6생활권과 읍·면 통합 공간 제공
- 생활권별 장소, 접속 인원, 모임 현황 시각화
- 브라우저 위치 권한을 활용한 현장 확인 흐름
- 전체 화면 월드맵과 키보드 캐릭터 이동·점프

### 이웃과 커뮤니티

- 관심사 기반 이웃·동아리 탐색
- 동아리 상세 정보, 가입 상태, 활동 기록 및 성장 요소
- 이웃 팔로우, 대화, 알림, 동네 소식 UI
- 사람·모임·장소를 아우르는 통합검색 UI

### 계정과 운영 기능

- 이메일·비밀번호 회원가입 및 로그인
- bcrypt 비밀번호 해시 저장과 서버 세션 관리
- 프로필 및 비밀번호 변경
- 멤버, 게시물, 댓글을 관리하는 운영 화면

## 기술 구성

| 영역 | 기술 |
|---|---|
| 프레임워크 | WIZ Framework |
| 프런트엔드 | Angular, TypeScript, Pug, SCSS |
| 백엔드 | Python, WIZ App API |
| 데이터 접근 | Peewee 기반 WIZ ORM |
| 데이터베이스 | MySQL(계정), SQLite(게시물 기본 구성) |
| 인증 | bcrypt, 서버 세션 |

## 아키텍처

```text
Browser
  └─ Angular Page / Layout / Component
       └─ wiz.call(...)
            └─ App API (api.py)
                 └─ Struct (도메인 로직)
                      └─ DB Model / ORM
                           └─ MySQL 또는 SQLite
```

- `Controller`: 인증과 요청 전처리를 담당합니다.
- `App API`: 요청 검증과 응답 생성을 담당합니다.
- `Struct`: 인증, 사용자, 게시물 등 도메인 규칙을 캡슐화합니다.
- `DB Model`: 테이블 스키마와 ORM 접근을 담당합니다.
- `Portal Package`: 여러 화면에서 재사용하는 기능을 패키지 단위로 관리합니다.

## 저장소 구조

```text
.
├── config/                         # 로컬/배포 설정(커밋 제외)
├── devlog/                         # 날짜별 변경 상세 기록
├── src/
│   ├── angular/                    # Angular 전역 설정과 스타일
│   ├── app/
│   │   ├── page.home/              # 서비스 랜딩·가입·동네 월드
│   │   ├── page.access/            # 운영 화면 로그인
│   │   ├── page.dashboard/         # 운영 대시보드
│   │   ├── page.members/           # 멤버 관리
│   │   ├── page.mypage/            # 프로필 관리
│   │   ├── page.posts*/            # 게시물 라우팅 페이지
│   │   ├── layout.*/               # 페이지 레이아웃
│   │   └── component.*/            # 공통 UI 컴포넌트
│   ├── controller/                 # 인증·권한 전처리
│   ├── model/                      # 사용자 모델과 Struct
│   ├── portal/
│   │   ├── post/                   # 게시물·댓글 패키지
│   │   └── season/                 # WIZ 공통 패키지
│   └── assets/                     # 브랜드, 글꼴, 정적 자산
├── .env.example                    # 환경변수 이름과 예시 형식
├── .gitignore                      # 비밀정보·빌드 산출물 제외 규칙
└── devlog.md                       # 변경 이력 인덱스
```

## 화면 경로

| 경로 | 접근 | 설명 |
|---|---|---|
| `/home` | 공개 | 랜딩, 회원가입·로그인, 생활권 및 동아리 탐색 |
| `/access` | 공개 | 운영 화면 로그인 |
| `/dashboard` | 로그인 | 서비스 현황 대시보드 |
| `/posts` | 로그인 | 게시물 목록 |
| `/posts/:id/:tab?` | 로그인 | 게시물 상세·편집 |
| `/members` | 로그인 | 멤버 검색·초대·삭제 |
| `/mypage` | 로그인 | 프로필·비밀번호 관리 |

## 주요 App API

WIZ의 `wiz.call()`이 현재 App의 API 함수를 호출합니다.

| App | 함수 | 설명 |
|---|---|---|
| `page.home` | `signup`, `login`, `me`, `logout` | 사용자 가입, 인증, 세션 조회·해제 |
| `page.access` | `login` | 운영 화면 로그인 |
| `page.dashboard` | `overview` | 대시보드 요약 조회 |
| `page.members` | `list`, `invite`, `remove` | 멤버 조회·초대·삭제 |
| `page.mypage` | `get`, `update_profile`, `change_password` | 내 정보 조회·수정 |
| `portal/post/list` | `categories`, `search` | 게시물 분류·검색 |
| `portal/post/detail` | `get`, `save`, `delete` | 게시물 상세·저장·삭제 |

## 환경 설정

실제 접속 정보는 저장소에 커밋하지 않습니다. 배포 환경에서 다음 환경변수를 주입하고, 로컬에서는 별도의 `config/database.py`를 사용합니다.

| 변수 | 용도 | 공개 저장소 포함 여부 |
|---|---|---|
| `SJ_DB_HOST` | MySQL 호스트 | 금지 |
| `SJ_DB_PORT` | MySQL 포트 | 형식만 공개 가능 |
| `SJ_DB_USER` | MySQL 사용자 | 금지 |
| `SJ_DB_PASSWORD` | MySQL 비밀번호 | 금지 |
| `SJ_DB_NAME` | 프로젝트 데이터베이스 | 금지 |

설정 형식은 `.env.example`을 참고하세요. 저장소의 예시는 모두 비실제 값이며, 운영 자격증명은 배포 시스템의 Secret 기능으로 관리해야 합니다.

## 개발 및 검증

1. WIZ IDE에서 `main` 프로젝트를 선택합니다.
2. 필요한 환경변수 또는 로컬 `config/database.py`를 준비합니다.
3. WIZ 프로젝트 일반 빌드(`clean=false`)를 실행합니다.
4. `/home`에서 공개 사용자 흐름을 확인합니다.
5. 인증 후 운영 경로의 접근 제어와 API 동작을 확인합니다.

변경 제출 전 최소 확인 항목:

```text
- WIZ 일반 빌드 성공
- git diff --check 통과
- 비밀정보 및 개인키 미포함
- 신규 기능의 devlog 작성
```

## 보안 원칙

- 비밀번호는 bcrypt로 해시한 값만 저장합니다.
- 사용자 조회 응답에서 비밀번호 필드를 제거합니다.
- 인증이 필요한 화면은 `user` Controller를 거칩니다.
- `.env`, `config/`, 데이터 파일, 인증서, 개인키는 Git에서 제외합니다.
- Deploy Key 개인키는 저장소의 `.git/` 내부 로컬 영역에만 보관합니다.
- 운영 DB에는 애플리케이션 전용 최소 권한 계정을 사용해야 합니다.
- 공개 저장소의 devlog와 문서에도 실제 호스트·계정·비밀번호를 기록하지 않습니다.

## 현재 제한사항

- 채팅, 알림, 이웃 활동 일부는 실시간 서버가 아닌 화면 내 시뮬레이션입니다.
- 동아리 가입 상태와 캐릭터 설정 일부는 브라우저 `localStorage`에 저장됩니다.
- 위치 확인은 브라우저 권한과 실행 환경에 영향을 받습니다.
- 이메일 인증, 로그인 실패 제한, 계정 복구 기능은 추가 구현이 필요합니다.
- 운영 전 권한 체계, 감사 로그, 개인정보 보존·파기 정책 검토가 필요합니다.

## 변경 이력

작업 요약은 [`devlog.md`](devlog.md), 상세 내용은 `devlog/YYYY-MM-DD/`에서 확인할 수 있습니다.
