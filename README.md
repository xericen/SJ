# 세종한바퀴 — AI가 나의 행동을 기억하는 세종 메타버스

> 🌐 **Live Demo: [sj.wizide.com](https://sj.wizide.com/home)**

세종한바퀴는 사용자가 세종의 자연·문화·관광·커뮤니티 공간을 3D 메타버스에서 직접 탐험하고, 탐험 과정에서 발생한 행동 데이터를 AI가 분석하여 나만의 세종 프로필과 맞춤 경험을 만들어주는 체험형 AI 메타버스 플랫폼입니다.

**Explore → Experience → Understand → Personalize**

세종을 둘러보는 과정 자체가 사용자의 프로필이 됩니다. 단순히 질문 몇 개를 받아 추천하는 서비스가 아니라, 어디에 머물렀는지·무엇을 발견했는지·어떤 콘텐츠를 체험했는지를 Experience Harness가 기록하고 AI가 해석합니다.

## 세종한바퀴가 해결하는 문제

세종의 관광·문화·자연·커뮤니티 콘텐츠는 여러 서비스에 분산되어 있습니다. 단순한 정보 제공만으로는 사용자가 직접 체험하고 지역을 알아가며 사람과 연결되기 어렵습니다.

세종한바퀴는 사용자가 메타버스 세종을 탐험하고, AI가 이동·체류·콘텐츠 열람·체험 행동을 구조화해 자연·문화·미식·체험 취향 프로필을 생성하도록 설계했습니다. 마지막 정부청사에서는 누적 프로필을 바탕으로 AI가 개인화된 세종 코스를 추천합니다.

## 전체 사용자 흐름

```text
프로필 생성 → 세종호수공원
                 ├─ 세종예술의전당 · 축제부스 · 먹거리 부스
                 ├─ 베어트리파크 → 포토존 · 곰 체험소 · 수목원 → 마이홈
                 └─ 공동캠퍼스 → 학생회관 · 모집센터 · 동아리 거리제 · 프로젝트실
                                      ↓
정부청사 → 중앙광장 AI 추천센터 · 전망대 · 스마트시티
                                      ↓
실시간 AI 세종 프로필 + 프로젝트 기반 맞춤 코스 + 실제 방문 일정 저장
```

### 정부청사 중앙광장 3단계 일정 흐름

```text
01 PROJECT  프로젝트 로비에서 만들고 프로젝트실에서 완성한 일정 불러오기
      ↓
02 AI       프로젝트 코스를 홀로그램으로 확인 → 장소 추가 → AI 분석·최적화 → 일정 확정
      ↓
03 VISIT    02에서 확정한 코스만 저장·방문 기록하고 화면 안 카카오지도로 확인
```

- 완료 상태인 본인 생성·참여 프로젝트만 01과 02의 입력 데이터로 사용합니다.
- OpenAI 분석에는 관심사와 활동 기록뿐 아니라 역할, 선호 장소, 이용 목적, 거주지역, 세종 방문 경험과 MBTI를 포함한 전체 프로필을 전달합니다.
- 원형 AI 분석센터는 실제 프로필을 9단계로 분석하며 STEP 5·6은 결과를 충분히 읽을 수 있도록 표시 시간을 늘렸습니다.
- 02에서 일정 확정을 누르기 전에는 03이 비어 있으며, 확정된 프로젝트 코스와 별도의 AI 추천 코스가 섞이지 않습니다.
- AI 추천 일정은 내 프로필 추천 코스에 저장되고, 장소 지도는 새 창 대신 현재 HTML 화면 안에서 확인합니다.

## AI는 어디에 사용되었는가

```text
이동 / 체류 / 식물 발견 / 공연 시청 / 부스 참여 / 즐겨찾기
                         ↓
                  Experience Harness
                         ↓
                    행동 데이터 구조화
                         ↓
                         AI 분석
                         ↓
                    사용자 성향 프로필
                         ↓
                 세종 맞춤 경험·코스 추천
```

OpenAI API는 대화 생성만을 위한 장식이 아니라, 메타버스에서 실제로 발생한 행동의 맥락을 해석하고 사용자별 성향과 다음 경험을 연결하는 데 사용됩니다.

## 핵심 기능

- React·Three.js 기반 3D 세종 메타버스 탐험과 멀티플레이
- Experience Harness 기반 AI 행동 분석 및 자연·문화·미식·체험 성향 프로필
- 식물 도감·기억나무·마이홈 정원 미션
- 세종예술의전당 공연, 축제·먹거리 부스 체험
- 공동캠퍼스 동아리·모집글·프로젝트·실시간 교류
- 정부청사 AI 세종 프로필 분석과 맞춤 코스 추천

## 현재 공간 구성

현재 웹의 **공간 안내와 실제 탐험 동선에는 17개 맵**이 공개되어 있습니다. 코드 내부의 전환 상태나 개발용 식별자 수가 아니라, 사용자가 현재 웹에서 선택하고 입장할 수 있는 공간을 기준으로 집계했습니다.

| 권역 | 현재 맵 | 웹에서 실제로 하는 일 | Experience Harness·AI 반영 |
|---|---|---|---|
| 시작·문화 | 세종호수공원, 세종예술의전당, 축제부스, 먹거리 부스 | 공원 탐험, 공연 포스터·영상 열람, 축제·먹거리 상세 확인 | 이동·체류, 열람·관심·시청·부스 선택 기록 |
| 자연·마이홈 | 베어트리파크, 곰 체험소, 수목원, 마이홈 | 포토존, 곰 먹이 미션, 식물 관찰·채집, 기억나무, 정원 꾸미기 | 자연 성향, 미션 성장 이력과 최근 활동 기록 |
| 공동캠퍼스 | 공동캠퍼스, 학생회관, 모집센터, 동아리 거리제, 프로젝트실 | 사람·모집글·동아리·프로젝트 탐색 및 생성·참여 | 교류·협업·진로 관심을 키워드와 레이더에 반영 |
| 정부청사 | 정부청사, 중앙광장, 전망대, 세종 스마트시티 국가시범도시 | AI 추천센터, 전망·스마트시티 체험 | 전망대·스마트시티 방문 기록과 전체 행동 기반 종합 분석 |

17개 맵은 `마이홈`, `세종호수공원`, `세종예술의전당`, `축제 부스`, `먹거리 부스`, `베어트리파크`, `곰 체험소`, `국립세종수목원`, `공동캠퍼스`, `학생회관`, `모집센터`, `프로젝트실`, `동아리 거리제`, `정부청사`, `정부청사 중앙광장`, `전망대`, `세종 스마트시티 국가시범도시`입니다.

내 프로필의 키워드, 관심사 레이더, 저장된 관심사와 성장 이력은 Experience Harness 이벤트가 추가될 때마다 다시 집계되며 AI 종합 분석에 즉시 반영됩니다.

## 기술 구조

| 영역 | 기술 |
|---|---|
| Frontend | React, TypeScript, Three.js, Phaser |
| Backend | Express, Socket.IO, WIZ Python App API |
| AI | OpenAI API, Experience Harness |
| Database | MySQL 8, WIZ MySQL ORM, `mysql2` |
| Deployment | WIZ 웹 체험, Render Socket.IO 실시간 서버 |

## 배포 버전과 로컬 버전

제출 저장소는 전체 기능을 포함한 원본 프로젝트입니다. WIZ 배포 환경에서는 웹 3D 체험과 WIZ API를 제공하며, Render 서버가 연결된 배포 환경에서는 Socket.IO 기반 실시간 멀티플레이 기능을 제공합니다. 외부 API 키가 없는 로컬 환경에서는 mock provider로 핵심 흐름을 확인할 수 있습니다.

## 실행 방법

```bash
git clone https://github.com/xericen/SJ.git
cd SJ/react-app
npm install
cp .env.example .env.local
npm run dev
```

Express 서버가 필요한 경우 `react-app/server/.env.example`을 복사해 MySQL·세션·AI 환경변수를 설정합니다. 실제 API Key, DB 비밀번호, 세션 비밀값은 `.env`에만 저장하며 Git에 커밋하지 않습니다.

## 팀 역할

| 담당 | 역할 |
|---|---|
| 김민주 | AI 모델·Experience Harness·개인화 프로필 분석 |
| 팀원 | 3D 메타버스·Frontend |
| 팀원 | Backend·MySQL·Socket.IO |
| 팀원 | UI/UX·공간 체험 설계 |

> 팀원 이름과 세부 역할은 제출 전 실제 참여자 정보로 교체해 주세요.

---

## 세종한바퀴 프로젝트 개요

세종한바퀴는 세종시의 공공 공간, 문화·관광 자원과 지역 커뮤니티를 하나의 3D 월드로 연결한 체험형 AI 메타버스 플랫폼입니다. 사용자는 자신의 캐릭터로 현재 웹에 공개된 17개 맵을 탐험하고, 지역 이웃·동아리·모집글·프로젝트를 발견하며, Experience Harness가 기록한 행동을 AI가 해석해 개인화된 세종 프로필과 맞춤 코스로 연결합니다.

| 항목 | 내용 |
|---|---|
| 서비스 | [https://sj.wizide.com/home](https://sj.wizide.com/home) |
| 제출 형태 | 동작 가능한 웹 프로토타입 + 전체 소스 + 운영·검증 문서 |
| 핵심 기술 | WIZ, React, TypeScript, Three.js, Express, Socket.IO, MySQL |
| 로그인 | 카카오 OAuth, 이메일 로그인, DB 저장 없는 체험 모드 |
| 주요 가치 | 지역 탐험, 커뮤니티 연결, 생태·문화 체험, AI 장소 추천 |

> 이 저장소에는 소스 코드와 공개 가능한 설정 예시만 포함합니다. 실제 DB 주소·계정·비밀번호, API 키, 세션 비밀값은 커밋하지 않습니다.

### 해커톤 제출 핵심 메시지

세종한바퀴의 핵심은 관광지를 3D로 보여주는 데서 끝나지 않습니다. 사용자가 17개 공간에서 남긴 공연 열람, 음식·축제 선택, 식물 발견, 곰 체험, 사람·동아리·프로젝트 참여 기록을 하나의 프로필로 누적하고, 그 프로필을 다음 세종 방문 계획으로 다시 연결합니다.

```text
세종 공간 탐험 → 실제 행동 기록 → AI 성향 분석
              → 팀 프로젝트 일정 불러오기 → OpenAI 코스 분석·보완
              → 일정 확정·저장 → 새로운 방문 경험이 다시 프로필에 반영
```

심사자는 가입 없이 체험 모드로 전체 공간과 기본 인터랙션을 빠르게 확인할 수 있고, 카카오 로그인에서는 사용자별 누적 기록·협업 프로젝트·개인화 추천이 지속되는 완성 흐름을 확인할 수 있습니다.

### 해커톤 한눈에 보기

| 심사 포인트 | 구현 내용 |
|---|---|
| 지역 문제 해결 | 흩어진 세종 생활·문화·관광 정보와 사람 연결을 하나의 3D 탐험 흐름으로 통합 |
| 완성도 | 웹에 공개된 17개 맵, 로그인·체험 모드, 생태 미션, 커뮤니티, AI 추천을 실제 운영 URL에서 제공 |
| 데이터 지속성 | WIZ ORM과 Express `mysql2` 계층을 모두 MySQL로 구성하고 사용자별 진행도·공용 설정 저장 |
| 협업·실시간성 | Socket.IO 룸, 캐릭터 이동, 채팅, 공용 포털과 프로젝트 상태 동기화 |
| 운영 안전성 | 권한형 공간 편집, 서버 측 미션 검증, 비밀정보 분리, 상태 검사와 자동 회귀 테스트 적용 |
| 화면 완성도 | 1440×900 심사 화면에서 1320×880 캔버스를 유지하고 작은 화면은 반응형 레이아웃으로 전환 |

## 해커톤 문제 정의

세종의 생활 정보와 문화·관광 자원은 여러 서비스에 흩어져 있고, 새로 이사 온 주민·학생·청년이 “어디에 무엇이 있는지”뿐 아니라 “누구와 무엇을 할 수 있는지”까지 파악하기 어렵습니다. 기존 지도와 게시판은 장소 검색과 사람 연결이 분리되어 있어 실제 참여로 이어지는 동기가 약합니다.

이 프로젝트는 다음 흐름을 하나의 공간 경험으로 묶었습니다.

```text
3D 공간 탐험 → 지역 콘텐츠 체험 → 관심 행동 축적
              → 이웃·동아리·프로젝트 발견
              → AI 기반 장소·활동 추천 → 실제 세종 방문
```

## 핵심 해결 방식

- **웹에 공개된 17개 세종 맵을 하나의 월드로 연결**하고 공통 이동 조작, 지형별 카메라 프로필, 공용·로컬 포털 정책과 안전 도착 지점을 적용했습니다.
- **행동 기반 프로필**에 축제·먹거리·공연·생태 미션 기록을 모아 이웃과 활동 추천의 근거로 사용합니다.
- **MySQL 중심 저장 구조**로 계정, 프로필, 개인 팜 진행도, 커뮤니티, 동아리와 실시간 공간 상태를 보존합니다.
- **OpenAI·Kakao Local·공공데이터**를 연결하되, 키가 없는 심사·개발 환경에서는 mock provider로 핵심 흐름을 확인할 수 있습니다.
- **DB를 사용하지 않는 체험 모드**를 제공해 별도 가입 없이 주요 화면과 3D 월드를 바로 확인할 수 있습니다.
- **심사 환경에 맞춘 고정형 데스크톱 캔버스**와 모바일·태블릿 반응형 화면을 함께 제공해 화면 비율 변화에 따른 UI 왜곡을 줄였습니다.

## 심사 시연 동선

1. 운영 화면에서 `체험용으로 시작하기`를 선택합니다.
2. 캐릭터와 관심사를 정한 뒤 공간 안내에서 `마이홈` 또는 세종호수공원에 입장합니다.
3. 공통 걷기·달리기 조작과 공간별 지형에 맞춘 카메라로 웹에 공개된 17개 맵을 탐색합니다. 권한 계정에서는 지원 맵의 카메라 프로필을 조정해 모든 사용자에게 공유할 수 있습니다.
4. 국립세종수목원에서 14종 식물을 발견해 도감을 채우고 5·10·14종마다 성장하는 기억나무와 충녕 AI 분석을 확인합니다.
5. 베어트리파크에서 먹이를 하나씩 수집해 곰에게 5회 급여하고, 마이홈에서 꽃밭·곰 동상 보상과 실내 출입·좌석·침대 상호작용을 확인합니다.
6. 공동캠퍼스에서 학생회관·동아리 거리·모집센터·프로젝트실을 탐색합니다.
7. 세종예술의전당, 축제·먹거리 부스와 AI 추천 기능에서 지역 콘텐츠가 프로필과 추천으로 이어지는 과정을 확인합니다.

## 1. 주요 기능

### 계정과 프로필

- 카카오 OAuth 로그인 및 WIZ 서버 세션 연결
- 로그아웃 시 브라우저·WIZ·Node 인증 상태를 함께 초기화하고, 다음 카카오 로그인에서는 인증 화면을 다시 거치도록 서버 재인증 플래그 유지
- 로그인·DB 저장 없이 현재 웹에서만 유지되는 로컬 체험
- 이메일·비밀번호 기반 WIZ 회원가입과 로그인
- 닉네임, 관심사, 생활권, 캐릭터 설정 저장
- 회원 탈퇴 시 사용자와 AI 행동 데이터 삭제 및 카카오 연결 해제 지원
- 새로고침 후 로그인·프로필·캐릭터·현재 월드 복원

#### 체험용과 카카오 로그인 프로필의 차이

| 구분 | 체험용 | 카카오 로그인 |
|---|---|---|
| 시작 방법 | 카카오 인증 없이 `체험용으로 시작하기` 선택 | 카카오 OAuth 인증과 서비스 동의 후 시작 |
| 사용자 식별 | 현재 브라우저 안의 임시 사용자 | 카카오 계정에 연결된 고유 사용자 |
| 프로필 입력 | 닉네임·관심사·캐릭터를 임시 작성 | 닉네임, 역할, 이용 목적, 관심사, 선호 장소, 거주지역, 세종 방문 경험, MBTI, 캐릭터를 사용자 계정에 연결 |
| 저장 위치 | 브라우저 `localStorage`·`sessionStorage` | WIZ 세션과 MySQL 사용자 데이터 |
| 행동·미션 기록 | 현재 브라우저에서만 임시 누적 | Experience Harness, 식물도감, 기억나무, 곰 체험, 마이홈 보상과 최근 활동을 사용자별 누적 |
| AI 분석 범위 | 임시 프로필과 현재 체험에서 쌓인 행동을 기준으로 기본 흐름 확인 | 전체 프로필과 누적 행동, 저장 관심사, 프로젝트 역할·활동을 OpenAI 분석과 장소 추천에 활용 |
| 커뮤니티·프로젝트 | 화면과 기본 상호작용을 시연하기 위한 임시 체험 중심 | 모집글·동아리·프로젝트 생성 및 참여 기록을 계정에 연결하고, 완료 프로젝트 일정만 AI 일정에 전달 |
| 일정 저장 | 현재 브라우저에서 추천·확정 흐름 확인 | 02에서 확정한 프로젝트 코스를 03과 내 프로필 추천 세종 코스에 저장 |
| 재접속 | 브라우저 데이터 삭제, 체험 초기화 또는 환경 변경 시 사라질 수 있음 | 로그아웃 후 다시 카카오 인증하면 저장 프로필과 진행 기록 복원 |
| 여러 기기 | 다른 브라우저·기기로 자동 이전되지 않음 | 같은 카카오 계정으로 로그인해 서버 저장 데이터를 이어서 사용 |
| 로그아웃·보안 | 별도 외부 계정 세션 없음 | 로그아웃 시 브라우저·WIZ·Node 세션을 초기화하고 다음 로그인에서 카카오 인증을 다시 요청 |
| 권장 용도 | 해커톤 심사, 빠른 기능 확인, 가입 없는 데모 | 실제 사용자 활동 누적, 장기 프로필 성장, 협업 프로젝트와 개인화 일정 저장 |

체험용 데이터는 카카오 계정으로 자동 이전되지 않습니다. 체험 후 기록을 계속 보존하려면 카카오 로그인으로 새 프로필을 만들고 사용해야 합니다. 반대로 카카오 로그인 사용자는 단순히 화면에 이름만 표시되는 것이 아니라, 공간별 행동과 프로젝트 결과가 같은 사용자 ID에 누적되어 다음 AI 분석의 입력으로 다시 사용됩니다.

### 3D 세종 월드

- 세종 생활권 및 주요 장소를 3D 월드로 탐색
- 현재 웹에 공개된 17개 맵에 공통 이동 조작을 적용하고 호수공원·베어트리파크·마이홈·공동캠퍼스 등은 지형과 실내 구조에 맞춘 카메라 프로필 적용
- 키보드 이동, 달리기, 점프, 카메라 회전과 줌
- 비회원의 캐릭터 없는 맵 미리보기 및 자유 카메라 탐색
- 월드별 포털 기준 진입, 3초 연속 체류 이동과 서버 수락 재시도
- 세종호수공원 5개 포털 및 공용 리스폰 위치 고정
- 권한 기반 공용 포털 좌표 저장과 접속 사용자 동기화
- 권한 기반 지원 맵 카메라 편집 바와 MySQL 공용 프로필 저장·초기화
- 정부청사 맵 렌더링 예산과 픽셀 비율을 조정해 이동 중 프레임 저하 완화
- 정부청사 이동 속도 완화와 안정적인 지면 추적, 베어트리파크 주간 조명·노출 개선
- 비버·충녕이·사람형 GLB 캐릭터 및 Idle/Walk/Run 애니메이션
- 사용자·충녕이 고해상도 이름표와 경사면 수직 자세 보정
- 대형 GLB 실패 시 안전한 fallback 처리
- 공간안내 라이브 미리보기에서 일반 GLB는 독립 `model-viewer`, Meshopt 압축 GLB는 디코더가 등록된 Three.js 로더로 분리

대표 공간:

- 세종호수공원, 베어트리파크, 국립세종수목원
- 정부청사, 정부청사 중앙광장, 전망대, 스마트시티, 세종예술의전당
- 공동캠퍼스 학생회관·프로젝트실·모집센터
- 동아리 거리, 축제 체험장, 먹거리 체험장
- 동아리 거리제, 축제·먹거리 부스, 마이홈

### 스마트시티와 공공 체험

- 미래 세종관 서비스별 디지털 트윈 홀로그램
- 중앙 테이블 HTML 키오스크와 서비스 선택 UI
- 스마트교통·안전·환경·복지 등 세종 서비스 체험
- 실제 `sejong-smartcity-exhibition.glb` 기반 드래그·확대형 스마트시티 공간안내 미리보기
- 동아리 거리제 Meshopt 압축 GLB와 스마트시티 일반 GLB의 렌더러를 격리해 공간안내 WebGL 충돌 방지
- 정부청사 중앙광장 AI 세종 추천센터
- 완료 프로젝트 기반 PROJECT → AI 일정 확정 → VISIT 저장의 3단계 전광판 흐름
- 전체 사용자 프로필 기반 OpenAI 코스 분석, 장소 추가·최적화와 9단계 시네마틱 분석
- 확정 코스 전용 03 방문 화면과 HTML 내부 카카오지도
- 실제 소파 앉기, 가구 충돌과 공간별 카메라 제약

### 문화·관광·먹거리 체험

- 세종예술의전당 공식 공연 5종의 원본 포스터와 3D/HTML 연속 인터랙션
- 공연 영상 선택, 관심 표시와 안전한 YouTube `postMessage` origin 검증
- 객석 단차 점프 이동과 전당 후방 카메라 경계
- 축제·먹거리 부스의 활동 기록 및 프로필 추천 근거 반영
- 축제 대표 이미지의 WIZ 정적 경로 보정, Kakao Map 위치 검색과 부스·무대·책상 충돌 처리
- 세종 로컬푸드·특산물·카페 상세 패널과 Kakao Map 검색 연결
- 외부 이미지 실패 시 배포 정적 자산으로 대체

### 수목원 기억나무와 AI 식물 큐레이터

- 목련·튤립·붓꽃·동백꽃·무궁화·복숭아나무·단풍나무 등 14종 식물을 발견 즉시 도감에 저장
- 식물별 특징, 꽃말·상징, 서식 정보와 비교 관찰 지점 제공
- 동일한 식물을 다시 발견하면 발견 횟수와 관찰 시간이 누적되어 마이홈 정원 풍성도에 반영
- 5종 발견 시 새싹, 10종 발견 시 성장, 14종 발견 시 완성되는 3단계 기억나무
- 성장 단계에서만 충녕 AI가 탐험 데이터를 분석해 자연 성향, 대표 식물과 기억 편지를 생성
- 분석 결과를 프로필과 정부청사 AI 맞춤 코스 추천 데이터로 연결

### 마이홈 생태 미션

- 국립세종수목원에서 튤립·해바라기·수국·동백꽃·붓꽃을 수집
- 마이홈의 고정 꽃밭에서 수집한 꽃을 선택해 심고 진행도를 서버에 저장
- 베어트리파크 길가에서 사과·당근·도토리를 하나씩 수집하고 두 마리 곰에게 총 5회 순차 급여
- 수목원과 베어트리파크 미션 완료 여부를 서버 규칙으로 재계산해 클라이언트 값 위조 방지
- 완료 단계에 따라 꽃밭·곰 조형물·자연 완주 엠블럼·현장 방문 미션 보상 해금
- 마이홈 코티지 GLB, 실내 출입, 방향이 보정된 7개 좌석과 침대 E 상호작용 제공
- 수목원 발견 식물 수·반복 관찰에 따라 성장하는 정원과 경량화된 곰 GLB 모델, 진행도 기반 동상 보상 표시
- 로그인 사용자의 진행도는 MySQL `personal_farm_progress` 테이블에 계정별로 분리 저장

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

### 공간 이동과 공용 좌표 정책

- 공용 포털 정의는 `react-app/shared/world-portals.ts`에 선언하고 WIZ 기본값과 회귀 테스트로 일관성을 검증합니다.
- WIZ 운영 화면은 `/wiz/api/page.home/portal_positions`를 통해 MySQL의 공용 좌표를 조회합니다.
- `admin` 또는 `portal_editor` 역할만 허용된 공간의 좌표를 변경할 수 있습니다.
- 세종호수공원, 공동캠퍼스, 베어트리파크, 수목원, 세종예술의전당과 축제·먹거리 부스의 확정 포털은 서버에서 고정되어 편집 요청이 차단됩니다.
- 정부청사의 중앙광장·공동캠퍼스 귀환 포털은 권한 사용자가 공용 위치로 조정할 수 있습니다. 전망대는 건물을 피해 동쪽 보행 바닥에, 스마트시티는 중앙광장 왼쪽 원거리에 고정되어 일반 이동 중에도 진입할 수 있습니다.
- 카메라 프로필은 포털과 별도로 17개 맵의 캐릭터 높이, 고도·방위각, 거리, 타깃 높이와 FOV를 검증 범위 안에서 공용 저장합니다.
- 세종예술의전당과 축제부스의 호수공원 귀환 포털은 코드의 canonical 좌표를 항상 우선합니다.
- 별도 Node 서버를 사용할 때는 같은 기본 좌표를 `world_portal_positions` collection에 시드하고 Socket.IO로 변경을 전파합니다.

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
  ├─ 카카오 로그인·서버 세션과 익명 로컬 체험 분리
  ├─ 사용자·캐릭터·AI 행동 상태와 공용 포털·카메라 설정
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
react-app/deploy/                  Docker Compose·Nginx 운영 배포 예시
src/assets/jochwon-app/            WIZ가 제공하는 버전 관리 정적 번들
src/app/page.home/                 /home iframe과 WIZ App API
src/portal/season/route/auth/      인증·체험 로그인·번들 CORS 라우트
```

Vite의 `base`는 `/auth/jochwon-assets/`입니다. 해시 번들은 WIZ 인증 라우트가 `src/assets/jochwon-app/`에서 읽어 CORS 헤더와 장기 캐시 헤더를 포함해 제공합니다. `/home`의 iframe 진입 파일에는 빌드 쿼리를 붙이고, 엔트리 구문·로드 실패 시 캐시와 서비스 워커를 한 번 정리한 뒤 최신 빌드로 재시도합니다. 메인 CSS는 엔트리보다 먼저 로드하며 운영 글꼴은 WIZ의 로컬 SUIT 자산을 사용합니다.

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
│   ├── deploy/                     Node 컨테이너·프록시 배포 문서
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

`react-app/src/assets/maps/`에는 운영에 필요한 GLB와 미리보기가 포함됩니다. 빌드는 GLB·FBX 3D 자산 25 MiB, gzip JavaScript 400 KiB, 초기 진입 JavaScript 300 KiB 예산을 자동 검사합니다. 새 대형 자산을 추가하기 전 저장소 크기와 Git LFS 적용 여부도 검토해야 합니다.

## 5. 데이터베이스

### WIZ 데이터 모델

WIZ ORM은 `config/database.py`의 `base` namespace를 사용합니다.

| 테이블 | 용도 | 주요 데이터 |
|---|---|---|
| `user` | WIZ 로그인·프로필 | 이메일, bcrypt 비밀번호, 이름, 캐릭터, 역할 |
| `ai_behavior_state` | 월드 행동 상태 | 사용자 ID, 버전, JSON payload |
| `personal_farm_progress` | 개인 팜 생태 미션 | 사용자 ID, 버전, 꽃·먹이·보상 진행도 JSON |
| `world_portal_layout` | 공용 포털 배치 | 활성 포털 좌표 JSON, 수정자, 생성·수정 시각 |
| `world_camera_profiles` | 공용 카메라 설정 | 17개 맵별 카메라 프로필 JSON, 수정자, 생성·수정 시각 |

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

주요 활성 collection은 `users`, `personal_farm_progress`, `clubs`, `community_posts`, `direct_rooms`, `direct_messages`, `ai_place_recommendations`, `joint_campus_recommendations`, `campus_feature_portals`, `world_portal_positions`, `recruitment_profile_requests`입니다. `personal_farm_progress`는 사용자 ID를 문서 기본키로 사용해 꽃·먹이·먹이 지점·보상·현장 방문 상태를 계정별로 격리합니다. `world_respawn_positions` 모델은 이전 데이터 호환을 위해 남아 있지만 현재 런타임은 `FIXED_LAKE_RESPAWN` 공용 상수를 사용합니다.

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
| `RUNTIME_DATA_DIR` | 소원·근처 채팅 등 Node 런타임 JSON의 영속 저장 경로 |
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
| `PORTAL_EDITOR_USER_IDS` | 사용자 문서 권한을 보완하는 공용 포털 편집 사용자 ID 허용 목록(쉼표 구분) |

`admin`, `portal_editor` 역할 또는 `PORTAL_EDITOR_USER_IDS`에 등록된 계정만 공용 포털과 카메라 설정을 바꿀 수 있습니다.

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

- Node.js `^20.19.0` 또는 `>=22.12.0`
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
- 준비 상태: `GET http://localhost:3001/health/ready`

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
3. JavaScript·GLB 성능 예산 검사
4. Express TypeScript build

React 수정 후 `react-app/dist/`를 WIZ 정적 자산에 정확히 동기화해야 합니다. 해시가 바뀐 이전 파일이 남지 않도록 삭제 동기화를 사용합니다.

```bash
rsync -a --delete react-app/dist/ src/assets/jochwon-app/
```

이후 WIZ 프로젝트 일반 빌드(`clean=false`)를 실행하고 `/home`을 확인합니다. `src/app/page.home/view.pug`의 `_build` 쿼리도 새 배포 식별자로 갱신하면 브라우저 캐시로 인한 빈 화면을 방지할 수 있습니다.

Express·Socket.IO는 WIZ 정적 빌드에 자동 포함되지 않습니다. 운영용 Docker Compose, 상태 검사, Nginx WebSocket 프록시와 실행 절차는 [`react-app/deploy/README.md`](react-app/deploy/README.md)에 있습니다. Node 서버는 `/health/live`로 프로세스 상태를, `/health/ready`로 MySQL과 실시간 기능의 준비 상태를 제공합니다.

## 9. API 개요

### WIZ App API

| 함수 | 설명 |
|---|---|
| `signup`, `login`, `me`, `logout` | WIZ 계정과 세션 |
| `save_avatar` | 사용자 캐릭터 저장 |
| `kakao_start` | 카카오 OAuth 시작 |
| `withdraw` | 계정·연관 데이터 삭제 |
| `behavior_state` | 월드별 AI 행동 상태 조회·저장 |
| `personal_farm_progress` | MySQL 개인 팜 진행도 및 생태 미션 조회·저장 |
| `portal_positions` | 권한·고정 정책이 적용된 공용 포털 좌표 조회·저장 |
| `camera_profiles` | 권한·값 범위 검증이 적용된 맵별 공용 카메라 프로필 조회·저장·초기화 |
| `api_config_status` | 비밀값 노출 없는 provider 설정 상태 |

### Express REST API

| 경로 | 설명 |
|---|---|
| `/health` | 서버 상태 |
| `/health/live`, `/health/ready` | 프로세스 및 MySQL·실시간 준비 상태 |
| `/api/world-portals` | 현재 Node 공용 포털 좌표 조회 |
| `/api/auth` | 로그인·카카오 인증·세션 |
| `/api/account`, `/api/profile` | 계정 삭제와 프로필 |
| `/api/account/me/personal-farm` | 개인 팜 진행도 조회, 꽃·먹이 수집, 꽃 심기, 먹이 지점·보상·방문 미션 저장 |
| `/api/community` | 커뮤니티 게시물 |
| `/api/clubs` | 동아리 생성·가입·역할·활동 |
| `/api/direct-rooms` | 1:1 대화 추천과 만남 장소 |
| `/api/ai` | 장소·공동캠퍼스 AI 추천 |
| `/api/chungnyeong` | 충녕이 AI 도구 |
| `/api/festivals` | 세종·관광공사 축제 데이터 |

Socket.IO는 룸 입장·퇴장, 캐릭터 이동, 채팅, 공용 포털 위치, 공동캠퍼스 포털 위치와 프로젝트룸 상태를 동기화합니다. 세종호수공원 리스폰은 네트워크 수정 없이 공용 상수로 고정됩니다.

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
npm run test:greenhouse-ai
npm run test:lake-portals
npm run test:festival-experience
npm run test:bear-tree-portals
npm run test:campus-portals
npm run test:club-street
npm run test:campus-visual
npm run test:personal-farm-interactions
npm run test:personal-farm-portals
npm run test:camera-follow
npm run test:world-navigation
npm run test:world-camera-editor
npm run test:postmessage
npm run test:runtime-entry
npm run test:wiz-production
npm run test:multiplayer
npm run verify:performance
npm run verify:providers
npx tsx --test scripts/artsCenterPoster.test.ts scripts/artsCenterJump.test.ts
npx tsx --test scripts/foodExperience.test.ts
```

커밋 전 최소 확인 항목:

- `npm run build` 성공
- 백엔드 테스트 전체 통과
- React `dist`와 `src/assets/jochwon-app` 파일 일치
- WIZ 일반 빌드 성공
- `/home`과 최신 정적 번들 HTTP 200
- 개발 쿠키 없는 운영 OAuth·충녕이 추천 회귀 테스트 통과
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
- 공용 포털 변경은 서버에서 세션 역할을 다시 확인하며 프런트의 버튼 표시만 신뢰하지 않습니다.
- 운영 CORS의 `CLIENT_ORIGIN`은 실제 서비스 origin 하나로 제한합니다.
- 외부 iframe 메시지는 대상 window와 허용 origin을 함께 검증합니다.
- DB는 외부 공개를 피하고 애플리케이션 전용 최소 권한 계정을 사용합니다.
- 커밋 전 비밀정보 패턴과 대용량 파일을 다시 검사합니다.

## 12. 알려진 제한사항

- WIZ Python API와 Express API가 공존하므로 운영 기능별 책임과 프록시 구성을 명확히 유지해야 합니다.
- 일부 커뮤니티·알림 데이터는 프로토타입용 seed 또는 브라우저 상태를 사용합니다.
- 실시간 입장·이동·근처 채팅·방 격리는 두 WebSocket 클라이언트 자동 검증을 거칩니다. 실제 운영 프록시와 네트워크 환경은 배포 후 별도 점검해야 합니다.
- 외부 AI·지역 API 기능은 키, 할당량, 응답 지연과 제공기관 장애의 영향을 받습니다.
- Kakao Map·YouTube 등 외부 임베드 정책이 바뀌면 화면 내 지도·영상 기능이 제한될 수 있습니다.
- WebGL 화면의 포스터 크롭, 카메라 경계와 포털 체감은 자동 단위 테스트 외에 운영 브라우저 육안 확인이 필요합니다. 공용 카메라 변경은 전체 사용자에게 반영되므로 운영 권한 계정에서 신중히 적용해야 합니다.
- Phaser는 초기 화면에서 분리된 지연 로딩 청크이며 gzip 기준 약 310 KiB입니다. 동아리 거리 GLB는 Meshopt·WebP로 약 45.75 MB에서 1.81 MB로 축소했고, 현재 최대 GLB는 약 21.64 MiB입니다.
- 현재 대형 3D 자산은 일반 Git으로 관리됩니다. 자산 증가 시 Git LFS 또는 별도 CDN을 권장합니다.

## 13. 변경 이력

작업 요약은 [`devlog.md`](devlog.md), 상세 구현·검증 기록은 `devlog/YYYY-MM-DD/`에서 확인할 수 있습니다.
