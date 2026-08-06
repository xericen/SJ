import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
} from 'react';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupCompletePage } from './pages/SignupCompletePage';
import { TermsPage } from './pages/TermsPage';

import { useLocalStorage } from './hooks/useLocalStorage';
import { useSessionStorage } from './hooks/useSessionStorage';
import { API_BASE_URL } from './config/api';
import { clearAllAccountData } from './services/accountData';
import { startBehaviorStateSync } from './services/behaviorStateSync';

import {
  defaultProfile,
  defaultUserJourney,
  PROFILE_KEY,
  USER_JOURNEY_KEY,
  type OnboardingStep,
  type UserJourney,
} from './stores/profileStore';

import type { UserProfile } from './types';
import type { GameReturnState } from './game/gameReturnState';
import type { MapId } from '../shared/socket-events';
import { loadAccountProfile, saveAccountProfile, withdrawAccount } from './services/accountProfile';

const CharacterTestPage=lazy(()=>import('./pages/CharacterTestPage').then(module=>({default:module.CharacterTestPage})));
const CommunityPage=lazy(()=>import('./pages/CommunityPage').then(module=>({default:module.CommunityPage})));
const loadCreateProfilePage=()=>import('./pages/CreateProfilePage').then(module=>({default:module.CreateProfilePage}));
const CreateProfilePage=lazy(loadCreateProfilePage);
const loadGamePage=()=>import('./pages/GamePage').then(module=>({default:module.GamePage}));
const GamePage=lazy(loadGamePage);
const MapPreviewPage=lazy(()=>import('./pages/MapPreviewPage').then(module=>({default:module.MapPreviewPage})));

class DeferredPageErrorBoundary extends Component<{children:ReactNode},{failed:boolean}> {
  state={failed:false};

  static getDerivedStateFromError(){
    return {failed:true};
  }

  componentDidCatch(error:Error,errorInfo:ErrorInfo){
    console.error('[deferred page load failed]',error,errorInfo);
  }

  render(){
    if(this.state.failed){
      return <main className="deferred-page-loading" role="alert">
        <span>⚠️</span>
        <b>화면을 불러오지 못했어요.</b>
        <button type="button" onClick={()=>window.location.reload()}>다시 불러오기</button>
      </main>;
    }
    return this.props.children;
  }
}

function DeferredPage({children}:{children:React.ReactNode}){
  return <DeferredPageErrorBoundary><Suspense fallback={<main className="deferred-page-loading" role="status"><span>🌿</span><b>페이지를 준비하고 있어요</b></main>}>{children}</Suspense></DeferredPageErrorBoundary>;
}

function ExperienceLoading({mapId='town'}:{mapId?:MapId}){
  const government=mapId==='government';
  const place=government?'정부청사':'세종호수공원';
  const tasks=government
    ?['정부청사 입구 확인','정부청사 불러오기','캐릭터 배치','공동 계획 공간 연결','주변 사용자 연결']
    :['입장 위치 확인','호수공원 산책로 불러오기','캐릭터 배치','축제·공연 체험 연결','주변 사용자 연결'];
  return <main className="experience-entry-loading" role="status" aria-live="polite">
    <div className="experience-entry-brand"><span>🧑🏻‍🌾</span><div><b>세종한바퀴</b><small>세종 소통형 체험 공간</small></div></div>
    <div className="experience-entry-center">
      <i/>
      <span>{place}</span>
      <h1>{place}로 이동중...</h1>
      <p>{government?'함께 방문할 장소와 코스를 정할 공간을 준비하고 있어요.':'호수 산책로와 다양한 취향 체험을 준비하고 있어요.'}</p>
      <div className="experience-entry-tasks">{tasks.map((task,index)=><span key={task}>{index===0?'✓':'●'} {task}</span>)}</div>
      <div className="experience-entry-progress"><em/></div>
    </div>
  </main>;
}

type Page =
  | 'landing'
  | 'login'
  | 'terms'
  | 'create'
  | 'complete'
  | 'account'
  | 'game'
  | 'community';

