/* ===========================================================
   MusfirahLoom — AI Sales Funnel System
   services/tracking.js  ·  STEP 1 — traffic / attribution

   Captures campaign context on landing: UTM parameters when
   present, otherwise a channel inferred from the referrer.
   Persists it for the session and records one visitor via
   visitorRepo. No third-party analytics, no network.
=========================================================== */
import { getConfig } from './funnelConfig.js';
import { scoped } from './scope.js';
import * as visitorRepo from '../repositories/visitorRepo.js';

const CTX_KEY = () => scoped('funnel.ctx');
const SID_KEY = () => scoped('funnel.sid');

function sessionId() {
  try {
    let id = sessionStorage.getItem(SID_KEY());
    if (!id) {
      id = `S-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem(SID_KEY(), id);
    }
    return id;
  } catch {
    return `S-${Date.now().toString(36)}`;
  }
}

function channelFromReferrer(ref) {
  if (!ref) return 'direct';
  let host = '';
  try { host = new URL(ref).hostname.toLowerCase(); } catch { return 'direct'; }
  if (typeof location !== 'undefined' && host === location.hostname) return 'internal';
  const map = getConfig().traffic.referrerMap || {};
  for (const needle of Object.keys(map)) {
    if (host.includes(needle)) return map[needle];
  }
  return 'referral';
}

/**
 * captureContext() — call once on landing. Returns
 * { sessionId, source, medium, campaign, landingPage, referrer, ts }
 * and ensures a visitor row exists for this session.
 */
export function captureContext() {
  const sid = sessionId();
  let stored = null;
  try { stored = JSON.parse(sessionStorage.getItem(CTX_KEY()) || 'null'); } catch { stored = null; }

  let params;
  try { params = new URLSearchParams(location.search); } catch { params = new URLSearchParams(); }

  const utmSource = params.get('utm_source');
  const referrer = (typeof document !== 'undefined' && document.referrer) || '';

  const ctx = stored || {
    sessionId: sid,
    ts: new Date().toISOString(),
    source: (utmSource || channelFromReferrer(referrer) || 'direct').toLowerCase(),
    medium: (params.get('utm_medium') || (utmSource ? 'campaign' : 'organic')).toLowerCase(),
    campaign: params.get('utm_campaign') || '',
    landingPage: location.pathname + (location.search || ''),
    referrer,
  };

  try { sessionStorage.setItem(CTX_KEY(), JSON.stringify(ctx)); } catch { /* ignore */ }

  visitorRepo.record({ ...ctx, _demo: false });
  visitorRepo.logEvent({ type: 'page_view', sessionId: sid, source: ctx.source });
  return ctx;
}

export function getContext() {
  try { return JSON.parse(sessionStorage.getItem(CTX_KEY()) || 'null') || {}; }
  catch { return {}; }
}

export function markEngaged() {
  const sid = sessionId();
  visitorRepo.markEngaged(sid);
  visitorRepo.logEvent({ type: 'engaged', sessionId: sid });
}

export function trackEvent(type, props = {}) {
  visitorRepo.logEvent({ type, sessionId: sessionId(), ...props });
}
