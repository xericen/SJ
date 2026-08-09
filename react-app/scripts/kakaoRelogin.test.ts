import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
const api=readFileSync(new URL('../../src/app/page.home/api.py',import.meta.url),'utf8');

test('명시적 로그아웃은 브라우저 인증 복원 상태와 서버 세션을 함께 정리한다',()=>{
  assert.match(app,/removeStoredValue\(\s*ONBOARDING_COMPLETE_USER_ID_KEY/);
  assert.match(app,/setItem\(KAKAO_REAUTH_REQUIRED_KEY, '1'\)/);
  assert.match(app,/await Promise\.allSettled\(\[/);
  assert.match(app,/fetch\('\/wiz\/api\/page\.home\/logout'/);
  assert.match(app,/fetch\('\/api\/auth\/logout'/);
});

test('로그아웃 뒤 카카오 로그인만 재인증 화면을 강제한다',()=>{
  assert.match(app,/`\$\{KAKAO_LOGIN_URL\}\?reauth=1`/);
  assert.match(api,/wiz\.request\.query\("reauth", ""\) == "1"/);
  assert.match(api,/session\.set\(kakao_reauth_required=True\)/);
  assert.match(api,/session\.get\("kakao_reauth_required", False\)/);
  assert.match(api,/if reauth:\s+[\s\S]*?session\.clear\(\)/);
  assert.match(api,/params\["prompt"\] = "login"/);
});
