import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {
    createRandomAvatarCustomization,
    DEFAULT_AVATAR_CUSTOMIZATION,
    normalizeAvatarCustomization
} from '../src/app/page.home/avatar-customization.model';
import {
    AVATAR_BASE_MODELS,
    AVATAR_MODEL_VERSION,
    AVATAR_PARTS,
    constrainAvatarCustomization,
    getAvatarBaseModel,
    getEnabledAvatarModels
} from '../src/app/page.home/avatar-assets.config';
import { applyAvatarCustomization, prepareAvatarModel } from '../src/app/page.home/avatar-customizer';
import { validateAvatarModel } from '../src/app/page.home/avatar-model-validator';
import { CharacterManager } from '../src/app/page.home/character-manager';
import { SkeletalAvatarRenderer } from '../src/app/page.home/skeletal-avatar-renderer';
import {
    CharacterMovementController,
    RUN_HOLD_DELAY_MS,
    RUN_SPEED,
    WALK_SPEED
} from '../src/app/page.home/character-movement';
import { CharacterAnimationStateMachine } from '../src/app/page.home/character-animation-state';

assert.equal(AVATAR_MODEL_VERSION, 'beaver-v1');
assert.deepEqual(getEnabledAvatarModels().map((model) => model.id), ['cozy-beaver', 'chungnyeong']);
assert.equal(getAvatarBaseModel('toy-active').id, 'cozy-beaver');
assert.equal(AVATAR_BASE_MODELS.find((model) => model.id === 'toy-active-v3')?.enabled, false);
assert.equal(AVATAR_BASE_MODELS.find((model) => model.id === 'toy-rounded-v3')?.verified, false);

const stable = getAvatarBaseModel('cozy-beaver');
assert.equal(stable.frontRotationY, 0);
const chungnyeong = getAvatarBaseModel('chungnyeong');
assert.equal(chungnyeong.rigState, 'animated');
assert.equal(chungnyeong.frontRotationY, Math.PI);
assert.deepEqual(chungnyeong.poseCorrection, { idlePitchDeg: 0, walkPitchDeg: 4, runPitchDeg: 12 });
assert.equal(chungnyeong.directionMode, 'cameraFriendly');
assert.deepEqual(chungnyeong.directionYawDeg, {
    down: 0,
    downRight: 35,
    right: 50,
    upRight: 70,
    up: 60,
    upLeft: -70,
    left: -50,
    downLeft: -35
});
assert.equal(chungnyeong.maxYawDeg, 70);
assert.equal(chungnyeong.removeRootMotion, true);

const directionResolver = (SkeletalAvatarRenderer.prototype as any).resolveDirectionYaw;
const directionContext: any = { activeAsset: chungnyeong, lastHorizontalDirection: 0 };
const resolveYawDeg = (rawYaw: number) => {
    const result = directionResolver.call(directionContext, rawYaw, true);
    return { input: result.input, yawDeg: Math.round(THREE.MathUtils.radToDeg(result.yaw)) };
};
assert.deepEqual(resolveYawDeg(0), { input: 'down', yawDeg: 0 });
assert.deepEqual(resolveYawDeg(Math.PI / 4), { input: 'downRight', yawDeg: 35 });
assert.deepEqual(resolveYawDeg(Math.PI / 2), { input: 'right', yawDeg: 50 });
assert.deepEqual(resolveYawDeg(Math.PI * 3 / 4), { input: 'upRight', yawDeg: 70 });
directionContext.lastHorizontalDirection = 0;
assert.deepEqual(resolveYawDeg(Math.PI), { input: 'up', yawDeg: 60 });
assert.deepEqual(resolveYawDeg(-Math.PI * 3 / 4), { input: 'upLeft', yawDeg: -70 });
assert.deepEqual(resolveYawDeg(-Math.PI / 2), { input: 'left', yawDeg: -50 });
assert.deepEqual(resolveYawDeg(-Math.PI / 4), { input: 'downLeft', yawDeg: -35 });
assert.deepEqual(resolveYawDeg(Math.PI), { input: 'up', yawDeg: -70 });
assert.deepEqual(resolveYawDeg(Math.PI / 2), { input: 'right', yawDeg: 50 });
assert.deepEqual(resolveYawDeg(Math.PI), { input: 'up', yawDeg: 70 });

