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
import { worldGuideEntryState } from './game/worldGuideEntryPoints';
import type { MapId,PortalPosition } from '../shared/socket-events';
import { loadAccountProfile, saveAccountProfile, withdrawAccount } from './services/accountProfile';
import { socket } from './game/systems/socketClient';
import {loadSharedWorldPortalState} from './services/worldPortalPositions';

const CharacterTestPage=lazy(()=>import('./pages/CharacterTestPage').then(module=>({default:module.CharacterTestPage})));
const CommunityPage=lazy(()=>import('./pages/CommunityPage').then(module=>({default:module.CommunityPage})));
const CreateProfilePage=lazy(()=>import('./pages/CreateProfilePage').then(module=>({default:module.CreateProfilePage})));
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
const DEMO_LOGIN_URL = '/auth/demo';
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
  const [gameReturnState,setGameReturnState]=useState<GameReturnState>();
  const [guestMapPreview,setGuestMapPreview]=useState(false);
  const [behaviorStateReady,setBehaviorStateReady]=useState(false);
  const hydratedProfileUserIdRef=useRef<string|undefined>(undefined);

  const [
    storedProfile,
    setProfile,
  ] = useLocalStorage<UserProfile>(
    PROFILE_KEY,
    defaultProfile,
  );

  const [
    journey,
    setJourney,
  ] = useLocalStorage<UserJourney>(
    USER_JOURNEY_KEY,
    defaultUserJourney,
  );

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
  const canExperience =
    journey.authenticated &&
    membershipComplete &&
    hasLoginIdentity;

  useEffect(() => {
    if (!canExperience) {
      setBehaviorStateReady(false);
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
  }, [canExperience]);

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
        !hasLoginIdentity
      )
    ) {
      setJourney({
        ...journey,
        authenticated: false,
      });
    }
  }, [
    journey,
    hasLoginIdentity,
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

    // OAuth success must always show setup in this browser context.
    // Stale local demo data must never skip directly into the lake world.
    const completedMembership = false;

    const nextProfile: UserProfile = {
      ...(completedMembership
        ? profile
        : defaultProfile),
      nickname:
        nickname ||
        (completedMembership
          ? profile.nickname
          : '') ||
        '카카오 사용자',
    };

    setProfile(nextProfile);

    setJourney({
      ...journey,
      authenticated:
        completedMembership,
      membershipComplete:
        completedMembership,
      onboardingStep:
        completedMembership
          ? journey.onboardingStep
          : 'profile',
    });

    if (completedMembership) {
      setPage('game');
    } else {
      setPage('create');
    }

    window.history.replaceState(
      {},
      document.title,
      window.location.pathname,
    );
  }, []);

  useEffect(() => {
    if (!hasLoginIdentity || !membershipComplete) return;
    const userId=localStorage.getItem(KAKAO_USER_ID_KEY)?.trim();
    if(!userId||hydratedProfileUserIdRef.current===userId)return;
    hydratedProfileUserIdRef.current=userId;
    void loadAccountProfile().then(saved => {
      if (saved) setProfile({ ...defaultProfile, ...saved });
    }).catch(() => {
      if(hydratedProfileUserIdRef.current===userId)hydratedProfileUserIdRef.current=undefined;
    });
  }, [hasLoginIdentity, membershipComplete, setProfile]);

  const startExperience = () => {
    setPage(
      canExperience
        ? 'game'
        : 'login',
    );
  };

  const enterWorld = async (mapId:MapId) => {
    let positions:PortalPosition[]=[];
    try{
      positions=(await loadSharedWorldPortalState()).positions;
      if(!positions.length)positions=await new Promise<PortalPosition[]>(resolve=>{
        let settled=false;
        const finish=(value:PortalPosition[])=>{if(settled)return;settled=true;window.clearTimeout(timer);socket.off('connect',request);resolve(value)};
        const request=()=>socket.emit('getPortalPositions',value=>finish(Array.isArray(value)?value:[]));
        const timer=window.setTimeout(()=>finish([]),2500);
        if(socket.connected)request();else{socket.on('connect',request);socket.connect()}
      });
    }catch{/* The authored portal remains a safe offline fallback. */}
    setGameReturnState(worldGuideEntryState(mapId,positions));
    setGuestMapPreview(!canExperience);
    setPage('game');
  };

  const openLogin = () => {
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

  const finishSignup = (
    completedProfile: UserProfile,
  ) => {
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
    removeStoredValue('sejong-lake-tutorial-hidden-v1');
    void saveAccountProfile(completedProfile).catch(error => console.warn('[account profile save failed]', error instanceof Error ? error.message : 'unknown'));

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
        onEnterWorld={enterWorld}
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
        demoLoginUrl={DEMO_LOGIN_URL}
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
        demoLoginUrl={DEMO_LOGIN_URL}
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
        cancelLabel={gameReturnState?'맵으로 이동':'메인 이동'}
        onCancel={() =>
          setPage(gameReturnState?'game':'landing')
        }
        onWithdraw={() => {
          void withdrawAccount()
            .then(() => {
              clearStoredAccountData();
              setLoginIdentity('');
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
          setGameReturnState(undefined);
          setLoginIdentity('');
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
        onComplete={(
          updatedProfile,
        ) => {
          setProfile(updatedProfile);
          void saveAccountProfile(updatedProfile).catch(error => console.warn('[account profile save failed]', error instanceof Error ? error.message : 'unknown'));
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
