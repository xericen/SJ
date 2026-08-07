const ENDPOINT = '/wiz/api/page.home/behavior_state';
const SYNCED_AT_KEY = 'jochwon-behavior-state-synced-at';
const MAX_VALUE_BYTES = 200_000;
const MAX_PAYLOAD_BYTES = 700_000;
const SYNC_INTERVAL_MS = 2_000;

const behaviorKeyPrefixes = [
  'sejong-',
  'greenhouse-',
  'bear-',
  'campus-',
  'government-',
  'nature-discovery-',
  'festival-',
  'food-',
  'project-room-',
  'club-street-',
  'arts-center-',
] as const;

type BehaviorEntries = Record<string, string>;
type BehaviorStateResponse = {
  code?: number;
  data?: {
    entries?: unknown;
    updatedAt?: unknown;
  };
};

const byteLength = (value: string) =>
  new TextEncoder().encode(value).byteLength;

export const isBehaviorStorageKey = (key: string) =>
  key.length <= 180 &&
  behaviorKeyPrefixes.some((prefix) => key.startsWith(prefix));

const readSnapshot = (): BehaviorEntries => {
  const entries: BehaviorEntries = {};
  let total = 0;

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key || !isBehaviorStorageKey(key)) continue;
    const value = localStorage.getItem(key);
    if (value === null) continue;
    const size = byteLength(value);
    if (size > MAX_VALUE_BYTES || total + size > MAX_PAYLOAD_BYTES) continue;
    entries[key] = value;
    total += size;
  }

  return entries;
};

const validRemoteEntries = (value: unknown): BehaviorEntries => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      ([key, entry]) =>
        isBehaviorStorageKey(key) &&
        typeof entry === 'string' &&
        byteLength(entry) <= MAX_VALUE_BYTES,
    ),
  );
};

const localSyncedAt = () => {
  const value = Date.parse(localStorage.getItem(SYNCED_AT_KEY) ?? '');
  return Number.isFinite(value) ? value : 0;
};

const setSyncedAt = (value: unknown) => {
  const parsed = typeof value === 'string' ? Date.parse(value) : Number.NaN;
  localStorage.setItem(
    SYNCED_AT_KEY,
    new Date(Number.isFinite(parsed) ? parsed : Date.now()).toISOString(),
  );
};

const encodeSnapshot = (entries: BehaviorEntries) =>
  JSON.stringify({ version: 1, entries });

async function loadRemoteState() {
  const response = await fetch(ENDPOINT, { credentials: 'include' });
  if (!response.ok) throw new Error(`behavior state load ${response.status}`);
  const body = (await response.json()) as BehaviorStateResponse;
  const remote = validRemoteEntries(body.data?.entries);
  const remoteUpdatedAt =
    typeof body.data?.updatedAt === 'string'
      ? Date.parse(body.data.updatedAt)
      : Number.NaN;
  const remoteIsNewer =
    Number.isFinite(remoteUpdatedAt) && remoteUpdatedAt > localSyncedAt();

  for (const [key, value] of Object.entries(remote)) {
    if (remoteIsNewer || localStorage.getItem(key) === null) {
      localStorage.setItem(key, value);
    }
  }

  if (Object.keys(remote).length) {
    window.dispatchEvent(
      new CustomEvent('sejong-behavior-state-hydrated', {
        detail: { keys: Object.keys(remote) },
      }),
    );
  }

  if (Number.isFinite(remoteUpdatedAt)) setSyncedAt(body.data?.updatedAt);
}

async function saveRemoteState(
  entries: BehaviorEntries,
  keepalive = false,
) {
  const payload = encodeSnapshot(entries);
  const form = new URLSearchParams({ payload });
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    credentials: 'include',
    keepalive,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: form.toString(),
  });
  if (!response.ok) throw new Error(`behavior state save ${response.status}`);
  const body = (await response.json()) as BehaviorStateResponse;
  setSyncedAt(body.data?.updatedAt);
}

export function startBehaviorStateSync() {
  let stopped = false;
  let remoteUnavailable = false;
  let sending = false;
  let lastSnapshot = '';

  const push = async (keepalive = false) => {
    if (stopped || remoteUnavailable || sending) return;
    const entries = readSnapshot();
    const serialized = encodeSnapshot(entries);
    if (!keepalive && serialized === lastSnapshot) return;
    sending = true;
    try {
      await saveRemoteState(entries, keepalive);
      lastSnapshot = serialized;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown';
      if (message === 'Failed to fetch' || error instanceof TypeError) {
        remoteUnavailable = true;
      } else {
        console.warn('[behavior state sync failed]', message);
      }
    } finally {
      sending = false;
    }
  };

  const ready = (async () => {
    try {
      await loadRemoteState();
    } catch (error) {
      if (error instanceof TypeError || (error instanceof Error && error.message === 'Failed to fetch')) {
        remoteUnavailable = true;
      } else {
        console.warn('[behavior state hydrate failed]', error instanceof Error ? error.message : 'unknown');
      }
    }
    if (!stopped) await push();
  })();

  const timer = window.setInterval(() => {
    void push();
  }, SYNC_INTERVAL_MS);
  const onOnline = () => void push();
  const onPageHide = () => void push(true);
  window.addEventListener('online', onOnline);
  window.addEventListener('pagehide', onPageHide);

  return {
    ready,
    stop() {
      if (stopped) return;
      void push(true);
      stopped = true;
      window.clearInterval(timer);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('pagehide', onPageHide);
    },
  };
}