assert.equal(chungnyeong.path, '/assets/avatar/models/chungnyeong-idle.glb');
assert.deepEqual(chungnyeong.animationMap, { idle: 0, walk: 'Walk', run: 'Run' });
assert.deepEqual(chungnyeong.animationSources, {
    Walk: { path: '/assets/avatar/models/chungnyeong-walk.glb', clip: 0 },
    Run: { path: '/assets/avatar/models/chungnyeong-run.glb', clip: 0 }
});
assert.equal(chungnyeong.mapScale, 1.5);
assert.equal(constrainAvatarCustomization(normalizeAvatarCustomization({ baseModelId: 'chungnyeong' })).baseModelId, 'chungnyeong');
for (let index = 0; index < 100; index += 1) {
    const value = createRandomAvatarCustomization();
    assert.equal(value.baseModelId, 'cozy-beaver');
}
assert.equal(stable.capabilities.colorSlots.length, 0);

const migrated = constrainAvatarCustomization(normalizeAvatarCustomization({
    baseModelId: 'toy-active', faceId: 'surprised', hairStyleId: 'ponytail', topId: 'sweatshirt',
    bottomId: 'pants', shoesId: 'hightop', accessoryIds: ['beard'], skin: 'deep'
}));
assert.equal(migrated.baseModelId, 'cozy-beaver');
assert.equal(migrated.faceId, 'smile');
assert.equal(migrated.hairStyleId, 'short');
assert.equal(migrated.topId, 'hoodie');
assert.equal(migrated.shoesId, 'sneakers');
assert.deepEqual(migrated.accessoryIds, []);
assert.equal(migrated.skinColor, '#a96f50');

function allPartNames(): string[] {
    return Object.values(AVATAR_PARTS).flatMap((category) => Object.values(category).flat()) as string[];
}

function createTestModel() {
    const root = new THREE.Group();
    allPartNames().forEach((name) => { const part = new THREE.Group(); part.name = name; root.add(part); });
    ['SkinMaterial','HairMaterial','TopMaterial','BottomMaterial','ShoesMaterial'].forEach((name) => {
        const material = new THREE.MeshStandardMaterial({ name, color: '#ffffff' });
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.5), material);
        mesh.name = `Test_${name}`; root.add(mesh);
    });
    return root;
}

const modelA = createTestModel();
const modelB = createTestModel();
prepareAvatarModel(modelA);
prepareAvatarModel(modelB);
const selected = { ...DEFAULT_AVATAR_CUSTOMIZATION, hairStyleId: 'curly', topId: 'jacket', bottomId: 'shorts', shoesId: 'boots', shoesColor: '#29435d' };
applyAvatarCustomization(modelA, selected);
AVATAR_PARTS.hair.curly.forEach((name) => assert.equal(modelA.getObjectByName(name)?.visible, true));
AVATAR_PARTS.shoes.boots.forEach((name) => assert.equal(modelA.getObjectByName(name)?.visible, true));
const shoesA = modelA.getObjectByName('Test_ShoesMaterial') as THREE.Mesh;
const shoesB = modelB.getObjectByName('Test_ShoesMaterial') as THREE.Mesh;
assert.equal((shoesA.material as THREE.MeshStandardMaterial).color.getHexString(), '29435d');
assert.equal((shoesB.material as THREE.MeshStandardMaterial).color.getHexString(), 'ffffff');
assert.notEqual(shoesA.material, shoesB.material);

const glb = fs.readFileSync('src/assets/avatar/toy-avatar.glb');
assert.equal(glb.toString('utf8', 0, 4), 'glTF');
const jsonLength = glb.readUInt32LE(12);
const json = JSON.parse(glb.subarray(20, 20 + jsonLength).toString().replace(/\0+$/, ''));
assert.deepEqual(new Set((json.animations || []).map((clip: {name?: string}) => clip.name)), new Set(['Idle','Walk','Run','Jump','Wave','Happy','Surprised','Heart','Sit']));
assert.equal(fs.existsSync('src/assets/avatar/toy-avatar-v2-active.glb'), false);
assert.equal(fs.existsSync('src/assets/avatar/experimental/toy-avatar-v2-active.glb'), true);
assert.equal(fs.existsSync('tools/generate-avatar-v2-glb.mjs'), false);
assert.equal(fs.existsSync('src/assets/avatar/models/BLENDER_MODEL_SPEC.md'), true);

