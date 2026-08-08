import { f as recordExperience } from './experienceRecommendationProfile-BBP-O_mf.js';

const PROFILE_KEY = 'yeogi-profile';
const ONCE_PREFIX = 'experience-signal-once-v1:';
const SUMMARY_PREFIX = 'sejong-hub-profile-summary-v1:';
const TOTAL_COMPLETIONS = 13;

const REPRESENTATIVE = {
  'arts-center': { title: '예술의전당 공연 체험 완료', subject: 'arts-center', axes: { culture: 5, record: 4 }, keywords: ['공연', '몰입', '예술'], actions: ['finish', 'performance-finish', 'video-finish'] },
  'festival-experience': { title: '축제 부스 체험 완료', subject: 'festival-booth', axes: { culture: 5, explore: 4 }, keywords: ['축제', '문화', '공연'] },
  'food-experience': { title: '먹거리 부스 체험 완료', subject: 'food-booth', axes: { food: 5, explore: 4 }, keywords: ['먹거리', '맛집', '로컬'] },
  'bear-play-zone': { title: '곰 체험소 체험 완료', subject: 'bear-zone', axes: { nature: 5, explore: 4 }, keywords: ['곰', '관찰', '탐험'] },
  garden: { title: '국립세종수목원 체험 완료', subject: 'garden', axes: { nature: 5, record: 4 }, keywords: ['식물', '자연', '기록'] },
  'bear-tree-photo': { title: '포토존 체험 완료', subject: 'photo-zone', axes: { nature: 5, record: 4 }, keywords: ['사진', '자연', '추억'] },
  'project-room': { title: '프로젝트실 체험 완료', subject: 'project-room', axes: { relation: 5, record: 4 }, keywords: ['협업', '프로젝트', '계획'], actions: ['create-project', 'join-project', 'save-memo', 'save-place', 'project-chat'] },
  'student-hall': { title: '학생회관 교류 체험 완료', subject: 'student-hall', axes: { relation: 5, explore: 4 }, keywords: ['이웃', '교류', '추천'], actions: ['recommended-profile', 'chat-request'] },
  'recruitment-center': { title: '모집센터 참여 체험 완료', subject: 'recruitment-center', axes: { relation: 5, explore: 3, record: 3 }, keywords: ['동행', '모집', '참여'], actions: ['apply-recruitment', 'create-recruitment', 'save-recruitment'] },
  'club-street-festival': { title: '동아리 거리제 체험 완료', subject: 'club-street', axes: { culture: 4, relation: 4, record: 3 }, keywords: ['동아리', '공동체', '문화'], actions: ['join-club', 'theme-idea', 'share-place', 'club-intro', 'create-club'] },
  'sejong-smart-city': { title: '스마트시티 체험 완료', subject: 'smart-city', axes: { explore: 8, record: 4 }, keywords: ['AI', '자율주행', '스마트도시'] },
  'government-central-plaza': { title: '중앙광장 추천센터 체험 완료', subject: 'recommendation-center', axes: { explore: 5, record: 3 }, keywords: ['AI', '도시안내', '광장'] },
  'government-observatory': { title: '전망대 망원경 체험 완료', subject: 'observatory', axes: { explore: 5, record: 3 }, keywords: ['전망', '망원경', '세종'] },
};

