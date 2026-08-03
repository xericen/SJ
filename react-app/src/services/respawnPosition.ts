import type { RespawnPosition } from '../../shared/socket-events';

const POST_LIST_API = '/wiz/api/portal.post.list/search';
const POST_DETAIL_API = '/wiz/api/portal.post.detail/save';
const RESPAWN_CATEGORY = '__system_world_respawn__';
const DEFAULT_RESPAWN: RespawnPosition = { x: 1870, z: 1180, yaw: 2.1 };

type WizApiResponse<T> = {
  code: number;
  data?: T & { message?: string };
};

type RespawnPost = {
  id: string;
  content?: string;
};

const validPosition = (value: unknown): value is RespawnPosition => {
  if (!value || typeof value !== 'object') return false;
  const position = value as Partial<RespawnPosition>;
  return [position.x, position.z, position.yaw].every(Number.isFinite)
    && position.x! >= 0 && position.x! <= 2400
    && position.z! >= 0 && position.z! <= 1900;
};

async function callWiz<T>(url: string, payload: Record<string, string>): Promise<WizApiResponse<T>> {
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: new URLSearchParams(payload),
  });
  const body = await response.json().catch(() => null) as WizApiResponse<T> | null;
  if (!response.ok || !body || body.code < 200 || body.code >= 300) {
    throw new Error(body?.data?.message || '리스폰 서버에 연결하지 못했습니다.');
  }
  return body;
}

async function loadRespawnPost(): Promise<RespawnPost | undefined> {
  const body = await callWiz<{ rows?: RespawnPost[] }>(POST_LIST_API, {
    page: '1',
    dump: '1',
    category: RESPAWN_CATEGORY,
  });
  return body.data?.rows?.[0];
}

const positionFromPost = (post?: RespawnPost): RespawnPosition | undefined => {
  if (!post?.content) return undefined;
  try {
    const parsed = JSON.parse(post.content);
    return validPosition(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
};

export async function getSharedRespawnPosition(): Promise<RespawnPosition> {
  return positionFromPost(await loadRespawnPost()) ?? DEFAULT_RESPAWN;
}

export async function saveSharedRespawnPosition(position: RespawnPosition): Promise<{ position: RespawnPosition; message: string }> {
  if (!validPosition(position)) throw new Error('현재 위치를 리스폰으로 저장할 수 없습니다.');
  const current = await loadRespawnPost();
  const normalized = { x: Math.round(position.x), z: Math.round(position.z), yaw: position.yaw };
  const record: Record<string, string> = {
    title: '세종호수공원 공용 리스폰 위치',
    content: JSON.stringify(normalized),
    category: RESPAWN_CATEGORY,
    status: 'draft',
  };
  if (current?.id) record.id = current.id;
  await callWiz<Record<string, unknown>>(POST_DETAIL_API, {
    data: JSON.stringify(record),
  });
  const saved = positionFromPost(await loadRespawnPost());
  if (!saved || saved.x !== normalized.x || saved.z !== normalized.z || saved.yaw !== normalized.yaw) {
    throw new Error('저장된 리스폰 위치를 다시 확인하지 못했습니다.');
  }
  return {
    position: saved,
    message: `현재 위치(${saved.x}, ${saved.z})를 공용 리스폰으로 저장했어요.`,
  };
}
