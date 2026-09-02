/* ===========================================================
   MusfirahLoom — AI Agent Platform
   core/store.js  ·  tiny observable state container
=========================================================== */
import { createEmitter } from './events.js';

/**
 * createStore({ count: 0 })
 *   store.get()                 -> current state (read-only intent)
 *   store.set({ count: 1 })     -> shallow-merge patch
 *   store.set(s => ({...}))     -> functional patch
 *   store.subscribe(fn)         -> called with (state) on every change
 */
export function createStore(initial = {}) {
  let state = { ...initial };
  const emitter = createEmitter();

  return {
    get() {
      return state;
    },
    set(patch) {
      const next = typeof patch === 'function' ? patch(state) : patch;
      state = { ...state, ...next };
      emitter.emit('change', state);
      return state;
    },
    subscribe(fn) {
      return emitter.on('change', fn);
    },
  };
}