const beaverGlb = fs.readFileSync('src/assets/avatar/models/cozy-beaver.glb');
assert.equal(beaverGlb.toString('utf8', 0, 4), 'glTF');
const beaverJsonLength = beaverGlb.readUInt32LE(12);
const beaverJson = JSON.parse(beaverGlb.subarray(20, 20 + beaverJsonLength).toString().replace(/\0+$/, ''));
assert.equal(beaverJson.meshes.length, 1);
assert.equal(beaverJson.skins?.length || 0, 0);
assert.equal(beaverJson.animations?.length || 0, 0);
assert.equal(beaverJson.accessors[beaverJson.meshes[0].primitives[0].attributes.POSITION].count, 212602);

const parseGlbJson = (path: string) => {
    const glb = fs.readFileSync(path);
    assert.equal(glb.toString('utf8', 0, 4), 'glTF');
    const length = glb.readUInt32LE(12);
    return JSON.parse(glb.subarray(20, 20 + length).toString().replace(/\0+$/, ''));
};
const motionGlbs = [
    ['idle', 'src/assets/avatar/models/chungnyeong-idle.glb'],
    ['walk', 'src/assets/avatar/models/chungnyeong-walk.glb'],
    ['run', 'src/assets/avatar/models/chungnyeong-run.glb']
] as const;
motionGlbs.forEach(([motion, path]) => {
    const json = parseGlbJson(path);
    assert.equal(json.skins.length, 1, `${motion} skin`);
    assert.equal(json.skins[0].joints.length, 41, `${motion} bones`);
    assert.equal(json.animations?.length || 0, 1, `${motion} animation count`);
    assert.equal(json.animations[0].name, 'NlaTrack', `${motion} clip name`);
    assert.equal(json.accessors[json.meshes[0].primitives[0].attributes.POSITION].count, 18256, `${motion} vertices`);
});

const bad = new THREE.Group();
const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1, 0.4), new THREE.MeshStandardMaterial({ name: 'TopMaterial' }));
torso.name = 'Body_Torso'; bad.add(torso);
const strictReport = validateAvatarModel(bad, [], 'strict');
assert.equal(strictReport.valid, false);
assert(strictReport.errors.some((error) => error.includes('상자형 몸통')));

