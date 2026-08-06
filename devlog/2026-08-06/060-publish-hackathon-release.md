# 누적 해커톤 기능·MySQL 구성 문서화 및 GitHub 공개 배포

- **ID**: 060
- **날짜**: 2026-08-06
- **유형**: 문서·배포
- **리뷰 ID**: cwbbogxjkwzznuzsqgvyayjbjbpacqgg

## 작업 요약

ReviewOps에서 누적된 17개 월드 카메라·포털·생태 미션·정부청사 성능·운영 번들 변경을 보존하고, 공개 저장소에 포함해도 되는 설정만 선별해 해커톤 제출 상태로 정리했다. README는 문제 정의, 심사 동선, 핵심 기능, WIZ·React·Express 구조, MySQL 모델, 환경변수, 실행·배포·테스트·보안·한계까지 최신 구현을 기준으로 갱신했다.

## 원문 요청사항

```text
https://github.com/xericen/SJ 여기에 지금까지 한 거 git에 커밋하고 푸시해줘, 아마 많이 바꼈을텐데 db나 등등 그런 것들 다 변경해서 올려주면 돼. readme도 새로 작성해줘 (해커톤용으로 올려주면 됨)
```

## 변경 파일 목록

- `README.md`
  - 해커톤 심사 포인트와 최신 시연 동선을 추가했다.
  - 권한형 17개 맵 카메라 편집, MySQL 저장 모델, WIZ API와 실제 테스트 명령을 문서화했다.
- `react-app/src/`, `react-app/shared/`, `react-app/server/src/`
  - 누적된 공간 카메라·포털·미션·실시간 서버 변경을 공개 배포 범위에 포함했다.
- `react-app/scripts/`, `react-app/package.json`
  - 카메라 편집과 공간별 회귀 테스트를 추가·갱신했다.
- `src/app/page.home/`, `src/model/`
  - WIZ 공용 카메라 프로필 API·MySQL 모델과 최신 런타임 연결을 포함했다.
- `src/assets/jochwon-app/`
  - React 프로덕션 빌드와 일치하는 최신 WIZ 정적 번들을 반영했다.
- `devlog.md`, `devlog/2026-08-06/049-*.md` ~ `060-*.md`
  - 누적 ReviewOps 변경과 이번 GitHub 게시 작업을 기록했다.

## 확인 결과

- React·Express 전체 `npm run build` 성공
- 성능 예산 통과: 초기 엔트리 246 KiB, 최대 JavaScript gzip 324 KiB, 최대 3D 자산 21.64 MiB
- Express 백엔드 테스트 59개 통과 및 실제 MySQL 연결·사용자별 진행도 격리 확인
- 카메라·포털·개인 팜·공연·정부청사·런타임 회귀 테스트 70개 통과
- React `dist`와 WIZ `src/assets/jochwon-app` 전체 파일 일치
- WIZ 일반 빌드(`clean: false`) 성공
- 운영 `/home`, 정적 index와 최신 JavaScript 엔트리 HTTP 200
- Python API·모델 구문 검사 및 생성 번들을 제외한 소스 Git 공백 검사 통과
- 40 MiB 초과 신규 파일과 추적 대상 비밀 설정 파일 없음

## 남은 리스크

- 실제 외부 AI·카카오·공공데이터 호출은 운영 키, 할당량과 제공기관 상태에 영향을 받는다.
- 최대 21.64 MiB GLB와 지연 로딩 Phaser 청크는 저사양 기기·느린 네트워크에서 추가 현장 검증이 필요하다.
- Express·Socket.IO 운영 기능은 WIZ와 별도 Node 프로세스·WebSocket 프록시가 정상 가동되어야 한다.
