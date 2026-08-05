import type { MouseEvent } from 'react';

import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Camera,
  Eye,
  Map,
  MessageCircle,
  Route,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import './LoginPage.css';

const journey = [
  {
    emoji: '🎪',
    title: '호수공원',
    copy: '세종의 볼거리와 관심사',
  },
  {
    emoji: '🌿',
    title: '수목원',
    copy: '식물 발견과 탐험 기록',
  },
  {
    emoji: '🎓',
    title: '공동캠퍼스',
    copy: '취향 연결과 대화',
  },
  {
    emoji: '🗺️',
    title: '정부청사',
    copy: '인공지능 방문 코스 완성',
  },
];

type LoginPageProps = {
  loginUrl: string;
  onLocalStart: () => void;
  onBack: () => void;
  errorMessage?: string;
};

export function LoginPage({
  loginUrl,
  onLocalStart,
  onBack,
  errorMessage,
}: LoginPageProps) {
  const continueInCurrentWindow = (
    event: MouseEvent<HTMLAnchorElement>,
  ) => {
    try {
      const topWindow = window.top;
      if (
        topWindow &&
        topWindow.location.origin ===
          window.location.origin
      ) {
        event.preventDefault();
        topWindow.location.assign(loginUrl);
      }
    } catch {
      // A restricted ReviewOps iframe cannot navigate its top window.
      // In that environment the native popup target remains the fallback.
    }
  };

  return (
    <main className="login-design-page">
      <section className="login-design-card">
        <header className="login-design-header">
          <button
            type="button"
            onClick={onBack}
          >
            <ArrowLeft size={17} />
            돌아가기
          </button>

          <span>세종한바퀴 · 여정 시작</span>
        </header>

        <div className="login-design-content">
          <section className="login-design-intro">
            <span className="login-design-kicker">
              <Sparkles size={17} />
              세종에서 시작되는 새로운 만남
            </span>

            <h1>
              취향을 발견하고,
              <br />
              <em>사람과 세종을 잇다.</em>
            </h1>

            <p>
              세종의 공간을 자유롭게 체험하고 비슷한 취향의
              이웃을 만나
              <br />
              대화를 실제 세종 방문 코스로 완성해보세요.
            </p>

            <div
              className="login-journey"
              aria-label="서비스 이용 흐름"
            >
              {journey.map((step, index) => (
                <div
                  className="login-journey-step"
                  key={step.title}
                >
                  <span>{step.emoji}</span>

                  <div>
                    <small>0{index + 1}</small>
                    <b>{step.title}</b>
                    <p>{step.copy}</p>
                  </div>

                  {index < journey.length - 1 && (
                    <ArrowRight size={14} />
                  )}
                </div>
              ))}
            </div>

            <div className="login-feature-chips">
              <span>
                <Camera size={13} />
                취향 기록
              </span>

              <span>
                <MessageCircle size={13} />
                이웃과 대화
              </span>

              <span>
                <Bot size={13} />
                인공지능 방문 코스
              </span>
            </div>

            <section
              className="login-safety-guide"
              aria-label="가입 후 직접 설정할 수 있는 항목"
            >
              <div className="login-safety-heading">
                <ShieldCheck size={18} />

                <span>
                  <small>안심하고 시작하세요</small>
                  <strong>
                    내 기록과 대화는 내가 정해요.
                  </strong>
                </span>
              </div>

              <div className="login-safety-grid">
                <article>
                  <Eye size={17} />

                  <div>
                    <b>기록 공개 선택</b>
                    <p>
                      나만 보기 또는 다른 사람에게 공개
                    </p>
                  </div>
                </article>

                <article>
                  <MessageCircle size={17} />

                  <div>
                    <b>대화 요청 수락</b>
                    <p>
                      서로 동의한 뒤에만 대화 시작
                    </p>
                  </div>
                </article>

                <article>
                  <Route size={17} />

                  <div>
                    <b>방문 코스 공동 저장</b>
                    <p>
                      함께 만든 계획을 원하는 곳에 공유
                    </p>
                  </div>
                </article>
              </div>
            </section>
          </section>

          <section className="login-design-form">
            <div className="login-design-logo">
              <Map size={35} />
            </div>

            <span className="login-design-eyebrow">
              나의 세종 여정
            </span>

            <h2>나의 세종 여정 시작하기</h2>

            <p>
              간단한 취향 설정 후 호수공원에서 시작해요.
            </p>

            <div className="login-onboarding-preview">
              <span>
                <b>1</b>
                취향 설정
              </span>

              <i />

              <span>
                <b>2</b>
                캐릭터 선택
              </span>

              <i />

              <span>
                <b>3</b>
                호수공원 입장
              </span>
            </div>

            {errorMessage && (
              <p className="login-design-error" role="alert">
                {errorMessage}
              </p>
            )}

            <a
              className="login-design-kakao"
              href={loginUrl}
              target="sejong-kakao-login"
              rel="opener"
              onClick={continueInCurrentWindow}
              aria-label="카카오 로그인하기"
            >
              <b>●</b>
              <span>카카오로 시작하기</span>
            </a>

            <small className="login-storage-note social">
              캐릭터와 프로필을 계정에 저장해 다음 카카오 로그인에서도 이어서 이용할 수 있어요.
            </small>

            <div className="login-design-divider">
              <span />
              로그인 없이 잠깐 체험하기
              <span />
            </div>

            <button
              type="button"
              className="login-design-guest"
              onClick={onLocalStart}
            >
              로컬 체험으로 시작하기
              <b>→</b>
            </button>

            <small className="login-storage-note local">
              로컬 체험은 로그인과 DB 저장 없이 현재 웹에서만 유지되며, 화면을 나가면 캐릭터와 체험 데이터가 사라져요.
            </small>
          </section>
        </div>
      </section>
    </main>
  );
}
