type WithdrawResult = {
  deleted: boolean;
  kakaoUnlinked: boolean | null;
};

export type AccountSession = {
  userId: string;
  nickname: string;
};

export async function loadAccountSession(): Promise<AccountSession | null> {
  const response = await fetch('/wiz/api/page.home/me', {
    credentials: 'include',
  });
  const body = await response.json() as {
    code?: number;
    data?: {
      user?: {
        id?: unknown;
        name?: unknown;
      } | null;
      message?: string;
    };
  };

  if (!response.ok || body.code !== 200) {
    throw new Error(body.data?.message || '로그인 정보를 확인하지 못했습니다.');
  }

  const userId = typeof body.data?.user?.id === 'string'
    ? body.data.user.id.trim()
    : '';
  if (!userId) return null;

  return {
    userId,
    nickname: typeof body.data?.user?.name === 'string'
      ? body.data.user.name.trim()
      : '',
  };
}

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
  const response = await fetch('/wiz/api/page.home/account_profile', {
    credentials: 'include',
  });
  const body = await response.json() as {
    code?: number;
    data?: { profile?: UserProfile | null; message?: string };
  };
  if (!response.ok || body.code !== 200) {
    throw new Error(body.data?.message || '저장된 프로필을 불러오지 못했습니다.');
  }
  return body.data?.profile ?? null;
}

export async function saveAccountProfile(profile: UserProfile): Promise<void> {
  const formData = new URLSearchParams();
  formData.set('profile', JSON.stringify({
    ...profile,
    recordVisibility: profile.recordVisibility ?? 'public',
    chatEnabled: profile.chatEnabled ?? true,
  }));
  const response = await fetch('/wiz/api/page.home/account_profile', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: formData,
  });
  const body = await response.json() as { code?: number; data?: { message?: string } };
  if (!response.ok || body.code !== 200) {
    throw new Error(body.data?.message || '프로필을 서버에 저장하지 못했습니다.');
  }
}