const KAKAO_LOGIN_URL =
  '/wiz/api/page.home/kakao_start';
const KAKAO_LOGIN_MESSAGE = 'sejong-kakao-login';
const KAKAO_LOGIN_ACK_MESSAGE =
  'sejong-kakao-login-ack';

function browserStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function browserSessionStorage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function readStoredValue(key: string): string | null {
  try {
    return browserStorage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function writeStoredValue(
  key: string,
  value: string,
) {
  try {
    browserStorage()?.setItem(key, value);
  } catch {
    // Sandboxed login windows may not expose browser storage.
  }
}

function removeStoredValue(key: string) {
  try {
    browserStorage()?.removeItem(key);
  } catch {
    // Keep the current in-memory flow usable when storage is blocked.
  }
}

function clearStoredAccountData() {
  const storage = browserStorage();
  if (!storage) return;

  try {
    clearAllAccountData(storage);
  } catch {
    // Account state is still reset in React below.
  }
}

const KAKAO_USER_ID_KEY =
  'jochiwon-kakao-user-id';

const KAKAO_PROFILE_IMAGE_KEY =
  'jochiwon-kakao-profile-image';

const ONBOARDING_COMPLETE_USER_ID_KEY =
  'jochiwon-onboarding-complete-user-id';

const LOCAL_EXPERIENCE_MODE_KEY =
  'jochiwon-local-experience-active';

type ExperienceMode = 'local' | 'social' | null;

export default function App() {
  const [page, setPage] =
    useState<Page>('landing');
  const [loginError, setLoginError] =
    useState('');
  const [loginIdentity, setLoginIdentity] =
    useState(() =>
      readStoredValue(
        KAKAO_USER_ID_KEY,
      )?.trim() ?? '',
    );
  const [experienceMode, setExperienceMode] =
    useState<ExperienceMode>(() =>
      browserSessionStorage()?.getItem(
        LOCAL_EXPERIENCE_MODE_KEY,
      ) === '1'
        ? 'local'
        : readStoredValue(KAKAO_USER_ID_KEY)
          ? 'social'
          : null,
    );
  const [gameReturnState,setGameReturnState]=useState<GameReturnState>();
  const [guestMapPreview,setGuestMapPreview]=useState(false);
  const [behaviorStateReady,setBehaviorStateReady]=useState(false);
  const hydratedProfileUserIdRef=useRef<string|undefined>(undefined);

  const [
    socialStoredProfile,
    setSocialProfile,
  ] = useLocalStorage<UserProfile>(
    PROFILE_KEY,
    defaultProfile,
  );

  const [
    socialJourney,
    setSocialJourney,
  ] = useLocalStorage<UserJourney>(
    USER_JOURNEY_KEY,
    defaultUserJourney,
  );

  const [
    localStoredProfile,
    setLocalProfile,
  ] = useSessionStorage<UserProfile>(
    PROFILE_KEY,
    defaultProfile,
  );

  const [
    localJourney,
    setLocalJourney,
  ] = useSessionStorage<UserJourney>(
    USER_JOURNEY_KEY,
    defaultUserJourney,
  );

  const storedProfile = experienceMode === 'local'
    ? localStoredProfile
    : socialStoredProfile;
  const setProfile = experienceMode === 'local'
    ? setLocalProfile
    : setSocialProfile;
  const journey = experienceMode === 'local'
    ? localJourney
    : socialJourney;
  const setJourney = experienceMode === 'local'
    ? setLocalJourney
    : setSocialJourney;

  const profile = useMemo<UserProfile>(()=>({
    ...defaultProfile,
    ...storedProfile,

    interests:
      storedProfile.interests ?? [],

    usagePurposes:
      storedProfile.usagePurposes ?? [],

    preferredPlaceCategories:
      storedProfile.preferredPlaceCategories ?? [],

    recordVisibility:
      storedProfile.recordVisibility ??
      'public',

    chatEnabled:
      storedProfile.chatEnabled ?? true,
  }),[storedProfile]);

  // A nickname and interests are only an onboarding draft. Login becomes
  // complete exclusively after the character save action finishes signup.
  const membershipComplete =
    journey.membershipComplete;
  const hasLoginIdentity =
    Boolean(loginIdentity);
  const hasExperienceIdentity =
    experienceMode === 'local' ||
    (
      experienceMode === 'social' &&
      hasLoginIdentity
    );
  const canExperience =
    journey.authenticated &&
    membershipComplete &&
    hasExperienceIdentity;

  useEffect(() => {
    if (!canExperience) {
      setBehaviorStateReady(false);
      return;
    }

    if (experienceMode === 'local') {
      setBehaviorStateReady(true);
      return;
    }

    let active = true;
    const sync = startBehaviorStateSync();
    void sync.ready.finally(() => {
      if (active) setBehaviorStateReady(true);
    });

    return () => {
      active = false;
      sync.stop();
    };
  }, [canExperience, experienceMode]);

  useEffect(() => {
    if (experienceMode !== 'local') return;

    const discardLocalExperience = () => {
      const localStorage = browserStorage();
      const sessionStorage = browserSessionStorage();
      if (localStorage) clearAllAccountData(localStorage);
      sessionStorage?.removeItem(PROFILE_KEY);
      sessionStorage?.removeItem(USER_JOURNEY_KEY);
      sessionStorage?.removeItem(LOCAL_EXPERIENCE_MODE_KEY);
    };

    window.addEventListener('pagehide', discardLocalExperience);
    return () => {
      window.removeEventListener('pagehide', discardLocalExperience);
    };
  }, [experienceMode]);

  useEffect(()=>{
    if(page!=='landing')return;
    const timer=window.setTimeout(()=>{
      void loadGamePage().catch(()=>undefined);
    },600);
    return()=>window.clearTimeout(timer);
  },[page]);

  useEffect(() => {
    if (
      journey.authenticated &&
      (
        !journey.membershipComplete ||
        !hasExperienceIdentity
      )
    ) {
      setJourney({
        ...journey,
        authenticated: false,
      });
    }
  }, [
    journey,
    hasExperienceIdentity,
    setJourney,
  ]);

  useEffect(() => {
    const receiveKakaoLogin = (
      event: MessageEvent,
    ) => {
      const result = event.data as {
        type?: unknown;
        status?: unknown;
        userId?: unknown;
        nickname?: unknown;
        profileImage?: unknown;
        message?: unknown;
      } | null;

      if (
        !result ||
        result.type !== KAKAO_LOGIN_MESSAGE ||
        (
          result.status !== 'success' &&
          result.status !== 'error'
        )
      ) {
        return;
      }

      try {
        (event.source as Window | null)?.postMessage(
          { type: KAKAO_LOGIN_ACK_MESSAGE },
          '*',
        );
      } catch {
        // The callback window has its own redirect fallback.
      }

      const searchParams =
        new URLSearchParams({
          login: result.status,
        });

      for (const key of [
        'userId',
        'nickname',
        'profileImage',
        'message',
      ] as const) {
        const value = result[key];
        if (typeof value === 'string') {
          searchParams.set(key, value);
        }
      }

      window.location.replace(
        `${window.location.pathname}?${searchParams.toString()}`,
      );
    };

    window.addEventListener(
      'message',
      receiveKakaoLogin,
    );

    return () => {
      window.removeEventListener(
        'message',
        receiveKakaoLogin,
      );
    };
  }, []);

  useEffect(() => {
    const searchParams =
      new URLSearchParams(
        window.location.search,
      );

    const loginResult =
      searchParams.get('login');

    if (loginResult === 'local') {
      clearStoredAccountData();
      setLoginIdentity('');
      hydratedProfileUserIdRef.current = undefined;
      setLocalProfile(defaultProfile);
      setLocalJourney({
        authenticated: false,
        membershipComplete: false,
        onboardingStep: 'profile',
      });
      browserSessionStorage()?.setItem(
        LOCAL_EXPERIENCE_MODE_KEY,
        '1',
      );
      setExperienceMode('local');
      setPage('create');
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname,
      );
      return;
    }

    if (loginResult === 'error') {
      setLoginError(
        searchParams.get('message')?.trim() ||
        '로그인에 실패했습니다. 다시 시도해 주세요.',
      );
      setPage('login');
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname,
      );
      return;
    }

    if (loginResult !== 'success') {
      return;
    }

    setLoginError('');

    const userId =
      searchParams.get('userId')?.trim() ??
      '';

    const nickname =
      searchParams.get('nickname')?.trim() ??
      '';

    const profileImage =
      searchParams
        .get('profileImage')
        ?.trim() ?? '';

    if (userId) {
      // Keep the callback identity authoritative while onboarding is in progress.
      hydratedProfileUserIdRef.current = userId;
      writeStoredValue(
        KAKAO_USER_ID_KEY,
        userId,
      );
      setLoginIdentity(userId);
    }

    if (profileImage) {
      writeStoredValue(
        KAKAO_PROFILE_IMAGE_KEY,
        profileImage,
      );
    } else {
      removeStoredValue(
        KAKAO_PROFILE_IMAGE_KEY,
      );
    }

    window.history.replaceState(
      {},
      document.title,
      window.location.pathname,
    );

    browserSessionStorage()?.removeItem(
      LOCAL_EXPERIENCE_MODE_KEY,
    );
    setExperienceMode('social');

    const restoreSocialProfile = async () => {
      try {
        const savedProfile =
          await loadAccountProfile();

        if (savedProfile) {
          setSocialProfile({
            ...defaultProfile,
            ...savedProfile,
          });
          setSocialJourney({
            authenticated: true,
            membershipComplete: true,
            onboardingStep: 'character',
          });
          setPage('game');
          return;
        }

        setSocialProfile({
          ...defaultProfile,
          nickname:
            nickname || '카카오 사용자',
        });
        // Resolve the onboarding chunk before replacing the landing screen.
        // React 19 can otherwise delete an uncommitted Suspense fallback when
        // several login callback states settle in the same render cycle.
        await loadCreateProfilePage();
        setSocialJourney({
          authenticated: false,
          membershipComplete: false,
          onboardingStep: 'profile',
        });
        setPage('create');
      } catch (error) {
        setLoginError(
          error instanceof Error
            ? error.message
            : '저장된 프로필을 불러오지 못했습니다.',
        );
        setPage('login');
      }
    };

    void restoreSocialProfile();
  }, []);

  useEffect(() => {
    if (
      experienceMode !== 'social' ||
      !hasLoginIdentity ||
      !membershipComplete
    ) return;
    const userId=localStorage.getItem(KAKAO_USER_ID_KEY)?.trim();
    if(!userId||hydratedProfileUserIdRef.current===userId)return;
    hydratedProfileUserIdRef.current=userId;
    void loadAccountProfile().then(saved => {
      if (saved) setSocialProfile({ ...defaultProfile, ...saved });
    }).catch(() => {
      if(hydratedProfileUserIdRef.current===userId)hydratedProfileUserIdRef.current=undefined;
    });
  }, [experienceMode, hasLoginIdentity, membershipComplete, setSocialProfile]);

  const startExperience = () => {
    setPage('game');
  };

  const discardLocalExperience = () => {
    const localStorage = browserStorage();
    const sessionStorage = browserSessionStorage();
    if (localStorage) clearAllAccountData(localStorage);
    sessionStorage?.removeItem(PROFILE_KEY);
    sessionStorage?.removeItem(USER_JOURNEY_KEY);
    sessionStorage?.removeItem(LOCAL_EXPERIENCE_MODE_KEY);
    setLocalProfile(defaultProfile);
    setLocalJourney(defaultUserJourney);
  };

  const startLocalExperience = () => {
    clearStoredAccountData();
    setLoginIdentity('');
    hydratedProfileUserIdRef.current = undefined;
    setLocalProfile(defaultProfile);
    setLocalJourney({
      authenticated: false,
      membershipComplete: false,
      onboardingStep: 'profile',
    });
    browserSessionStorage()?.setItem(
      LOCAL_EXPERIENCE_MODE_KEY,
      '1',
    );
    setExperienceMode('local');
    setLoginError('');
    setPage('create');
    void Promise.allSettled([
      fetch('/wiz/api/page.home/logout', {
        method: 'POST',
        credentials: 'include',
      }),
      fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      }),
    ]);
  };

  const openLogin = () => {
    if (experienceMode === 'local') {
      discardLocalExperience();
      setExperienceMode(null);
    }
    setGuestMapPreview(false);
    setLoginError('');
    setPage('login');
  };

  const moveToStep = (
    onboardingStep: OnboardingStep,
  ) => {
    setJourney({
      ...journey,
      authenticated: false,
      membershipComplete: false,
      onboardingStep,
    });

    setPage(
      onboardingStep === 'terms'
        ? 'terms'
        : 'create',
    );
  };

  const saveProgress = useCallback(
    (
      step: 1 | 2,
      draft: UserProfile,
    ) => {
      setProfile(draft);

      setJourney({
        ...journey,
        authenticated: false,
        membershipComplete: false,
        onboardingStep:
          step === 1
            ? 'profile'
            : 'character',
      });
    },
    [
      journey,
      setJourney,
      setProfile,
    ],
  );

  const finishSignup = async (
    completedProfile: UserProfile,
  ) => {
    if (experienceMode === 'social') {
      try {
        await saveAccountProfile(completedProfile);
      } catch (error) {
        window.alert(
          error instanceof Error
            ? error.message
            : '프로필을 서버에 저장하지 못했습니다.',
        );
        return;
      }
    }

    setProfile(completedProfile);
    const currentUserId =
      readStoredValue(KAKAO_USER_ID_KEY)
        ?.trim();
    if (currentUserId) {
      hydratedProfileUserIdRef.current = currentUserId;
      writeStoredValue(
        ONBOARDING_COMPLETE_USER_ID_KEY,
        currentUserId,
      );
    }
    removeStoredValue('sejong-lake-tutorial-hidden-v2');
    removeStoredValue('sejong-lake-tutorial-hidden-v3');
    setJourney({
      authenticated: true,
      membershipComplete: true,
      onboardingStep: 'character',
    });

    setGameReturnState(undefined);
    setPage('game');
  };

  if (
    page === 'game' &&
    canExperience &&
    !behaviorStateReady
  ) {
    return <ExperienceLoading mapId={gameReturnState?.mapId} />;
  }

  if (
    import.meta.env.DEV &&
    location.pathname ===
      '/dev/character-test'
  ) {
    return <DeferredPage><CharacterTestPage /></DeferredPage>;
  }

  if (page === 'landing') {
    return (
      <LandingPage
        profile={profile}
        onStart={startExperience}
        onLogin={openLogin}
        onUserClick={() =>
          setPage('account')
        }
        actionLabel={
          canExperience
            ? '세종 월드 입장하기'
            : '로그인하고 월드 입장'
        }
        userName={
          canExperience
            ? profile.nickname
            : undefined
        }
      />
    );
  }

  if (page === 'login') {
    return (
      <LoginPage
        onBack={() =>
          setPage('landing')
        }
        loginUrl={KAKAO_LOGIN_URL}
        onLocalStart={startLocalExperience}
        errorMessage={loginError}
      />
    );
  }

  if (
    (
      page === 'game' ||
      page === 'community' ||
      page === 'account'
    ) &&
    !canExperience &&
    !(page === 'game' && guestMapPreview)
  ) {
    return (
      <LoginPage
        onBack={() =>
          setPage('landing')
        }
        loginUrl={KAKAO_LOGIN_URL}
        onLocalStart={startLocalExperience}
        errorMessage={loginError}
      />
    );
  }

  if (page === 'terms') {
    return (
      <TermsPage
        onBack={() =>
          setPage('login')
        }
        onComplete={() =>
          moveToStep('profile')
        }
      />
    );
  }

  if (page === 'create') {
    return (
      <DeferredPage><CreateProfilePage
        initial={profile}
        initialStep={
          journey.onboardingStep ===
          'character'
            ? 2
            : 1
        }
        onProgress={saveProgress}
        onCancel={() => setPage('landing')}
        onComplete={finishSignup}
      /></DeferredPage>
    );
  }

  if (page === 'complete') {
    return (
      <SignupCompletePage
        profile={profile}
        onEnter={() =>
          setPage('game')
        }
      />
    );
  }

  if (page === 'account') {
    return (
      <DeferredPage><CreateProfilePage
        initial={profile}
        editMode
        experienceMode={experienceMode === 'local' ? 'local' : 'social'}
        cancelLabel={gameReturnState?'맵으로 이동':'메인 이동'}
        onCancel={() =>
          setPage(gameReturnState?'game':'landing')
        }
        onWithdraw={() => {
          void withdrawAccount()
            .then(() => {
              clearStoredAccountData();
              setLoginIdentity('');
              setExperienceMode(null);
              hydratedProfileUserIdRef.current=undefined;
              setGameReturnState(undefined);
              setProfile(defaultProfile);
              setJourney(defaultUserJourney);
              setPage('landing');
              window.alert(
                '탈퇴가 완료되었습니다. 다시 이용하려면 카카오 로그인이 필요합니다.',
              );
            })
            .catch((error: unknown) => {
              window.alert(
                error instanceof Error
                  ? error.message
                  : '회원 탈퇴를 처리하지 못했습니다.',
              );
            });
        }}
        onLogout={() => {
          if (experienceMode === 'local') {
            discardLocalExperience();
            setExperienceMode(null);
            setGameReturnState(undefined);
            setPage('landing');
            return;
          }

          setGameReturnState(undefined);
          setLoginIdentity('');
          setExperienceMode(null);
          removeStoredValue(
            KAKAO_USER_ID_KEY,
          );

          removeStoredValue(
            KAKAO_PROFILE_IMAGE_KEY,
          );

          setJourney({
            ...journey,
            authenticated: false,
          });

          setPage('landing');
        }}
        onComplete={async (
          updatedProfile,
        ) => {
          if (experienceMode === 'social') {
            try {
              await saveAccountProfile(updatedProfile);
            } catch (error) {
              window.alert(
                error instanceof Error
                  ? error.message
                  : '프로필을 서버에 저장하지 못했습니다.',
              );
              return;
            }
          }
          setProfile(updatedProfile);
          setPage(gameReturnState?'game':'landing');
        }}
      /></DeferredPage>
    );
  }

  if (page === 'community') {
    return (
      <DeferredPage><CommunityPage
        profile={profile}
        onBack={() => {
          setGameReturnState(current=>current?.mapId==='campus'?current:{mapId:'campus',x:1200,z:1500,yaw:Math.PI});
          setPage('game');
        }}
      /></DeferredPage>
    );
  }

  if (page === 'game' && guestMapPreview) {
    return (
      <DeferredPage><MapPreviewPage
        profile={{...defaultProfile,nickname:'비로그인 둘러보기'}}
        returnState={gameReturnState}
        onExit={() => {
          setGuestMapPreview(false);
          setGameReturnState(undefined);
          setPage('landing');
        }}
        onLogin={openLogin}
      /></DeferredPage>
    );
  }

  return (
    <Suspense fallback={<ExperienceLoading mapId={gameReturnState?.mapId}/>}>
      <GamePage
        key={gameReturnState?.mapId??'default-world'}
        profile={
          profile.nickname.trim()
            ? profile
            : {
                ...profile,
                nickname: '체험 사용자',
              }
        }
        returnState={gameReturnState}
        onExit={() => {
          setGameReturnState(undefined);
          setPage('landing');
        }}
        onEditProfile={state => {
          setGameReturnState(state);
          setPage('account');
        }}
        onOpenCommunity={state => {
          setGameReturnState(state);
          setPage('community');
        }}
      />
    </Suspense>
  );
}
