import assert from 'node:assert/strict';
import test from 'node:test';

import { clearAllAccountData } from '../src/services/accountData';
import {
  loadAccountProfile,
  saveAccountProfile,
} from '../src/services/accountProfile';
import { defaultProfile } from '../src/stores/profileStore';

class MemoryStorage {
  private readonly values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

test('로컬 체험 종료 시 계정·월드 체험 데이터만 제거한다', () => {
  const storage = new MemoryStorage();
  storage.setItem('yeogi-profile', '{}');
  storage.setItem('food-experience-stamps-v1', '[]');
  storage.setItem('arts-center-favorites-v1', '[]');
  storage.setItem('unrelated-ui-theme', 'dark');

  const removed = clearAllAccountData(storage);

  assert.deepEqual(removed.sort(), [
    'arts-center-favorites-v1',
    'food-experience-stamps-v1',
    'yeogi-profile',
  ]);
  assert.equal(storage.getItem('unrelated-ui-theme'), 'dark');
});

test('소셜 프로필은 WIZ 계정 API에서 복원한다', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    assert.equal(input, '/wiz/api/page.home/account_profile');
    return new Response(JSON.stringify({
      code: 200,
      data: { profile: { ...defaultProfile, nickname: '다시온사용자' } },
    }), { status: 200 });
  };

  try {
    const profile = await loadAccountProfile();
    assert.equal(profile?.nickname, '다시온사용자');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('소셜 프로필 저장은 form-urlencoded로 WIZ DB API에 전송한다', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    assert.equal(input, '/wiz/api/page.home/account_profile');
    assert.equal(init?.method, 'POST');
    assert.equal(
      (init?.headers as Record<string, string>)['Content-Type'],
      'application/x-www-form-urlencoded;charset=UTF-8',
    );
    const payload = new URLSearchParams(String(init?.body)).get('profile');
    assert.equal(JSON.parse(payload ?? '{}').nickname, '저장사용자');
    return new Response(JSON.stringify({ code: 200, data: {} }), {
      status: 200,
    });
  };

  try {
    await saveAccountProfile({ ...defaultProfile, nickname: '저장사용자' });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
