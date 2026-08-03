export interface RemoteAvatarSnapshot {
    x: number;
    y: number;
    timestamp: number;
}

export interface InterpolatedAvatarPosition {
    x: number;
    y: number;
}

export class RemoteAvatarInterpolator {
    private readonly snapshots: RemoteAvatarSnapshot[] = [];
    private readonly interpolationDelayMs: number;
    private readonly teleportDistance: number;

    constructor(interpolationDelayMs = 110, teleportDistance = 34) {
        this.interpolationDelayMs = interpolationDelayMs;
        this.teleportDistance = teleportDistance;
    }

    public push(snapshot: RemoteAvatarSnapshot) {
        const latest = this.snapshots[this.snapshots.length - 1];
        if (latest && Math.hypot(snapshot.x - latest.x, snapshot.y - latest.y) > this.teleportDistance) {
            this.snapshots.length = 0;
        }
        this.snapshots.push(snapshot);
        if (this.snapshots.length > 12) this.snapshots.shift();
    }

    public sample(now: number, output: InterpolatedAvatarPosition): boolean {
        if (!this.snapshots.length) return false;
        const renderTime = now - this.interpolationDelayMs;

        while (this.snapshots.length > 2 && this.snapshots[1].timestamp <= renderTime) {
            this.snapshots.shift();
        }

        const from = this.snapshots[0];
        const to = this.snapshots[1] || from;
        const duration = Math.max(1, to.timestamp - from.timestamp);
        const progress = Math.max(0, Math.min(1, (renderTime - from.timestamp) / duration));
        output.x = from.x + (to.x - from.x) * progress;
        output.y = from.y + (to.y - from.y) * progress;
        return true;
    }

    public clear() {
        this.snapshots.length = 0;
    }
}
