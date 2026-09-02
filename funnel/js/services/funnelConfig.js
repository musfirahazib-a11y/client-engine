/* ===========================================================
   MusfirahLoom — AI Sales Funnel System
   services/funnelConfig.js

   Campaign-aware config accessor. The base config is whichever
   demo campaign is active (scope.js resolves it); the console
   can persist per-campaign overrides. Only the diff against the
   campaign's shipped config is stored, and under a
   campaign-scoped key, so the three campaigns never mix.

   Emits 'funnel:config' on the shared bus after every change.
=========================================================== */
import { campaignConfig } from '../config/campaigns/index.js';
import { activeCampaignId, scoped } from './scope.js';
import { bus } from '../../../agents/js/core/events.js';

function isObj(v) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

/* deep-merge override onto base; arrays are replaced wholesale */
function merge(base, override) {
  if (!isObj(base) || !isObj(override)) return override === undefined ? base : override;
  const out = { ...base };
  for (const k of Object.keys(override)) {
    out[k] = isObj(base[k]) && isObj(override[k]) ? merge(base[k], override[k]) : override[k];
  }
  return out;
}

const overrideKey = () => scoped('funnel.config');

function readOverride() {
  try {
    const raw = localStorage.getItem(overrideKey());
    const obj = raw ? JSON.parse(raw) : null;
    return isObj(obj) ? obj : {};
  } catch {
    return {};
  }
}

function writeOverride(obj) {
  try { localStorage.setItem(overrideKey(), JSON.stringify(obj)); } catch { /* ignore */ }
}

function base() {
  return campaignConfig(activeCampaignId());
}

let _cache = null;
let _cacheId = null;

/** The effective configuration for the active campaign. */
export function getConfig() {
  const id = activeCampaignId();
  if (_cache && _cacheId === id) return _cache;
  _cache = merge(base(), readOverride());
  _cacheId = id;
  return _cache;
}

/** Persist a full replacement config (console form). Stores the diff only. */
export function setConfig(nextFull) {
  const clean = isObj(nextFull) ? nextFull : {};
  writeOverride(diff(base(), clean));
  _cache = merge(base(), readOverride());
  _cacheId = activeCampaignId();
  bus.emit('funnel:config', _cache);
  return _cache;
}

/** Shallow-path update, e.g. updateConfig({ business: { name: 'X' } }). */
export function updateConfig(patch) {
  return setConfig(merge(getConfig(), patch));
}

/** Restore this campaign's shipped config. */
export function resetConfig() {
  try { localStorage.removeItem(overrideKey()); } catch { /* ignore */ }
  _cache = null;
  _cacheId = null;
  const c = getConfig();
  bus.emit('funnel:config', c);
  return c;
}

/** Drop the in-memory cache (used after switching campaign in-page). */
export function invalidateConfigCache() {
  _cache = null;
  _cacheId = null;
}

export function isDemoConfig() {
  const m = getConfig().meta;
  return Boolean(m && m.demo);
}

export function conversionGoal() {
  return getConfig().meta.conversionGoal || 'lead';
}

/* keep only the parts of `next` that differ from `base` */
function diff(baseObj, next) {
  if (!isObj(baseObj) || !isObj(next)) return next;
  const out = {};
  for (const k of Object.keys(next)) {
    if (isObj(baseObj[k]) && isObj(next[k])) {
      const d = diff(baseObj[k], next[k]);
      if (d && Object.keys(d).length) out[k] = d;
    } else if (JSON.stringify(baseObj[k]) !== JSON.stringify(next[k])) {
      out[k] = next[k];
    }
  }
  return out;
}

/* ---------- small shared formatting helpers ---------- */

export function money0(n) {
  const v = Number(n) || 0;
  return `$${Math.round(v).toLocaleString()}`;
}

export function daysUntil(isoStr) {
  const t = new Date(isoStr).getTime();
  if (Number.isNaN(t)) return null;
  return Math.ceil((t - Date.now()) / 86400000);
}

export function fmtDate(isoStr) {
  try {
    return new Date(isoStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return String(isoStr || '');
  }
}
