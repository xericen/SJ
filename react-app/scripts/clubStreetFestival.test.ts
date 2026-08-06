import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import test from 'node:test';

const root=resolve(import.meta.dirname,'..');
const read=(path:string)=>readFileSync(resolve(root,path),'utf8');

test('동아리 거리제 공동캠퍼스 포탈은 WIZ 권한과 공용 좌표만 사용한다',()=>{
  const renderer=read('src/game/renderers/VillageMapRenderer.ts');
  const page=read('src/pages/GamePage.tsx');
  const canvas=read('src/game/GameCanvas.tsx');
  const portalConfig=renderer.split('\n').find(line=>line.includes("WORLD_GUIDE_PORTAL_POSITIONS['club-street-festival']"));
  const editorButton=page.split('\n').find(line=>line.includes("currentMapId==='club-street-festival'&&canEditPortals"));

  assert.ok(portalConfig);
  assert.match(portalConfig,/fixedPosition:false,sharedPosition:true/);
  assert.doesNotMatch(portalConfig,/positionEditable:true/);
  assert.ok(editorButton);
  assert.match(editorButton,/world-portal-place-at-player','campus'/);
  assert.doesNotMatch(page,/socket\.on\('portalEditorPermission'/);
  assert.match(canvas,/loadSharedWorldPortalState\(\)\.then\(\(\{positions\}\)=>\{if\(!cancelled&&positions\.length\)syncPortalPositions\(positions\)\}/);
});

test('동아리 창설 부스는 남쪽 입구의 맨 앞 부스에 고정한다',()=>{
  const renderer=read('src/game/renderers/VillageMapRenderer.ts');
  const order=renderer.match(/const CLUB_STREET_BOOTH_ANCHORS_FRONT_TO_BACK=\[([\s\S]*?)\] as const;/)?.[1]??'';

  assert.match(order,/ClubBooth_L5_CanvasRoof/);
  assert.ok(order.indexOf('ClubBooth_L5_CanvasRoof')<order.indexOf('ClubBooth_L4_CanvasRoof'));
  assert.ok(order.indexOf('ClubBooth_L4_CanvasRoof')<order.indexOf('ClubBooth_L1_CanvasRoof'));
  assert.doesNotMatch(renderer,/clubBoothCardAnchors\.sort\([\s\S]*portalRoot/);
});
