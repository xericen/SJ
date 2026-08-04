import { API_BASE_URL } from '../config/api';

type WithdrawResult = {
  deleted: boolean;
  kakaoUnlinked: boolean | null;
};

export async function withdrawAccount(): Promise<WithdrawResult> {
  const response = await fetch('/wiz/api/page.home/withdraw', {
    method: 'POST',
    credentials: 'include',
  });
  const body = await response.json() as {
    code?: number;
    data?: Partial<WithdrawResult> & { message?: string };
  };

  if (
    !response.ok ||
    body.code !== 200 ||
    body.data?.deleted !== true
  ) {
    throw new Error(
      body.data?.message ||
      '회원 탈퇴를 처리하지 못했습니다.',
    );
  }

  return {
    deleted: body.data?.deleted === true,
    kakaoUnlinked:
      typeof body.data?.kakaoUnlinked === 'boolean'
        ? body.data.kakaoUnlinked
        : null,
  };
}
import type { UserProfile } from '../types';

export async function loadAccountProfile(): Promise<UserProfile | null> {
  const response = await fetch(`${API_BASE_URL}/account/me`, { credentials: 'include' });
  if (!response.ok) return null;
  const body = await response.json() as { data?: { profile?: UserProfile | null } };
  return body.data?.profile ?? null;
}

export async function saveAccountProfile(profile: UserProfile): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/account/me/profile`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...profile,
      recordVisibility: profile.recordVisibility ?? 'public',
      chatEnabled: profile.chatEnabled ?? true,
    }),
  });
  if (!response.ok) throw new Error('프로필을 서버에 저장하지 못했습니다.');
}

