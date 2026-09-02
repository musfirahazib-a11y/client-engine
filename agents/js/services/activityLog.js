/* ===========================================================
   MusfirahLoom — AI Agent Platform
   services/activityLog.js

   Structured, per-session record of what happened in a demo:
   turns, tool/repo calls, and success events. Separate from
   analytics (which is aggregate product metrics).

   Sinks in Phase 1: in-memory ring buffer + localStorage.
   Phase 2 can add a batched sendBeacon to /api/v1/log.
=========================================================== */
import { getSessionId } from './analyticsService.js';

const KEY = 'ml.agents.activity';
const MAX = 250;

let buffer = [];

/* hydrate from a previous session so "export" still works after reload */
try {
  const raw = localStorage.getItem(KEY);
  if (raw) buffer = JSON.parse(raw) || [];
} catch {
  buffer = [];
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(buffer.slice(-MAX)));
  } catch {
    /* private mode / quota — the in-memory buffer still works */
  }
}

/**
 * log({ type, agentId, ... })
 *   type: 'turn' | 'tool' | 'success' | 'reset' | 'error' | 'session'
 */
export function log(entry = {}) {
  const record = {
    ts: Date.now(),
    sessionId: getSessionId(),
    ...entry,
  };
  buffer.push(record);
  if (buffer.length > MAX) buffer = buffer.slice(-MAX);
  persist();
  return record;
}

export function logTurn({ agentId, intent, userText, replyText, transport }) {
  return log({
    type: 'turn',
    agentId,
    intent: intent || null,
    transport: transport || null,
    user: redact(userText),
    reply: truncate(replyText, 240),
  });
}

export function logSuccess({ agentId, event, props }) {
  return log({ type: 'success', agentId, event, props: props || {} });
}

export function getAll() {
  return buffer.slice();
}

export function getForSession() {
  const sid = getSessionId();
  return buffer.filter((e) => e.sessionId === sid);
}

export function clearSession() {
  const sid = getSessionId();
  buffer = buffer.filter((e) => e.sessionId !== sid);
  persist();
  return log({ type: 'reset', note: 'session activity cleared' });
}

export function exportJSON() {
  return JSON.stringify(buffer, null, 2);
}

/* ---------- helpers ---------- */
function truncate(str, n) {
  const s = String(str || '');
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

/* lightweight redaction for anything that leaves the tab later */
function redact(str) {
  return truncate(
    String(str || '')
      .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[email]')
      .replace(/\+?\d[\d\s().-]{7,}\d/g, '[phone]'),
    240,
  );
}