const nickname = () => {
  try { const p = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}'); return p.nickname?.trim() || 'guest'; } catch { return 'guest'; }
};
const profileKey = () => `sejong-campus-profile-signals-v1:${nickname().toLowerCase()}`;
const readSignals = () => { try { const v = JSON.parse(localStorage.getItem(profileKey()) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; } };

function recordOnce(def, mapId) {
  const key = `${ONCE_PREFIX}${mapId}:experience-complete:${def.subject}`;
  try { if (localStorage.getItem(key) === '1') return; localStorage.setItem(key, '1'); } catch { return; }
  recordExperience(nickname(), { mapId, zone: def.title.replace(' 체험 완료', ''), action: 'experience-complete', subject: def.subject, title: def.title, note: def.title, keywords: def.keywords, axes: def.axes, point: 10 });
  updateSummary();
}

function updateSummary() {
  const signals = readSignals();
  const complete = [...new Map(signals.filter(s => s.action === 'experience-complete').map(s => [s.id, s])).values()];
  const axes = Object.fromEntries(['nature', 'culture', 'explore', 'record', 'relation', 'food'].map(axis => [axis, Math.min(100, signals.reduce((n, s) => n + Math.min(10, Number(s.axes?.[axis]) || 0), 0))]));
  const keywordScores = new Map();
  signals.forEach((signal) => {
    const keywords = Array.isArray(signal.keywords) ? signal.keywords : [];
    keywords.forEach((keyword) => {
      keywordScores.set(keyword, Math.min(20, (keywordScores.get(keyword) || 0) + Math.min(10, Number(signal.point) || 1)));
    });
  });
  const summary = { version: 1, updatedAt: new Date().toISOString(), recentActivities: complete.sort((a, b) => Date.parse(b.at || 0) - Date.parse(a.at || 0)).slice(0, 20).map(s => ({ id: s.id, title: s.title, at: s.at })), keywords: [...keywordScores.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([keyword]) => keyword), axes, completion: Math.round(Math.min(TOTAL_COMPLETIONS, complete.length) / TOTAL_COMPLETIONS * 100), completedExperiences: complete.map(s => s.id) };
  try { localStorage.setItem(`${SUMMARY_PREFIX}${nickname().toLowerCase()}`, JSON.stringify(summary)); } catch {}
  window.dispatchEvent(new CustomEvent('sejong-hub-profile-summary-updated', { detail: summary }));
}

function handleSignal(signal) {
  if (!signal?.mapId || signal.action === 'map-visit' || signal.action === 'experience-complete') return;
  const def = REPRESENTATIVE[signal.mapId];
  if (!def || (def.actions && !def.actions.includes(signal.action))) return;
  recordOnce(def, signal.mapId);
}

function scanCompletionMarkers() {
  const name = nickname().toLowerCase();
  try {
    const food = JSON.parse(localStorage.getItem('sejong-food-visit-candidates-v1') || '[]');
    if (Array.isArray(food) && new Set(food).size >= 3) recordOnce(REPRESENTATIVE['food-experience'], 'food-experience');
    const photo = localStorage.getItem(`bear-tree-photo-completed-v1:${name}`) === 'true';
    if (photo) recordOnce(REPRESENTATIVE['bear-tree-photo'], 'bear-tree-photo');
    const garden = JSON.parse(localStorage.getItem(`greenhouse-progress-v1:${name}`) || 'null');
    if (garden?.collected?.length && (garden.memoryLeaves?.length || garden.representativePlant?.memo)) recordOnce(REPRESENTATIVE.garden, 'garden');
    const bear = JSON.parse(localStorage.getItem(`bear-wildlife-comparison-v2:${name}`) || 'null');
    if (bear?.completedClues?.length >= 3 && bear.completedAt) recordOnce(REPRESENTATIVE['bear-play-zone'], 'bear-play-zone');
  } catch {}
}

window.addEventListener('sejong-experience-profile-updated', event => { handleSignal(event.detail?.signal || event.detail); scanCompletionMarkers(); });
window.addEventListener('sejong-profile-progress-updated', event => {
  const d = event.detail || {};
  if (d.mapId === 'sejong-smart-city') recordOnce(REPRESENTATIVE['sejong-smart-city'], 'sejong-smart-city');
  handleSignal(d.signal || d);
  scanCompletionMarkers();
});

new MutationObserver(scanCompletionMarkers).observe(document.body, { childList: true, subtree: true });
setInterval(scanCompletionMarkers, 500);
updateSummary();
