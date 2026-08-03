import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export type CharacterLifecycleState = 'empty' | 'loading' | 'ready' | 'error' | 'disposed';
export type CharacterVector3 = [number, number, number];
export type CharacterAnimationSelector = string | number;

export interface CharacterAnimationSource {
    path: string;
    clip?: CharacterAnimationSelector;
}

export interface CharacterLoadOptions {
    scale?: number | CharacterVector3;
    position?: CharacterVector3;
    rotation?: CharacterVector3;
    frontRotationY?: number;
    removeRootMotion?: boolean;
    alignToGround?: boolean;
    defaultAnimation?: string;
    autoPlay?: boolean;
    animationAliases?: Readonly<Record<string, CharacterAnimationSelector>>;
    animationSources?: Readonly<Record<string, CharacterAnimationSource>>;
    validate?: (scene: THREE.Group, animations: THREE.AnimationClip[]) => void;
}

export interface CharacterAnimationOptions {
    fadeDuration?: number;
    loop?: boolean;
    timeScale?: number;
}

export interface CharacterLoadResult {
    character: THREE.Group;
    url: string;
    animationNames: string[];
    diagnostics: CharacterRigDiagnostics;
}

export interface CharacterMeshDiagnostics {
    name: string;
    isSkinnedMesh: boolean;
}

export interface CharacterRigDiagnostics {
    animationClips: Array<{ name: string; duration: number }>;
    hasSkinnedMesh: boolean;
    skeletonCount: number;
    boneCount: number;
    meshes: CharacterMeshDiagnostics[];
    rigState: 'animated' | 'rigged-without-animation' | 'static-mesh';
    rootMotionTracks: string[];
    removedRootMotionTracks: string[];
}

export interface CharacterMetadata {
    url: string;
    frontRotationY: number;
    alignmentOffset: CharacterVector3;
    diagnostics: CharacterRigDiagnostics;
}

export interface CharacterLoader {
    loadAsync(url: string): Promise<GLTF>;
}

interface RegisteredAnimation {
    key: string;
    index: number;
    name: string;
    clip: THREE.AnimationClip;
    action: THREE.AnimationAction;
}

/**
 * GLB 캐릭터의 생명주기와 AnimationMixer를 관리하는 범용 런타임입니다.
 * 플레이어, NPC, 회원가입 미리보기가 동일한 API를 사용합니다.
 */
export class CharacterManager {
    private static readonly X_AXIS = new THREE.Vector3(1, 0, 0);
    private static readonly Y_AXIS = new THREE.Vector3(0, 1, 0);

    public readonly characterRoot = new THREE.Group();
    public readonly directionRoot = new THREE.Group();
    public readonly poseRoot = new THREE.Group();
    public readonly modelRoot = new THREE.Group();
    public onStateChange?: (state: CharacterLifecycleState, error: Error | null) => void;

    private readonly actions = new Map<string, RegisteredAnimation>();
    private readonly actionOrder: RegisteredAnimation[] = [];
    private readonly animationAliases = new Map<string, string>();
    private readonly pendingActionStops: Array<{ action: THREE.AnimationAction; remaining: number }> = [];
    private currentCharacterValue: THREE.Group | null = null;
    private mixerValue: THREE.AnimationMixer | null = null;
    private currentAction: THREE.AnimationAction | null = null;
    private currentAnimationValue = '';
    private currentUrlValue = '';
    private lifecycleStateValue: CharacterLifecycleState = 'empty';
    private errorValue: Error | null = null;
    private requestVersion = 0;
    private diagnosticsValue: CharacterRigDiagnostics | null = null;

    constructor(
        private readonly parent: THREE.Object3D,
        private readonly loader: CharacterLoader = new GLTFLoader()
    ) {
        this.characterRoot.name = 'CharacterRoot';
        this.directionRoot.name = 'DirectionRoot';
        this.poseRoot.name = 'PoseRoot';
        this.modelRoot.name = 'ModelRoot';
        this.characterRoot.add(this.directionRoot);
        this.directionRoot.add(this.poseRoot);
        this.poseRoot.add(this.modelRoot);
        this.parent.add(this.characterRoot);
    }

    public get currentCharacter(): THREE.Group | null { return this.currentCharacterValue; }
    public get mixer(): THREE.AnimationMixer | null { return this.mixerValue; }
    public get state(): CharacterLifecycleState { return this.lifecycleStateValue; }
    public get error(): Error | null { return this.errorValue; }
    public get currentUrl(): string { return this.currentUrlValue; }
    public get currentAnimation(): string { return this.currentAnimationValue; }
    public get currentAnimationClipName(): string {
        return this.actions.get(this.currentAnimationValue)?.name || '';
    }
    public get isAnimationPaused(): boolean { return this.currentAction?.paused ?? false; }
    public get animationNames(): string[] { return this.actionOrder.map((entry) => entry.name); }
    public get diagnostics(): CharacterRigDiagnostics | null { return this.diagnosticsValue; }

