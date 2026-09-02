/* ===========================================================
   MusfirahLoom — AI Agent Platform
   core/events.js  ·  minimal pub/sub

   Framework-free. Used by the store and by components that need
   to talk without importing each other.
=========================================================== */

export function createEmitter() {
  const listeners = new Map(); // type -> Set<fn>

  return {
    on(type, fn) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(fn);
      return () => this.off(type, fn);
    },
    off(type, fn) {
      const set = listeners.get(type);
      if (set) set.delete(fn);
    },
    once(type, fn) {
      const off = this.on(type, (payload) => {
        off();
        fn(payload);
      });
      return off;
    },
    emit(type, payload) {
      const set = listeners.get(type);
      if (!set) return;
      [...set].forEach((fn) => {
        try {
          fn(payload);
        } catch (err) {
          console.error(`[events] listener for "${type}" threw`, err);
        }
      });
    },
  };
}

/* A shared app-wide bus for cross-component signals
   (e.g. 'cart:change'). */
export const bus = createEmitter();
