import * as THREE from 'three';
import { CharacterAction, CharacterAnimationState } from './character-animation-state';
import { AvatarCustomization } from './avatar-customization.model';
import { applyAvatarCustomization } from './avatar-customizer';
import {
    AvatarBaseModelAsset,
    AvatarMovementDirection,
    getAvatarBaseModel,
    getAvatarFallbackModel
} from './avatar-assets.config';
import { CharacterManager } from './character-manager';
import { RUN_SPEED, WALK_SPEED } from './character-movement';
import { validateAvatarModel } from './avatar-model-validator';

const MAP_AVATAR_SCALE = 39;

export class SkeletalAvatarRenderer {
    private readonly renderer: THREE.WebGLRenderer;
    private readonly scene = new THREE.Scene();
    private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    private readonly characterManager = new CharacterManager(this.scene);
    private readonly avatarRoot = this.characterManager.characterRoot;
    private readonly directionRoot = this.characterManager.directionRoot;
    private readonly poseRoot = this.characterManager.poseRoot;
    private readonly shadow: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>;
    private readonly directionFromQuaternion = new THREE.Quaternion();
    private readonly directionTargetQuaternion = new THREE.Quaternion();
    private readonly upAxis = new THREE.Vector3(0, 1, 0);
    private resizeObserver: ResizeObserver | null = null;
    private model: THREE.Group | null = null;
    private lastFrameAt = 0;
    private width = 1;
    private height = 1;
    private customizationSignature = '';
    private activeClipName = '';
    private activeMapScale = 1;
    private activeAsset: AvatarBaseModelAsset | null = null;
    private posePitch = 0;
    private posePitchFrom = 0;
    private posePitchTarget = 0;
    private poseTransitionElapsed = 0.2;
    private directionYawTarget = 0;
    private directionTransitionElapsed = 0.16;
    private inputDirection: AvatarMovementDirection | 'idle' = 'idle';
    private lastHorizontalDirection: -1 | 0 | 1 = 0;
    private debugPitchOffsetDeg = 0;
    private debugEnabled = false;
    private debugOverlay: HTMLDivElement | null = null;
    private activeFrontRotationY = 0;
    private currentMotionState: CharacterAnimationState = 'idle';
    private lastDebugSignature = '';
    private disposed = false;

    private readonly directionTransitionDuration = 0.16;
    private readonly poseTransitionDuration = 0.2;

