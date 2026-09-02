/* ===========================================================
   MusfirahLoom — AI Agent Platform
   services/analyticsService.js

   Thin event tracker with a pluggable sink. Phase 1 uses the
   'console' sink. Phase 2 can add 'plausible' / 'ga4' without
   touching any call site.

   Event shape: { ts, sessionId, mode, agentId, name, props }
   Never put PII in props.
=========================================================== */
import { RUNTIME } from '../config/runtime.config.js';

function randomId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }
}

const SESSION_ID = randomId();
let currentAgentId = null;

const sinks = {
  noop() {},
  console(ev) {
    // eslint-disable-next-line no-console
    console.info(`%c[analytics]%c ${ev.name}`, 'color:#6E2C3B;font-weight:600', 'color:inherit', ev.props || {});
  },
  // plausible / ga4 -> Phase 2
};

export function setAnalyticsAgent(agentId) {
  currentAgentId = agentId || null;
}

export function getSessionId() {
  return SESSION_ID;
}

export function track(name, props = {}) {
  const ev = {
    ts: Date.now(),
    sessionId: SESSION_ID,
    mode: RUNTIME.MODE,
    agentId: currentAgentId,
    name,
    props,
  };
  const sink = sinks[RUNTIME.ANALYTICS?.sink] || sinks.noop;
  try {
    sink(ev);
  } catch (err) {
    console.error('[analytics] sink threw', err);
  }
  return ev;
}
