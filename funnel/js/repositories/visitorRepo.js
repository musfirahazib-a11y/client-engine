/* ===========================================================
   MusfirahLoom — AI Sales Funnel System
   repositories/visitorRepo.js

   Visitor + funnel-event store (localStorage). One visitor
   record per browser session; funnel events (page view, CTA
   click, scroll depth, form start, chat start) hang off it.

   Demo records carry _demo:true so the console can load/clear
   the synthetic dataset without touching real captures.
=========================================================== */
import { bus } from '../../../agents/js/core/events.js';
import { scoped } from '../services/scope.js';

/* per-campaign namespaced keys */
const KEY = () => scoped('funnel.visitors');
const EVT_KEY = () => scoped('funnel.events');

function read(key) {
  try {
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function write(key, list) {
  try { localStorage.setItem(key, JSON.stringify(list)); } catch { /* ignore */ }
  bus.emit('funnel:visitors', list);
  return list;
}

function newId() {
  return `V-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Create (or return the existing) visitor for this session. */
export function record(ctx = {}) {
  const list = read(KEY());
  if (ctx.sessionId) {
    const existing = list.find((v) => v.sessionId === ctx.sessionId);
    if (existing) return existing;
  }
  const v = {
    id: newId(),
    sessionId: ctx.sessionId || newId(),
    ts: ctx.ts || new Date().toISOString(),
    source: ctx.source || 'direct',
    medium: ctx.medium || 'none',
    campaign: ctx.campaign || '',
    landingPage: ctx.landingPage || (typeof location !== 'undefined' ? location.pathname : '/funnel.html'),
    referrer: ctx.referrer || '',
    engaged: false,
    convertedLeadId: null,
    _demo: Boolean(ctx._demo),
  };
  list.push(v);
  write(KEY(), list);
  return v;
}

export function markEngaged(id) {
  const list = read(KEY());
  const v = list.find((x) => x.id === id || x.sessionId === id);
  if (v && !v.engaged) { v.engaged = true; write(KEY(), list); }
  return v || null;
}

export function attachLead(id, leadId) {
  const list = read(KEY());
  const v = list.find((x) => x.id === id || x.sessionId === id);
  if (v) { v.convertedLeadId = leadId; v.engaged = true; write(KEY(), list); }
  return v || null;
}

export function logEvent(entry = {}) {
  const list = read(EVT_KEY());
  list.push({ ts: new Date().toISOString(), ...entry });
  if (list.length > 500) list.splice(0, list.length - 500);
  try { localStorage.setItem(EVT_KEY(), JSON.stringify(list)); } catch { /* ignore */ }
  return entry;
}

export function list() { return read(KEY()); }
export function events() { return read(EVT_KEY()); }

export function metrics() {
  const all = read(KEY());
  const engaged = all.filter((v) => v.engaged);
  const converted = all.filter((v) => v.convertedLeadId);
  const byChannel = {};
  all.forEach((v) => { byChannel[v.source] = (byChannel[v.source] || 0) + 1; });
  return {
    visitors: all.length,
    engaged: engaged.length,
    leadsFromVisitors: converted.length,
    byChannel,
  };
}

/** Remove only demo rows, or everything. */
export function reset({ demoOnly = false } = {}) {
  if (demoOnly) {
    write(KEY(), read(KEY()).filter((v) => !v._demo));
  } else {
    write(KEY(), []);
    try { localStorage.removeItem(EVT_KEY()); } catch { /* ignore */ }
  }
}

/** Bulk-insert demo visitors (each already shaped, _demo forced true). */
export function seed(rows = []) {
  const list = read(KEY()).filter((v) => !v._demo);
  rows.forEach((r) => list.push({ ...r, _demo: true }));
  write(KEY(), list);
  return list;
}