    constructor(private readonly canvas: HTMLCanvasElement) {
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio || 1, 1.5), 2));
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.shadowMap.enabled = false;

        this.camera.position.set(0, 0, 10);
        this.camera.lookAt(0, 0, 0);
        this.scene.add(this.camera);

        const hemisphere = new THREE.HemisphereLight(0xfffbef, 0x759581, 2.15);
        const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
        keyLight.position.set(-4, 7, 8);
        const fillLight = new THREE.AmbientLight(0xbfd7cc, 0.65);
        this.scene.add(hemisphere, keyLight, fillLight);

        this.shadow = new THREE.Mesh(
            new THREE.CircleGeometry(1, 24),
            new THREE.MeshBasicMaterial({
                color: 0x173e32,
                transparent: true,
                opacity: 0.2,
                depthWrite: false
            })
        );
        this.shadow.name = 'AvatarBlobShadow';
        this.shadow.position.z = -0.5;
        this.shadow.scale.set(18, 5.2, 1);
        this.scene.add(this.shadow);

        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(canvas);
        this.debugEnabled = this.isDebugModeEnabled();
        this.syncDebugOverlay();
        window.addEventListener('keydown', this.onDebugKeyDown);
        this.resize();
    }

    public async load(customization: AvatarCustomization) {
        this.model = null;
        const asset = getAvatarBaseModel(customization.baseModelId);
        await this.loadAssetWithFallback(asset);
        if (this.disposed || !this.characterManager.currentCharacter) return;
        this.model = this.characterManager.currentCharacter;
        this.customizationSignature = '';
        this.activeClipName = this.characterManager.hasAnimation('idle') ? 'idle' : '';
        this.activeFrontRotationY = this.activeAsset?.frontRotationY ?? 0;
        this.enhanceTextureSampling(this.model);

        this.applyCustomization(customization);
    }

    public render(
        now: number,
        xPercent: number,
        yPercent: number,
        targetRotation: number,
        state: CharacterAnimationState,
        emote: CharacterAction | null,
        speed: number
    ) {
        if (this.disposed || !this.model) return;
        this.currentMotionState = state;
        if (!this.lastFrameAt) this.lastFrameAt = now;
        const deltaTime = Math.min((now - this.lastFrameAt) / 1000, 0.05);
        this.lastFrameAt = now;

        const x = xPercent / 100 * this.width - this.width / 2;
        const y = this.height / 2 - yPercent / 100 * this.height;
        this.avatarRoot.position.set(x, y, 0.2);
        this.shadow.position.set(x, y + 1, -0.45);

        const direction = this.resolveDirectionYaw(targetRotation, speed > 0);
        this.inputDirection = direction.input;
        this.updateDirectionYaw(direction.yaw, deltaTime);

        const clipName = this.resolveClip(state, emote);
        const baseSpeed = clipName === 'run' ? RUN_SPEED : WALK_SPEED;
        const timeScale = clipName === 'walk' || clipName === 'run'
            ? THREE.MathUtils.clamp(speed / baseSpeed, 0.72, 1.45)
            : 1;
        if (clipName !== this.activeClipName) {
            this.characterManager.playAnimation(clipName, {
                fadeDuration: 0.2,
                loop: clipName === 'idle' || clipName === 'walk' || clipName === 'run',
                timeScale
            });
            this.activeClipName = clipName;
        } else {
            this.characterManager.setAnimationTimeScale(timeScale);
        }

        this.updatePosePitch(state, deltaTime);

        const jumping = state === 'jump';
        this.shadow.material.opacity = jumping ? 0.08 : 0.2;
        const shadowScale = jumping ? 0.58 : 1;
        this.shadow.scale.set(18 * this.activeMapScale * shadowScale, 5.2 * this.activeMapScale * shadowScale, 1);

        this.characterManager.update(deltaTime);
        this.publishDebugState(state);
        this.renderer.render(this.scene, this.camera);
    }

    public applyCustomization(customization: AvatarCustomization) {
        if (!this.model) return;
        const signature = JSON.stringify(customization);
        if (signature === this.customizationSignature) return;
        this.customizationSignature = signature;
        applyAvatarCustomization(this.model, customization);
    }

    public dispose() {
        this.disposed = true;
        this.resizeObserver?.disconnect();
        this.resizeObserver = null;
        window.removeEventListener('keydown', this.onDebugKeyDown);
        this.debugOverlay?.remove();
        this.debugOverlay = null;
        this.characterManager.dispose();
        this.model = null;
        this.shadow.geometry.dispose();
        this.shadow.material.dispose();
        this.renderer.dispose();
    }

    private resize() {
        const rect = this.canvas.getBoundingClientRect();
        const width = Math.max(1, Math.round(rect.width));
        const height = Math.max(1, Math.round(rect.height));
        if (width === this.width && height === this.height) return;
        this.width = width;
        this.height = height;
        this.renderer.setSize(width, height, false);
        this.camera.left = -width / 2;
        this.camera.right = width / 2;
        this.camera.top = height / 2;
        this.camera.bottom = -height / 2;
        this.camera.updateProjectionMatrix();
    }

    private resolveClip(state: CharacterAnimationState, emote: CharacterAction | null): string {
        if (state === 'emote') {
            if (emote === 'joy') return 'happy';
            if (emote === 'surprise') return 'surprised';
            if (emote === 'heart') return 'heart';
        }
        return state;
    }

    private async loadAssetWithFallback(asset: AvatarBaseModelAsset): Promise<void> {
        const load = (target: AvatarBaseModelAsset) => {
            const mapScale = MAP_AVATAR_SCALE * target.mapScale;
            return this.characterManager.loadCharacter(target.path, {
                scale: [mapScale * target.scale[0], mapScale * target.scale[1], mapScale * target.scale[2]],
                position: [MAP_AVATAR_SCALE * target.position[0], MAP_AVATAR_SCALE * target.position[1], MAP_AVATAR_SCALE * target.position[2]],
                rotation: target.rotation,
                frontRotationY: target.frontRotationY,
                removeRootMotion: target.removeRootMotion,
                alignToGround: true,
                defaultAnimation: 'Idle',
                animationAliases: target.animationMap,
                animationSources: target.animationSources,
                validate: (scene, clips) => {
                    const report = validateAvatarModel(scene, clips, target.validationMode);
                    if (!report.valid) throw new Error(`Avatar validation failed: ${report.errors.join('; ')}`);
                }
            });
        };
        try {
            await load(asset);
            this.activeMapScale = asset.mapScale;
            this.activeAsset = asset;
        } catch (error) {
            const fallback = getAvatarFallbackModel();
            if (asset.path === fallback.path) throw error;
            await load(fallback);
            this.activeMapScale = fallback.mapScale;
            this.activeAsset = fallback;
        }
    }

    private resolveDirectionYaw(
        rawYaw: number,
        isMoving: boolean
    ): { input: AvatarMovementDirection | 'idle'; yaw: number } {
        if (!isMoving) return { input: 'idle', yaw: 0 };

        const horizontal = Math.sin(rawYaw);
        const vertical = Math.cos(rawYaw);
        const hasRight = horizontal > 0.35;
        const hasLeft = horizontal < -0.35;
        const hasDown = vertical > 0.35;
        const hasUp = vertical < -0.35;

        if (hasRight) this.lastHorizontalDirection = 1;
        else if (hasLeft) this.lastHorizontalDirection = -1;

        let input: AvatarMovementDirection;
        if (hasUp) input = hasRight ? 'upRight' : hasLeft ? 'upLeft' : 'up';
        else if (hasDown) input = hasRight ? 'downRight' : hasLeft ? 'downLeft' : 'down';
        else input = hasRight ? 'right' : 'left';

        const asset = this.activeAsset;
        if (asset?.directionMode !== 'cameraFriendly' || !asset.directionYawDeg) {
            return { input, yaw: rawYaw };
        }

        let yawDeg: number;
        if (input === 'up') {
            yawDeg = this.lastHorizontalDirection < 0
                ? asset.directionYawDeg.upLeft
                : this.lastHorizontalDirection > 0
                    ? asset.directionYawDeg.upRight
                    : asset.directionYawDeg.up;
        } else {
            yawDeg = asset.directionYawDeg[input];
        }
        return { input, yaw: THREE.MathUtils.degToRad(yawDeg) };
    }

    private updateDirectionYaw(targetYaw: number, deltaTime: number): void {
        const shortestDelta = Math.atan2(
            Math.sin(targetYaw - this.directionYawTarget),
            Math.cos(targetYaw - this.directionYawTarget)
        );
        if (Math.abs(shortestDelta) > 0.00001) {
            this.directionFromQuaternion.copy(this.directionRoot.quaternion);
            this.directionTargetQuaternion.setFromAxisAngle(this.upAxis, targetYaw);
            this.directionYawTarget = targetYaw;
            this.directionTransitionElapsed = 0;
        }

        this.directionTransitionElapsed = Math.min(
            this.directionTransitionDuration,
            this.directionTransitionElapsed + deltaTime
        );
        const progress = this.directionTransitionDuration > 0
            ? this.directionTransitionElapsed / this.directionTransitionDuration
            : 1;
        const eased = progress * progress * (3 - 2 * progress);
        this.directionRoot.quaternion.slerpQuaternions(
            this.directionFromQuaternion,
            this.directionTargetQuaternion,
            eased
        );
    }

    private updatePosePitch(state: CharacterAnimationState, deltaTime: number): void {
        const correction = this.activeAsset?.poseCorrection;
        const motion = state === 'walk' || state === 'run' ? state : 'idle';
        const basePitchDeg = !correction ? 0
            : motion === 'walk' ? correction.walkPitchDeg
            : motion === 'run' ? correction.runPitchDeg
            : correction.idlePitchDeg;
        const target = THREE.MathUtils.degToRad(basePitchDeg + this.debugPitchOffsetDeg);
        if (!Number.isFinite(this.posePitchTarget) || Math.abs(target - this.posePitchTarget) > 0.00001) {
            this.posePitchFrom = this.posePitch;
            this.posePitchTarget = target;
            this.poseTransitionElapsed = 0;
        }
        this.poseTransitionElapsed = Math.min(
            this.poseTransitionDuration,
            this.poseTransitionElapsed + deltaTime
        );
        const progress = this.poseTransitionDuration > 0
            ? this.poseTransitionElapsed / this.poseTransitionDuration
            : 1;
        const eased = progress * progress * (3 - 2 * progress);
        this.posePitch = THREE.MathUtils.lerp(this.posePitchFrom, this.posePitchTarget, eased);
        this.characterManager.setPosePitch(this.posePitch);
    }

    private isAvatarDebugContext(): boolean {
        const params = new URLSearchParams(window.location.search);
        return params.get('avatarDebug') === '1'
            || /(?:^|;\s*)season-wiz-devmode=true(?:;|$)/.test(document.cookie);
    }

    private isDebugModeEnabled(): boolean {
        if (!this.isAvatarDebugContext()) return false;
        const forcedByQuery = new URLSearchParams(window.location.search).get('avatarDebug') === '1';
        return forcedByQuery || window.localStorage.getItem('here-people-avatar-debug') !== '0';
    }

    private readonly onDebugKeyDown = (event: KeyboardEvent) => {
        if (event.altKey && event.shiftKey && event.code === 'KeyD') {
            if (!this.isAvatarDebugContext()) return;
            this.debugEnabled = !this.debugEnabled;
            window.localStorage.setItem('here-people-avatar-debug', this.debugEnabled ? '1' : '0');
            this.syncDebugOverlay();
            console.info('[AvatarDebug] toggled', { enabled: this.debugEnabled });
            return;
        }
        if (!this.debugEnabled) return;

        const calibrationAngles: Readonly<Record<string, number>> = {
            F1: 0,
            F2: Math.PI / 2,
            F3: Math.PI,
            F4: -Math.PI / 2
        };
        const calibratedYaw = calibrationAngles[event.code];
        if (calibratedYaw !== undefined) {
            event.preventDefault();
            event.stopPropagation();
            if (this.activeAsset?.id !== 'chungnyeong') {
                console.info('[AvatarDebug] front calibration ignored for non-Chungnyeong model');
                return;
            }
            this.activeFrontRotationY = calibratedYaw;
            this.characterManager.setFrontRotationY(calibratedYaw);
            this.publishDebugState(this.currentMotionState, true);
            console.info('[AvatarDebug] frontRotationY calibrated', {
                key: event.code,
                radians: calibratedYaw,
                degrees: THREE.MathUtils.radToDeg(calibratedYaw),
                animationClip: this.characterManager.currentAnimationClipName
            });
            return;
        }

        if (!event.altKey || (event.key !== '[' && event.key !== ']')) return;
        this.debugPitchOffsetDeg += event.key === ']' ? 1 : -1;
        this.debugPitchOffsetDeg = THREE.MathUtils.clamp(this.debugPitchOffsetDeg, -20, 20);
        this.posePitchTarget = Number.NaN;
        event.preventDefault();
        console.info('[AvatarDebug] pitch offset adjusted', { offsetDeg: this.debugPitchOffsetDeg });
    };

    private publishDebugState(state: CharacterAnimationState, forceLog = false): void {
        if (!this.debugEnabled) return;
        const diagnostics = this.characterManager.diagnostics;
        const snapshot = {
            inputDirection: this.inputDirection,
            motionState: state,
            targetYawDeg: THREE.MathUtils.radToDeg(this.directionYawTarget),
            directionYawDeg: THREE.MathUtils.radToDeg(this.directionRoot.rotation.y),
            targetPitchDeg: THREE.MathUtils.radToDeg(this.posePitchTarget),
            posePitchDeg: THREE.MathUtils.radToDeg(this.poseRoot.rotation.x),
            frontRotationY: this.activeFrontRotationY,
            frontRotationYDeg: THREE.MathUtils.radToDeg(this.activeFrontRotationY),
            animationClip: this.characterManager.currentAnimationClipName,
            rootMotionTracks: diagnostics?.rootMotionTracks || [],
            removedRootMotionTracks: diagnostics?.removedRootMotionTracks || [],
            debugPitchOffsetDeg: this.debugPitchOffsetDeg
        };
        (window as any).__HERE_PEOPLE_AVATAR_DEBUG__ = snapshot;
        this.updateDebugOverlay(snapshot);
        const signature = `${snapshot.inputDirection}:${snapshot.motionState}:${snapshot.animationClip}:${snapshot.frontRotationYDeg}`;
        if (forceLog || signature !== this.lastDebugSignature) {
            this.lastDebugSignature = signature;
            console.info('[AvatarDebug] state', snapshot);
        }
    }

    private syncDebugOverlay(): void {
        if (!this.debugEnabled) {
            this.debugOverlay?.remove();
            this.debugOverlay = null;
            return;
        }
        if (this.debugOverlay) return;

        const overlay = document.createElement('div');
        overlay.dataset.avatarDebugOverlay = 'true';
        overlay.setAttribute('aria-hidden', 'true');
        Object.assign(overlay.style, {
            position: 'fixed',
            top: '12px',
            left: '12px',
            zIndex: '10000',
            minWidth: '230px',
            padding: '10px 12px',
            color: '#eafff6',
            background: 'rgba(15, 44, 35, 0.9)',
            border: '1px solid rgba(164, 226, 203, 0.55)',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(10, 33, 26, 0.24)',
            font: '12px/1.55 ui-monospace, SFMono-Regular, Menlo, monospace',
            whiteSpace: 'pre',
            pointerEvents: 'none'
        });
        document.body.appendChild(overlay);
        this.debugOverlay = overlay;
        this.updateDebugOverlay({
            frontRotationYDeg: THREE.MathUtils.radToDeg(this.activeFrontRotationY),
            directionYawDeg: THREE.MathUtils.radToDeg(this.directionRoot.rotation.y),
            posePitchDeg: THREE.MathUtils.radToDeg(this.poseRoot.rotation.x),
            motionState: this.currentMotionState,
            animationClip: this.characterManager.currentAnimationClipName
        });
    }

    private updateDebugOverlay(snapshot: {
        frontRotationYDeg: number;
        directionYawDeg: number;
        posePitchDeg: number;
        motionState: CharacterAnimationState;
        animationClip: string;
    }): void {
        if (!this.debugOverlay) return;
        const format = (value: number) => {
            const rounded = Math.abs(value) < 0.05 ? 0 : Math.round(value * 10) / 10;
            return `${rounded}°`;
        };
        this.debugOverlay.textContent = [
            '충녕이 정면축 캘리브레이션',
            'F1 0°  F2 90°  F3 180°  F4 -90°',
            '',
            `frontRotationY : ${format(snapshot.frontRotationYDeg)}`,
            `DirectionYaw  : ${format(snapshot.directionYawDeg)}`,
            `Pitch         : ${format(snapshot.posePitchDeg)}`,
            `Motion        : ${snapshot.motionState}`,
            `Clip          : ${snapshot.animationClip || '-'}`
        ].join('\n');
    }

    private enhanceTextureSampling(model: THREE.Object3D): void {
        const maxAnisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
        const textures = new Set<THREE.Texture>();
        model.traverse((object) => {
            if (!(object instanceof THREE.Mesh)) return;
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach((material) => {
                Object.values(material).forEach((value) => {
                    if (value instanceof THREE.Texture) textures.add(value);
                });
            });
        });
        textures.forEach((texture) => {
            texture.anisotropy = maxAnisotropy;
            texture.magFilter = THREE.LinearFilter;
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.needsUpdate = true;
        });
    }
}
