import type { CharacterMotionState } from './character-animation-state';

export type CharacterFacing = 'front' | 'back' | 'left' | 'right';

export const RUN_HOLD_DELAY_MS = 700;
export const WALK_SPEED = 8.5;
export const RUN_SPEED = WALK_SPEED * 1.7;

export interface CharacterMovementOptions {
    x: number;
    y: number;
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
}

export class CharacterMovementController {
    public currentX: number;
    public currentY: number;
    public targetX: number;
    public targetY: number;
    public rotation = 0;
    public targetRotation = 0;
    public speed = 0;
    public isMoving = false;
    public facing: CharacterFacing = 'front';

    private readonly pressedKeys = new Set<string>();
    private heldSeconds = 0;
    private lastFrameAt = 0;

    private readonly minX: number;
    private readonly maxX: number;
    private readonly minY: number;
    private readonly maxY: number;
    private readonly teleportDistance = 34;

    constructor(options: CharacterMovementOptions) {
        this.currentX = options.x;
        this.currentY = options.y;
        this.targetX = options.x;
        this.targetY = options.y;
        this.minX = options.minX ?? 8;
        this.maxX = options.maxX ?? 92;
        this.minY = options.minY ?? 15;
        this.maxY = options.maxY ?? 82;
    }

    public setKey(key: string, pressed: boolean): boolean {
        const normalized = key.trim().toLowerCase();
        if (!this.isMovementKey(normalized)) return false;
        if (pressed) this.pressedKeys.add(normalized);
        else this.pressedKeys.delete(normalized);
        return true;
    }

    public get hasDirectionalInput(): boolean {
        return this.horizontalDirection !== 0 || this.verticalDirection !== 0;
    }

    public get motionState(): CharacterMotionState {
        if (!this.hasDirectionalInput) return 'idle';
        return this.heldSeconds * 1000 >= RUN_HOLD_DELAY_MS ? 'run' : 'walk';
    }

    public get animationSpeed(): number {
        if (this.motionState === 'idle') return 0;
        return this.motionState === 'run' ? RUN_SPEED : WALK_SPEED;
    }

    public releaseKeys() {
        this.pressedKeys.clear();
        this.heldSeconds = 0;
    }

    public setExternalTarget(x: number, y: number) {
        const dx = x - this.currentX;
        const dy = y - this.currentY;
        if (Math.hypot(dx, dy) > this.teleportDistance) {
            this.currentX = x;
            this.currentY = y;
        }
        this.targetX = this.clamp(x, this.minX, this.maxX);
        this.targetY = this.clamp(y, this.minY, this.maxY);
    }

    public reset(x: number, y: number) {
        this.currentX = x;
        this.currentY = y;
        this.targetX = x;
        this.targetY = y;
        this.rotation = 0;
        this.targetRotation = 0;
        this.speed = 0;
        this.isMoving = false;
        this.facing = 'front';
        this.heldSeconds = 0;
        this.lastFrameAt = 0;
        this.pressedKeys.clear();
    }

    public step(now: number): boolean {
        if (!this.lastFrameAt) {
            this.lastFrameAt = now;
            return false;
        }

        const deltaTime = Math.min((now - this.lastFrameAt) / 1000, 0.05);
        this.lastFrameAt = now;

        let directionX = this.horizontalDirection;
        let directionY = this.verticalDirection;
        const hasInput = directionX !== 0 || directionY !== 0;

        if (hasInput) {
            const length = Math.hypot(directionX, directionY);
            directionX /= length;
            directionY /= length;
            this.heldSeconds += deltaTime;
            this.targetRotation = Math.atan2(directionX, directionY);
            this.facing = this.resolveFacing(directionX, directionY);
        } else {
            this.heldSeconds = 0;
            this.targetRotation = 0;
            this.facing = 'front';
        }

        this.speed = this.animationSpeed;
        this.isMoving = hasInput;

        if (hasInput) {
            this.targetX = this.clamp(
                this.targetX + directionX * this.speed * deltaTime,
                this.minX,
                this.maxX
            );
            this.targetY = this.clamp(
                this.targetY + directionY * this.speed * deltaTime,
                this.minY,
                this.maxY
            );
        }

        const positionDamping = 1 - Math.exp(-17 * deltaTime);
        this.currentX += (this.targetX - this.currentX) * positionDamping;
        this.currentY += (this.targetY - this.currentY) * positionDamping;

        const rotationDamping = 1 - Math.exp(-9 * deltaTime);
        this.rotation = this.lerpAngle(this.rotation, this.targetRotation, rotationDamping);
        return true;
    }

    private resolveFacing(x: number, y: number): CharacterFacing {
        if (Math.abs(x) > Math.abs(y)) return x < 0 ? 'left' : 'right';
        return y < 0 ? 'back' : 'front';
    }

    private get horizontalDirection(): number {
        const left = this.pressedKeys.has('arrowleft') || this.pressedKeys.has('a') || this.pressedKeys.has('keya');
        const right = this.pressedKeys.has('arrowright') || this.pressedKeys.has('d') || this.pressedKeys.has('keyd');
        return (right ? 1 : 0) - (left ? 1 : 0);
    }

    private get verticalDirection(): number {
        const up = this.pressedKeys.has('arrowup') || this.pressedKeys.has('w') || this.pressedKeys.has('keyw');
        const down = this.pressedKeys.has('arrowdown') || this.pressedKeys.has('s') || this.pressedKeys.has('keys');
        return (down ? 1 : 0) - (up ? 1 : 0);
    }

    private isMovementKey(key: string): boolean {
        return key === 'arrowleft' || key === 'arrowright' || key === 'arrowup' || key === 'arrowdown'
            || key === 'a' || key === 'd' || key === 'w' || key === 's'
            || key === 'keya' || key === 'keyd' || key === 'keyw' || key === 'keys';
    }

    private lerpAngle(current: number, target: number, amount: number): number {
        const shortest = Math.atan2(Math.sin(target - current), Math.cos(target - current));
        return current + shortest * amount;
    }

    private clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }
}