    public async loadCharacter(url: string, options: CharacterLoadOptions = {}): Promise<CharacterLoadResult | null> {
        if (this.lifecycleStateValue === 'disposed') throw new Error('CharacterManager has been disposed.');
        const requestId = ++this.requestVersion;
        this.clearCurrentCharacter();
        this.setState('loading');
        let pendingScene: THREE.Group | null = null;

        try {
            const gltf = await this.loader.loadAsync(url);
            pendingScene = gltf.scene;
            if (requestId !== this.requestVersion || this.lifecycleStateValue === 'disposed') {
                this.disposeObjectResources(gltf.scene);
                pendingScene = null;
                return null;
            }

            const sourcedAnimations = await this.loadAnimationSources(options.animationSources, requestId);
            if (requestId !== this.requestVersion || this.lifecycleStateValue === 'disposed') {
                this.disposeObjectResources(gltf.scene);
                pendingScene = null;
                return null;
            }
            const sourceAnimations = [...gltf.animations, ...sourcedAnimations];
            const { clips: animations, rootTracks, removedTracks } = this.prepareAnimations(
                sourceAnimations,
                options.removeRootMotion === true
            );
            options.validate?.(gltf.scene, animations);
            const character = gltf.scene;
            character.name = 'CurrentCharacter';
            const diagnostics = this.inspectRig(character, animations, rootTracks, removedTracks);
            const alignmentOffset = this.applyTransform(character, options);
            const frontRotationY = options.frontRotationY ?? 0;
            const metadata: CharacterMetadata = { url, frontRotationY, alignmentOffset, diagnostics };
            character.userData.characterMetadata = metadata;
            character.traverse((object) => {
                if (!(object instanceof THREE.Mesh)) return;
                object.castShadow = true;
                object.receiveShadow = true;
            });

            this.modelRoot.add(character);
            this.currentCharacterValue = character;
            pendingScene = null;
            this.currentUrlValue = url;
            this.diagnosticsValue = diagnostics;
            this.mixerValue = new THREE.AnimationMixer(character);
            this.registerAnimations(animations, options.animationAliases);
            this.logDiagnostics(metadata);
            this.setState('ready');

            const idle = options.defaultAnimation || 'Idle';
            const defaultPlayed = this.playAnimation(idle, { fadeDuration: 0, loop: true });
            if (!defaultPlayed && this.animationNames.length) {
                this.playAnimation(this.animationNames[0], { fadeDuration: 0, loop: true });
            }
            if (options.autoPlay === false && this.currentAction) {
                this.mixerValue?.update(0);
                this.currentAction.paused = true;
                console.info('[CharacterManager] animation frozen for static preview', {
                    name: this.actionOrder.find((entry) => entry.key === this.currentAnimationValue)?.name || idle
                });
            }
            return { character, url, animationNames: this.animationNames, diagnostics };
        } catch (value) {
            if (pendingScene) this.disposeObjectResources(pendingScene);
            const error = value instanceof Error ? value : new Error(String(value));
            if (requestId !== this.requestVersion || this.lifecycleStateValue === 'disposed') return null;
            this.clearCurrentCharacter();
            this.setState('error', error);
            throw error;
        }
    }

    public removeCharacter(): void {
        if (this.lifecycleStateValue === 'disposed') return;
        this.requestVersion += 1;
        this.clearCurrentCharacter();
        this.setState('empty');
    }

    public hasAnimation(animation: CharacterAnimationSelector): boolean {
        return !!this.resolveAction(animation);
    }

    public getPart(name: string): THREE.Object3D | null {
        return this.currentCharacterValue?.getObjectByName(name) || null;
    }

    public setPartVisible(name: string, visible: boolean): boolean {
        const part = this.getPart(name);
        if (!part) return false;
        part.visible = visible;
        return true;
    }