const disposed = new Map<string, { geometry: number; material: number; texture: number }>();
const fakeLoader = {
    async loadAsync(url: string) {
        const stats = { geometry: 0, material: 0, texture: 0 };
        disposed.set(url, stats);
        const texture = new THREE.Texture();
        texture.dispose = () => { stats.texture += 1; };
        const material = new THREE.MeshStandardMaterial({ map: texture });
        material.dispose = () => { stats.material += 1; };
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        geometry.dispose = () => { stats.geometry += 1; };
        const scene = new THREE.Group();
        scene.add(new THREE.Mesh(geometry, material));
        return { scene, animations: [new THREE.AnimationClip('Idle', 1, []), new THREE.AnimationClip('Walk', 1, [])] } as any;
    }
};
const parent = new THREE.Scene();
const manager = new CharacterManager(parent, fakeLoader);
const first = await manager.loadCharacter('/models/beaver.glb', {
    scale: 2, position: [1, 2, 3], rotation: [0, 1, 0], frontRotationY: Math.PI, alignToGround: false
});
assert(first);
assert.equal(manager.characterRoot.name, 'CharacterRoot');
assert.equal(manager.directionRoot.name, 'DirectionRoot');
assert.equal(manager.poseRoot.name, 'PoseRoot');
assert.equal(manager.modelRoot.name, 'ModelRoot');
assert.equal(manager.characterRoot.children[0], manager.directionRoot);
assert.equal(manager.directionRoot.children[0], manager.poseRoot);
assert.equal(manager.poseRoot.children[0], manager.modelRoot);
assert.equal(manager.modelRoot.children[0], manager.currentCharacter);
assert.equal(manager.currentCharacter?.name, 'CurrentCharacter');
assert.equal(manager.currentCharacter?.position.y, 2);
assert.equal(manager.characterRoot.scale.x, 2);
assert.equal(manager.currentCharacter?.scale.x, 1);
assert.equal(manager.currentCharacter?.rotation.y, 1);
const expectedFrontQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
assert(manager.modelRoot.quaternion.angleTo(expectedFrontQuaternion) < 0.000001);
assert.equal(manager.currentAnimation, 'idle');
assert.deepEqual(manager.animationNames, ['Idle', 'Walk']);
assert.equal(first.diagnostics.rigState, 'animated');
assert.equal(first.diagnostics.hasSkinnedMesh, false);
assert.equal(first.diagnostics.boneCount, 0);
assert.equal((manager.currentCharacter?.userData.characterMetadata as any).frontRotationY, Math.PI);
assert.equal((manager.currentCharacter?.children[0] as THREE.Mesh).castShadow, true);
assert.equal((manager.currentCharacter?.children[0] as THREE.Mesh).receiveShadow, true);
assert.equal(manager.playAnimation(' W a l k '), true);
assert.equal(manager.playAnimation(1), true);
assert.equal(manager.playAnimation('Jump'), false);
await manager.loadCharacter('/models/rabbit.glb');
assert.equal(manager.currentCharacter?.position.y, 0.5);
assert.deepEqual(disposed.get('/models/beaver.glb'), { geometry: 1, material: 1, texture: 1 });
manager.removeCharacter();
assert.equal(manager.state, 'empty');
assert.deepEqual(disposed.get('/models/rabbit.glb'), { geometry: 1, material: 1, texture: 1 });
manager.dispose();
assert.equal(manager.state, 'disposed');
assert.equal(parent.getObjectByName('CharacterRoot'), undefined);

const rootMotionManager = new CharacterManager(new THREE.Scene(), {
    async loadAsync() {
        const scene = new THREE.Group();
        const root = new THREE.Group();
        root.name = 'Root';
        scene.add(root);
        return {
            scene,
            animations: [new THREE.AnimationClip('Walk', 1, [
                new THREE.VectorKeyframeTrack('Root.position', [0, 1], [0, 0, 0, 1, 0, 0]),
                new THREE.QuaternionKeyframeTrack('Root.quaternion', [0, 1], [0, 0, 0, 1, 0, 0, 0, 1])
            ])]
        } as any;
    }
});
const rootMotionResult = await rootMotionManager.loadCharacter('/models/root-motion.glb', { removeRootMotion: true });
assert(rootMotionResult);
assert.deepEqual(rootMotionResult.diagnostics.removedRootMotionTracks, ['Walk:Root.position']);
assert.deepEqual(rootMotionResult.diagnostics.rootMotionTracks, [
    'Walk:Root.position',
    'Walk:Root.quaternion'
]);
rootMotionManager.setDirectionYaw(Math.PI / 4);
rootMotionManager.setPosePitch(THREE.MathUtils.degToRad(12));
assert(Math.abs(rootMotionManager.directionRoot.rotation.y - Math.PI / 4) < 0.000001);
assert(Math.abs(rootMotionManager.poseRoot.rotation.x - THREE.MathUtils.degToRad(12)) < 0.000001);
assert.equal(rootMotionManager.poseRoot.rotation.y, 0);
assert.equal(rootMotionManager.modelRoot.rotation.y, 0);
assert.equal(rootMotionManager.currentCharacter?.rotation.y, 0);

const mixerBeforeFrontCalibration = rootMotionManager.mixer;
const clipBeforeFrontCalibration = rootMotionManager.currentAnimation;
const directionBeforeFrontCalibration = rootMotionManager.directionRoot.quaternion.clone();
const poseBeforeFrontCalibration = rootMotionManager.poseRoot.quaternion.clone();
rootMotionManager.setFrontRotationY(Math.PI);
const calibratedFront = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
assert(rootMotionManager.modelRoot.quaternion.angleTo(calibratedFront) < 0.000001);
assert(rootMotionManager.directionRoot.quaternion.angleTo(directionBeforeFrontCalibration) < 0.000001);
assert(rootMotionManager.poseRoot.quaternion.angleTo(poseBeforeFrontCalibration) < 0.000001);
assert.equal(rootMotionManager.mixer, mixerBeforeFrontCalibration);
assert.equal(rootMotionManager.currentAnimation, clipBeforeFrontCalibration);
assert.equal((rootMotionManager.currentCharacter?.userData.characterMetadata as any).frontRotationY, Math.PI);
rootMotionManager.dispose();

