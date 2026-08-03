import * as THREE from 'three';
import { applyAvatarCustomization } from './avatar-customizer';
import { AvatarBaseModelAsset, getAvatarBaseModel, getAvatarFallbackModel } from './avatar-assets.config';
import { AvatarCustomization } from './avatar-customization.model';
import { CharacterManager } from './character-manager';
import { validateAvatarModel } from './avatar-model-validator';

export class AvatarPreviewRenderer {
    private readonly renderer: THREE.WebGLRenderer;
    private readonly scene = new THREE.Scene();
    private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 20);
    private readonly clock = new THREE.Clock(false);
    private readonly characterManager = new CharacterManager(this.scene);
    private readonly root = this.characterManager.characterRoot;
    private readonly directionRoot = this.characterManager.directionRoot;
    private readonly shadow: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>;
    private resizeObserver: ResizeObserver | null = null;
    private frameId: number | null = null;
    private yaw = 0;
    private targetYaw = 0;
    private dragging = false;
    private pointerX = 0;
    private pointerY = 0;
    private targetCenterY = 1.06;
    private centerY = 1.06;
    private targetZoom = 1;
    private zoom = 1;
    private fittedViewHeight = 2.55;
    private modelMinY = 0;
    private modelMaxY = 2.1;
    private baseCenterY = 1.06;
    private disposed = false;
    private customizationSignature = '';
    private loadedPath = '';
    private loadVersion = 0;

    constructor(private readonly canvas: HTMLCanvasElement) {
        this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.camera.position.set(0, 1, 5);
        this.scene.add(this.camera);

        const hemisphere = new THREE.HemisphereLight(0xfffbef, 0x7c9e8c, 2.15);
        const key = new THREE.DirectionalLight(0xffffff, 2.8);
        key.position.set(-3, 6, 5);
        const fill = new THREE.DirectionalLight(0xc5e4da, 0.75);
        fill.position.set(4, 2, 3);
        this.scene.add(hemisphere, key, fill, this.root);

        this.shadow = new THREE.Mesh(
            new THREE.CircleGeometry(0.48, 28),
            new THREE.MeshBasicMaterial({ color: 0x244f40, transparent: true, opacity: 0.17, depthWrite: false })
        );
        this.shadow.rotation.x = -Math.PI / 2;
        this.shadow.position.y = 0.015;
        this.scene.add(this.shadow);

        this.canvas.addEventListener('pointerdown', this.onPointerDown);
        window.addEventListener('pointermove', this.onPointerMove);
        window.addEventListener('pointerup', this.onPointerUp);
        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(canvas);
        this.resize();
        this.start();
    }

    public async load(customization: AvatarCustomization) {
        const loadVersion = ++this.loadVersion;
        const asset = getAvatarBaseModel(customization.baseModelId);
        const path = asset.path;
        await this.loadAssetWithFallback(asset);
        if (this.disposed || loadVersion !== this.loadVersion || !this.characterManager.currentCharacter) return;
        this.loadedPath = path;
        this.applyCustomization(customization, true);
        this.fitCameraToObject();
    }

    public async ensureModel(customization: AvatarCustomization) {
        const path = getAvatarBaseModel(customization.baseModelId).path;
        if (!this.characterManager.currentCharacter || path !== this.loadedPath) {
            await this.load(customization);
            return;
        }
        this.applyCustomization(customization);
    }

    public applyCustomization(customization: AvatarCustomization, force = false) {
        const model = this.characterManager.currentCharacter;
        if (!model) return;
        const signature = JSON.stringify(customization);
        if (!force && signature === this.customizationSignature) return;
        this.customizationSignature = signature;
        applyAvatarCustomization(model, customization);
    }

    public focus(part: string) {
        const headFocus = part === 'faceId' || part === 'hairStyleId' || part === 'hairColor' || part === 'skinColor';
        const shoeFocus = part === 'shoesId';
        const height = Math.max(0.1, this.modelMaxY - this.modelMinY);
        this.targetCenterY = headFocus
            ? this.modelMaxY - height * 0.24
            : shoeFocus ? this.modelMinY + height * 0.24 : this.baseCenterY;
        this.targetZoom = headFocus ? 1.45 : shoeFocus ? 1.24 : part === 'topId' || part === 'accessoryIds' ? 1.16 : 1;
    }

    public dispose() {
        this.disposed = true;
        this.loadVersion += 1;
        this.clock.stop();
        if (this.frameId !== null) cancelAnimationFrame(this.frameId);
        this.frameId = null;
        this.resizeObserver?.disconnect();
        this.resizeObserver = null;
        this.canvas.removeEventListener('pointerdown', this.onPointerDown);
        window.removeEventListener('pointermove', this.onPointerMove);
        window.removeEventListener('pointerup', this.onPointerUp);
        this.characterManager.dispose();
        this.shadow.geometry.dispose();
        this.shadow.material.dispose();
        this.renderer.dispose();
    }

    private readonly onPointerDown = (event: PointerEvent) => {
        this.dragging = true;
        this.pointerX = event.clientX;
        this.pointerY = event.clientY;
        this.canvas.setPointerCapture?.(event.pointerId);
    };

    private readonly onPointerMove = (event: PointerEvent) => {
        if (!this.dragging) return;
        const deltaX = event.clientX - this.pointerX;
        const deltaY = event.clientY - this.pointerY;
        this.targetYaw += deltaX * 0.012;
        const verticalLimit = Math.max(0.06, (this.modelMaxY - this.modelMinY) * 0.07);
        this.targetCenterY = THREE.MathUtils.clamp(
            this.targetCenterY + deltaY * 0.0015,
            this.baseCenterY - verticalLimit,
            this.baseCenterY + verticalLimit
        );
        this.pointerX = event.clientX;
        this.pointerY = event.clientY;
    };

    private readonly onPointerUp = () => {
        this.dragging = false;
    };

    private start() {
        this.clock.start();
        const frame = (now: number) => {
            if (this.disposed) return;
            this.frameId = requestAnimationFrame(frame);
            if (document.hidden) {
                this.clock.stop();
                return;
            }
            if (!this.clock.running) this.clock.start();
            const delta = Math.min(this.clock.getDelta(), 0.05);
            const damping = 1 - Math.exp(-10 * delta);
            this.yaw = THREE.MathUtils.lerp(this.yaw, this.targetYaw, damping);
            this.centerY = THREE.MathUtils.lerp(this.centerY, this.targetCenterY, damping);
            this.zoom = THREE.MathUtils.lerp(this.zoom, this.targetZoom, damping);
            this.characterManager.setDirectionYaw(this.yaw);
            this.camera.position.y = this.centerY;
            this.camera.zoom = this.zoom;
            this.camera.lookAt(0, this.centerY, 0);
            this.camera.updateProjectionMatrix();
            this.characterManager.update(delta);
            this.renderer.render(this.scene, this.camera);
        };
        this.frameId = requestAnimationFrame(frame);
    }

    private resize() {
        const rect = this.canvas.getBoundingClientRect();
        const width = Math.max(1, Math.round(rect.width));
        const height = Math.max(1, Math.round(rect.height));
        this.renderer.setSize(width, height, false);
        const viewHeight = this.fittedViewHeight;
        const viewWidth = viewHeight * width / height;
        this.camera.left = -viewWidth / 2;
        this.camera.right = viewWidth / 2;
        this.camera.top = viewHeight / 2;
        this.camera.bottom = -viewHeight / 2;
        this.camera.updateProjectionMatrix();
    }

    private async loadAssetWithFallback(asset: AvatarBaseModelAsset): Promise<void> {
        const load = (target: AvatarBaseModelAsset) => this.characterManager.loadCharacter(target.path, {
            scale: target.scale,
            position: target.position,
            rotation: target.rotation,
            frontRotationY: target.frontRotationY,
            alignToGround: true,
            defaultAnimation: 'Idle',
            autoPlay: false,
            animationAliases: target.animationMap,
            validate: (scene, clips) => {
                const report = validateAvatarModel(scene, clips, target.validationMode);
                if (!report.valid) throw new Error(`Avatar validation failed: ${report.errors.join('; ')}`);
            }
        });
        try {
            await load(asset);
        } catch (error) {
            const fallback = getAvatarFallbackModel();
            if (asset.path === fallback.path) throw error;
            await load(fallback);
        }
    }

    private fitCameraToObject(): void {
        const character = this.characterManager.currentCharacter;
        if (!character) return;
        this.directionRoot.quaternion.identity();
        this.yaw = 0;
        this.targetYaw = 0;
        character.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(character);
        if (box.isEmpty()) return;
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        this.modelMinY = box.min.y;
        this.modelMaxY = box.max.y;
        this.baseCenterY = center.y + size.y * 0.04;
        this.centerY = this.baseCenterY;
        this.targetCenterY = this.baseCenterY;
        this.zoom = 1;
        this.targetZoom = 1;
        this.fittedViewHeight = Math.max(0.8, size.y * 1.28);
        const cameraDistance = Math.max(3, size.z * 2.5);
        this.camera.position.set(0, this.baseCenterY, cameraDistance);
        this.camera.near = 0.01;
        this.camera.far = cameraDistance + Math.max(10, size.z * 4);
        this.camera.lookAt(0, this.baseCenterY, 0);
        this.resize();
        this.camera.updateProjectionMatrix();
    }
}
