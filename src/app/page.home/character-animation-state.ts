export type CharacterMotionState = 'idle' | 'walk' | 'run';
export type CharacterLocomotionState = CharacterMotionState;
export type CharacterAction = 'wave' | 'joy' | 'surprise' | 'heart' | 'sit';
export type CharacterAnimationState =
    | CharacterLocomotionState
    | 'jump'
    | 'wave'
    | 'emote'
    | 'sit';

export interface AvatarActionEvent {
    userId: string;
    action: CharacterAction;
    createdAt: number;
}

export class CharacterAnimationStateMachine {
    public state: CharacterAnimationState = 'idle';
    public emote: CharacterAction | null = null;

    private action: CharacterAction | null = null;
    private actionUntil = 0;
    private jumpUntil = 0;
    private lastJumpAt = Number.NEGATIVE_INFINITY;

    private readonly runThreshold = 12;
    private readonly jumpDurationMs = 920;
    private readonly jumpCooldownMs = 1150;

    public startJump(now: number): boolean {
        if (now - this.lastJumpAt < this.jumpCooldownMs || now < this.jumpUntil) return false;
        this.lastJumpAt = now;
        this.jumpUntil = now + this.jumpDurationMs;
        this.action = null;
        this.actionUntil = 0;
        this.emote = null;
        return true;
    }

    public triggerAction(action: CharacterAction, now: number, durationMs = 2100): boolean {
        if (now < this.jumpUntil || now < this.actionUntil) return false;
        this.action = action;
        this.actionUntil = now + durationMs;
        this.emote = action;
        return true;
    }

    public update(
        now: number,
        speed: number,
        isMoving: boolean,
        motionState?: CharacterMotionState
    ): CharacterAnimationState {
        let next: CharacterAnimationState;

        if (now < this.jumpUntil) {
            next = 'jump';
        } else if (this.action && now < this.actionUntil) {
            if (this.action === 'wave') next = 'wave';
            else if (this.action === 'sit') next = 'sit';
            else next = 'emote';
        } else {
            this.action = null;
            this.actionUntil = 0;
            this.emote = null;
            if (motionState) next = motionState;
            else if (!isMoving || speed < 0.35) next = 'idle';
            else if (speed >= this.runThreshold) next = 'run';
            else next = 'walk';
        }

        this.state = next;
        return next;
    }

    public reset() {
        this.state = 'idle';
        this.emote = null;
        this.action = null;
        this.actionUntil = 0;
        this.jumpUntil = 0;
    }
}