    public playAnimation(animation: CharacterAnimationSelector, options: CharacterAnimationOptions = {}): boolean {
        const resolved = this.resolveAction(animation);
        if (!resolved) return false;
        const { key, action } = resolved;
        action.timeScale = options.timeScale ?? 1;
        if (key === this.currentAnimationValue && action === this.currentAction && action.isRunning()) return true;

        const shouldLoop = options.loop ?? true;
        action.enabled = true;
        action.paused = false;
        action.reset();
        action.setEffectiveWeight(1);
        action.setLoop(shouldLoop ? THREE.LoopRepeat : THREE.LoopOnce, shouldLoop ? Number.POSITIVE_INFINITY : 1);
        action.clampWhenFinished = !shouldLoop;
        action.play();

        const fadeDuration = Math.max(0, options.fadeDuration ?? 0.2);
        for (let index = this.pendingActionStops.length - 1; index >= 0; index -= 1) {
            if (this.pendingActionStops[index].action === action) this.pendingActionStops.splice(index, 1);
        }
        if (this.currentAction && this.currentAction !== action && fadeDuration > 0) {
            const previousAction = this.currentAction;
            previousAction.crossFadeTo(action, fadeDuration, true);
            this.pendingActionStops.push({ action: previousAction, remaining: fadeDuration });
        }
        else if (this.currentAction && this.currentAction !== action) this.currentAction.stop();
        else if (fadeDuration > 0) action.fadeIn(fadeDuration);
        this.currentAction = action;
        this.currentAnimationValue = key;
        console.info('[CharacterManager] playing animation', {
            requested: animation,
            index: resolved.index,
            name: resolved.name,
            duration: resolved.clip.duration,
            loop: shouldLoop ? 'LoopRepeat' : 'LoopOnce'
        });
        return true;
    }

    public setAnimationTimeScale(timeScale: number): void {
        if (this.currentAction) this.currentAction.timeScale = Math.max(0, timeScale);
    }

    public update(deltaTime: number): void {
        if (this.lifecycleStateValue !== 'ready') return;
        const delta = Math.max(0, Math.min(deltaTime, 0.1));
        this.mixerValue?.update(delta);
        for (let index = this.pendingActionStops.length - 1; index >= 0; index -= 1) {
            const pending = this.pendingActionStops[index];
            pending.remaining -= delta;
            if (pending.remaining > 0) continue;
            pending.action.stop();
            this.pendingActionStops.splice(index, 1);
        }
    }

    public setDirectionYaw(yaw: number): void {
        this.directionRoot.quaternion.setFromAxisAngle(CharacterManager.Y_AXIS, yaw);
    }

    public setPosePitch(pitch: number): void {
        this.poseRoot.quaternion.setFromAxisAngle(CharacterManager.X_AXIS, pitch);
    }

    public setFrontRotationY(yaw: number): void {
        this.modelRoot.quaternion.setFromAxisAngle(CharacterManager.Y_AXIS, yaw);
        const metadata = this.currentCharacterValue?.userData.characterMetadata as CharacterMetadata | undefined;
        if (metadata) metadata.frontRotationY = yaw;
    }

    public dispose(): void {
        if (this.lifecycleStateValue === 'disposed') return;
        this.requestVersion += 1;
        this.clearCurrentCharacter();
        this.characterRoot.removeFromParent();
        this.setState('disposed');
        this.onStateChange = undefined;
    }

    private applyTransform(character: THREE.Group, options: CharacterLoadOptions): CharacterVector3 {
        const scale = options.scale ?? 1;
        if (typeof scale === 'number') this.characterRoot.scale.setScalar(scale);
        else this.characterRoot.scale.set(scale[0], scale[1], scale[2]);
        const position = options.position || [0, 0, 0];
        const rotation = options.rotation || [0, 0, 0];
        const frontRotationY = options.frontRotationY ?? 0;
        this.modelRoot.quaternion.setFromAxisAngle(CharacterManager.Y_AXIS, frontRotationY);
        character.position.set(0, 0, 0);
        character.rotation.set(rotation[0], rotation[1], rotation[2]);
        character.updateMatrixWorld(true);

        const alignmentOffset: CharacterVector3 = [0, 0, 0];
        if (options.alignToGround !== false) {
            const box = new THREE.Box3().setFromObject(character);
            if (!box.isEmpty()) {
                const center = box.getCenter(new THREE.Vector3());
                alignmentOffset[0] = -center.x;
                alignmentOffset[1] = -box.min.y;
                alignmentOffset[2] = -center.z;
            }
        }
        character.position.set(
            alignmentOffset[0] + position[0],
            alignmentOffset[1] + position[1],
            alignmentOffset[2] + position[2]
        );
        character.updateMatrixWorld(true);
        return alignmentOffset;
    }