const externalAnimationLoads: string[] = [];
const firstClipManager = new CharacterManager(new THREE.Scene(), {
    async loadAsync(url: string) {
        externalAnimationLoads.push(url);
        const duration = url.includes('walk') ? 2.375 : url.includes('run') ? 1.2916666 : 6;
        return {
            scene: new THREE.Group(),
            animations: [new THREE.AnimationClip('NlaTrack', duration, [])]
        } as any;
    }
});
await firstClipManager.loadCharacter('/models/idle.glb', {
    defaultAnimation: 'Idle',
    autoPlay: false,
    animationAliases: { Idle: 0, Walk: 'Walk', Run: 'Run' },
    animationSources: {
        Walk: { path: '/models/walk.glb' },
        Run: { path: '/models/run.glb' }
    }
});
assert.deepEqual(externalAnimationLoads, ['/models/idle.glb', '/models/walk.glb', '/models/run.glb']);
assert.deepEqual(firstClipManager.animationNames, ['NlaTrack', 'Walk', 'Run']);
assert.equal(firstClipManager.currentAnimation, 'nlatrack');
assert.equal(firstClipManager.isAnimationPaused, true);
assert.equal(firstClipManager.playAnimation('Walk'), true);
assert.equal(firstClipManager.currentAnimation, 'walk');
assert.equal(firstClipManager.isAnimationPaused, false);
assert.equal(firstClipManager.playAnimation('Run'), true);
assert.equal(firstClipManager.currentAnimation, 'run');
firstClipManager.dispose();

const movement = new CharacterMovementController({ x: 50, y: 58 });
const animationState = new CharacterAnimationStateMachine();
assert.equal(RUN_HOLD_DELAY_MS, 700);
assert.equal(WALK_SPEED, 8.5);
assert.equal(RUN_SPEED, WALK_SPEED * 1.7);
movement.setKey('KeyD', true);
movement.setKey('KeyD', true); // keydown repeat must not reset the hold duration
movement.step(1000);
assert.equal(movement.motionState, 'walk');
for (let index = 1; index <= 13; index += 1) movement.step(1000 + index * 50);
assert.equal(movement.motionState, 'walk');
movement.step(1700);
assert.equal(movement.motionState, 'run');
assert.equal(animationState.update(1700, movement.animationSpeed, movement.hasDirectionalInput, movement.motionState), 'run');
movement.setKey('ArrowRight', true);
movement.setKey('KeyD', false);
assert.equal(movement.hasDirectionalInput, true);
movement.setKey('ArrowRight', false);
movement.step(1750);
assert.equal(animationState.update(1750, movement.animationSpeed, movement.hasDirectionalInput, movement.motionState), 'idle');
movement.setKey('ArrowUp', true);
movement.step(1800);
assert(Math.abs(movement.targetRotation - Math.PI) < 0.0001);
movement.setKey('ArrowUp', false);
movement.step(1850);
assert.equal(movement.targetRotation, 0);
assert.equal(movement.facing, 'front');

const skeletalRendererSource = fs.readFileSync('src/app/page.home/skeletal-avatar-renderer.ts', 'utf8');
['F1', 'F2', 'F3', 'F4'].forEach((key) => assert(skeletalRendererSource.includes(`${key}:`)));
assert(skeletalRendererSource.includes('frontRotationY :'));
assert(skeletalRendererSource.includes('DirectionYaw  :'));
assert(skeletalRendererSource.includes('Pitch         :'));
assert(skeletalRendererSource.includes('if (!this.isAvatarDebugContext()) return false;'));
assert(skeletalRendererSource.includes('if (!this.isAvatarDebugContext()) return;'));

console.log('avatar animation aliases, held-key locomotion, customization fallback, and CharacterManager tests passed');
