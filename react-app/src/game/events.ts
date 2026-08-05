type Listener = {
  callback: (...args: any[]) => void;
  context?: unknown;
  once: boolean;
};

class GameEventBus {
  private listeners = new Map<string, Listener[]>();

  on(event: string, callback: (...args: any[]) => void, context?: unknown) {
    const listeners = this.listeners.get(event) ?? [];
    listeners.push({ callback, context, once: false });
    this.listeners.set(event, listeners);
    return this;
  }

  once(event: string, callback: (...args: any[]) => void, context?: unknown) {
    const listeners = this.listeners.get(event) ?? [];
    listeners.push({ callback, context, once: true });
    this.listeners.set(event, listeners);
    return this;
  }

  off(event: string, callback?: (...args: any[]) => void, context?: unknown) {
    if (!callback) {
      this.listeners.delete(event);
      return this;
    }
    const remaining = (this.listeners.get(event) ?? []).filter(
      (listener) =>
        listener.callback !== callback ||
        (context !== undefined && listener.context !== context),
    );
    if (remaining.length) this.listeners.set(event, remaining);
    else this.listeners.delete(event);
    return this;
  }

  emit(event: string, ...args: any[]) {
    const listeners = [...(this.listeners.get(event) ?? [])];
    for (const listener of listeners) {
      listener.callback.apply(listener.context, args);
      if (listener.once) this.off(event, listener.callback, listener.context);
    }
    return listeners.length > 0;
  }

  removeAllListeners(event?: string) {
    if (event) this.listeners.delete(event);
    else this.listeners.clear();
    return this;
  }
}

// Keep UI/service events independent from Phaser. The game engine is now
// downloaded only when the deferred game page is opened.
export const gameEvents = new GameEventBus();