    private registerAnimations(
        clips: THREE.AnimationClip[],
        aliases: Readonly<Record<string, CharacterAnimationSelector>> = {}
    ): void {
        this.actions.clear();
        this.actionOrder.length = 0;
        this.animationAliases.clear();
        this.pendingActionStops.length = 0;
        if (!this.mixerValue) return;
        clips.forEach((clip, index) => {
            const baseKey = this.normalizeAnimationName(clip.name) || `clip${index}`;
            let key = baseKey;
            while (this.actions.has(key)) key = `${baseKey}${index}`;
            const entry: RegisteredAnimation = {
                key,
                index,
                name: clip.name || `Clip ${index + 1}`,
                clip,
                action: this.mixerValue!.clipAction(clip)
            };
            this.actions.set(key, entry);
            this.actionOrder.push(entry);
        });
        Object.entries(aliases).forEach(([alias, target]) => {
            const targetEntry = typeof target === 'number'
                ? this.actionOrder[target]
                : this.actionOrder.find((entry) => this.normalizeAnimationName(entry.name) === this.normalizeAnimationName(target));
            const aliasKey = this.normalizeAnimationName(alias);
            if (aliasKey && targetEntry) this.animationAliases.set(aliasKey, targetEntry.key);
        });
    }

    private async loadAnimationSources(
        sources: Readonly<Record<string, CharacterAnimationSource>> | undefined,
        requestId: number
    ): Promise<THREE.AnimationClip[]> {
        if (!sources) return [];
        const clips: THREE.AnimationClip[] = [];
        for (const [alias, source] of Object.entries(sources)) {
            const gltf = await this.loader.loadAsync(source.path);
            try {
                if (requestId !== this.requestVersion || this.lifecycleStateValue === 'disposed') return clips;
                const selector = source.clip ?? 0;
                const selected = typeof selector === 'number'
                    ? gltf.animations[selector]
                    : gltf.animations.find((clip) => this.normalizeAnimationName(clip.name) === this.normalizeAnimationName(selector));
                if (!selected) throw new Error(`Animation clip '${String(selector)}' not found in ${source.path}`);
                const clip = selected.clone();
                clip.name = alias;
                clips.push(clip);
                console.info('[CharacterManager] external animation loaded', {
                    alias,
                    url: source.path,
                    sourceName: selected.name,
                    duration: selected.duration
                });
            } finally {
                this.disposeObjectResources(gltf.scene);
            }
        }
        return clips;
    }

    private resolveAction(animation: CharacterAnimationSelector): RegisteredAnimation | null {
        if (typeof animation === 'number') {
            return Number.isInteger(animation) ? this.actionOrder[animation] || null : null;
        }
        const target = this.normalizeAnimationName(animation);
        const aliasedKey = this.animationAliases.get(target);
        if (aliasedKey) return this.actions.get(aliasedKey) || null;
        const exact = this.actions.get(target);
        if (exact) return exact;
        return this.actionOrder.find((entry) => entry.key.endsWith(target)) || null;
    }

    private clearCurrentCharacter(): void {
        this.currentAction?.stop();
        this.currentAction = null;
        this.currentAnimationValue = '';
        this.mixerValue?.stopAllAction();
        if (this.currentCharacterValue && this.mixerValue) this.mixerValue.uncacheRoot(this.currentCharacterValue);
        this.mixerValue = null;
        this.actions.clear();
        this.actionOrder.length = 0;
        this.animationAliases.clear();
        if (this.currentCharacterValue) {
            this.currentCharacterValue.removeFromParent();
            this.disposeObjectResources(this.currentCharacterValue);
        }
        this.currentCharacterValue = null;
        this.currentUrlValue = '';
        this.diagnosticsValue = null;
        this.characterRoot.scale.set(1, 1, 1);
        this.directionRoot.quaternion.identity();
        this.poseRoot.quaternion.identity();
        this.modelRoot.quaternion.identity();
    }

    private prepareAnimations(
        clips: THREE.AnimationClip[],
        removeRootMotion: boolean
    ): { clips: THREE.AnimationClip[]; rootTracks: string[]; removedTracks: string[] } {
        const rootTracks: string[] = [];
        const removedTracks: string[] = [];
        const prepared = clips.map((source) => {
            const clip = source.clone();
            clip.tracks.forEach((track) => {
                if (this.isRootTransformTrack(track.name)) rootTracks.push(`${clip.name}:${track.name}`);
            });
            const clipKey = this.normalizeAnimationName(clip.name);
            if (!removeRootMotion || (clipKey !== 'walk' && clipKey !== 'run')) return clip;
            clip.tracks = clip.tracks.filter((track) => {
                if (!this.isRootPositionTrack(track.name)) return true;
                removedTracks.push(`${clip.name}:${track.name}`);
                return false;
            });
            clip.resetDuration();
            return clip;
        });
        if (removeRootMotion) {
            console.info('[CharacterManager] root motion tracks inspected', {
                inspected: rootTracks,
                removed: removedTracks
            });
        }
        return { clips: prepared, rootTracks, removedTracks };
    }

