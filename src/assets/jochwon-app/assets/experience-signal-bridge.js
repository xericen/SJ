import { f as recordExperience } from './experienceRecommendationProfile-BBP-O_mf.js';

const PROFILE_KEY = 'yeogi-profile';
const ONCE_PREFIX = 'experience-signal-once-v1:';

function nickname() {
  try {
    const profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
    return typeof profile.nickname === 'string' && profile.nickname.trim()
      ? profile.nickname.trim()
      : 'guest';
  } catch {
    return 'guest';
  }
}

function recordOnce(signal) {
  const subject = `${signal.subject}`;
  const key = `${ONCE_PREFIX}${signal.mapId}:${signal.action}:${subject}`;
  try {
    if (localStorage.getItem(key) === '1') return;
    localStorage.setItem(key, '1');
  } catch {}
  recordExperience(nickname(), {
    ...signal,
    subject,
    point: Math.max(1, Math.min(20, signal.point ?? 5)),
  });
}

function observeCompletion(selector, signal) {
  const observer = new MutationObserver(() => {
    if (document.querySelector(selector)) recordOnce(signal);
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// Smart city emits this only after all four service panels have been completed.
window.addEventListener('sejong-profile-progress-updated', (event) => {
  if (event.detail?.mapId !== 'sejong-smart-city') return;
  recordOnce({
    mapId: 'sejong-smart-city',
    zone: '세종 스마트시티',
    action: 'smart-city-complete',
    subject: 'all-services',
    title: '스마트시티 핵심 서비스 체험 완료',
    note: 'AI·자율주행·스마트 에너지 전시를 모두 확인했어요.',
    keywords: ['스마트시티', 'AI', '자율주행', '스마트 에너지'],
    axes: { explore: 8, record: 4 },
    point: 12,
  });
});

observeCompletion('.government-ai-city-hologram', {
  mapId: 'government-central-plaza',
  zone: '정부청사 중앙광장',
  action: 'recommendation-center-complete',
  subject: 'ai-city-hologram',
  title: 'AI 세종 추천센터 체험 완료',
  note: '중앙광장의 AI 세종 추천센터 안내를 확인했어요.',
  keywords: ['AI 세종 추천센터', '도시 안내'],
  axes: { explore: 5, record: 3 },
  point: 8,
});

observeCompletion('.observatory-telescope-view', {
  mapId: 'government-observatory',
  zone: '전망대',
  action: 'telescope-complete',
  subject: 'main-telescope',
  title: '전망대 망원경 체험 완료',
  note: '망원경으로 세종시 전경을 확인했어요.',
  keywords: ['전망대', '망원경', '세종 전경'],
  axes: { explore: 5, record: 3 },
  point: 8,
});