    private isRootPositionTrack(trackName: string): boolean {
        const normalized = trackName.trim().toLowerCase();
        if (!normalized.endsWith('.position')) return false;
        return this.targetsRootNode(normalized);
    }

    private isRootTransformTrack(trackName: string): boolean {
        const normalized = trackName.trim().toLowerCase();
        const isTransform = normalized.endsWith('.position')
            || normalized.endsWith('.quaternion')
            || normalized.endsWith('.rotation');
        return isTransform && this.targetsRootNode(normalized);
    }

    private targetsRootNode(normalizedTrackName: string): boolean {
        const propertyIndex = normalizedTrackName.lastIndexOf('.');
        if (propertyIndex < 0) return false;
        const targetPath = normalizedTrackName.slice(0, propertyIndex);
        const nodes = targetPath.split(/[./\[\]]+/).filter(Boolean);
        return nodes.some((node) => node === 'root' || node === 'hips' || node === 'armature'
            || node.endsWith('root') || node.endsWith('hips'));
    }

    private disposeObjectResources(root: THREE.Object3D): void {
        const geometries = new Set<THREE.BufferGeometry>();
        const materials = new Set<THREE.Material>();
        const textures = new Set<THREE.Texture>();
        const skeletons = new Set<THREE.Skeleton>();

        root.traverse((object) => {
            if (!(object instanceof THREE.Mesh)) return;
            if (object.geometry) geometries.add(object.geometry);
            const list = Array.isArray(object.material) ? object.material : [object.material];
            list.forEach((material) => {
                materials.add(material);
                Object.values(material).forEach((value) => {
                    if (value instanceof THREE.Texture) textures.add(value);
                });
            });
            if (object instanceof THREE.SkinnedMesh && object.skeleton) skeletons.add(object.skeleton);
        });

        skeletons.forEach((skeleton) => skeleton.dispose());
        geometries.forEach((geometry) => geometry.dispose());
        textures.forEach((texture) => texture.dispose());
        materials.forEach((material) => material.dispose());
    }

    private setState(state: CharacterLifecycleState, error: Error | null = null): void {
        this.lifecycleStateValue = state;
        this.errorValue = error;
        this.onStateChange?.(state, error);
    }

    private normalizeAnimationName(name: string): string {
        return name.trim().toLowerCase().replace(/[\s_-]+/g, '');
    }

    private inspectRig(
        character: THREE.Group,
        clips: THREE.AnimationClip[],
        rootMotionTracks: string[] = [],
        removedRootMotionTracks: string[] = []
    ): CharacterRigDiagnostics {
        const meshes: CharacterMeshDiagnostics[] = [];
        const skeletons = new Set<THREE.Skeleton>();
        const bones = new Set<THREE.Bone>();
        character.traverse((object) => {
            if (!(object instanceof THREE.Mesh)) return;
            const isSkinnedMesh = object instanceof THREE.SkinnedMesh;
            meshes.push({ name: object.name || '(unnamed mesh)', isSkinnedMesh });
            if (!isSkinnedMesh) return;
            skeletons.add(object.skeleton);
            object.skeleton.bones.forEach((bone) => bones.add(bone));
        });
        const hasSkinnedMesh = skeletons.size > 0;
        return {
            animationClips: clips.map((clip) => ({ name: clip.name, duration: clip.duration })),
            hasSkinnedMesh,
            skeletonCount: skeletons.size,
            boneCount: bones.size,
            meshes,
            rigState: clips.length ? 'animated' : hasSkinnedMesh ? 'rigged-without-animation' : 'static-mesh',
            rootMotionTracks: [...rootMotionTracks],
            removedRootMotionTracks: [...removedRootMotionTracks]
        };
    }

    private logDiagnostics(metadata: CharacterMetadata): void {
        const { diagnostics } = metadata;
        console.info('[CharacterManager] GLB rig diagnostics', {
            url: metadata.url,
            frontRotationY: metadata.frontRotationY,
            animationClipCount: diagnostics.animationClips.length,
            animations: diagnostics.animationClips,
            animationClipNames: diagnostics.animationClips.map((clip) => clip.name),
            hasSkinnedMesh: diagnostics.hasSkinnedMesh,
            skeletonCount: diagnostics.skeletonCount,
            boneCount: diagnostics.boneCount,
            meshes: diagnostics.meshes,
            rigState: diagnostics.rigState,
            rootMotionTracks: diagnostics.rootMotionTracks,
            removedRootMotionTracks: diagnostics.removedRootMotionTracks
        });
    }
}
