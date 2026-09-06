/* ===========================================================
   Misbah Azib — Website
   site/js/submitLead.js  ·  Start-a-Project submission layer

   Two small pieces:

     buildPayload(values, triage, meta) — PURE. Assembles the
       JSON body: the full lead brief, plus the transparent
       triage (score / max / band / factors / capped / action).
       Deterministic given `meta`.

     postLead(payload, opts) — async. POSTs the payload to the
       configured n8n webhook. Never throws; returns a status
       object. With no URL it returns { status: 'disabled' } and
       the caller falls back to the WhatsApp / email handoff.

   The webhook URL comes from site/js/site.config.js (blank in
   git; set on the deployed copy). See docs/webhook-setup.md.
   No secret lives in this code.
=========================================================== */
import { SITE } from './site.config.js';

/** The webhook config for this deployment. Thin seam over site.config.js. */
export function resolveFormConfig() {
  return { ...SITE.FORM };
}

/**
 * Pure. `meta` supplies anything non-deterministic (now, page) so
 * the same inputs always produce the same object in tests.
 */
export function buildPayload(values = {}, triage = {}, meta = {}) {
  const v = values || {};
  const t = triage || {};
  return {
    source: meta.source || 'musfirahloom.com/start',
    submittedAt: meta.now || null,
    page: meta.page || null,
    lead: {
      name: v.name || '',
      email: v.email || '',
      business: v.business || '',
      link: v.link || '',
      industry: v.industry || '',
      businessType: v.bizType || '',
      challenge: v.challenge || '',
      need: v.need || '',
      budget: v.budget || '',
      timeline: v.timeline || '',
      goal: v.goal || '',
      preferredContact: v.contact || '',
    },
    triage: {
      score: typeof t.score === 'number' ? t.score : null,
      maxScore: typeof t.max === 'number' ? t.max : null,
      band: t.band || null,
      bandLabel: t.bandLabel || null,
      capped: Boolean(t.capped),
      capNote: t.capNote || '',
      recommendedAction: t.action || null,
      factors: Array.isArray(t.factors)
        ? t.factors.map((f) => ({ key: f.key, label: f.label, points: f.points, max: f.max, note: f.note }))
        : [],
    },
  };
}

/**
 * POST the payload. Resolves to:
 *   { status: 'disabled' }            — no URL configured
 *   { status: 'sent' }                — 2xx from the webhook
 *   { status: 'failed', reason }      — network error, timeout or non-2xx
 * Never rejects.
 */
export async function postLead(payload, { url = '', timeoutMs = 8000 } = {}) {
  if (!url) return { status: 'disabled' };

  const canAbort = typeof AbortController === 'function';
  const controller = canAbort ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller ? controller.signal : undefined,
      keepalive: true,
    });
    if (timer) clearTimeout(timer);
    if (!res.ok) return { status: 'failed', reason: `http ${res.status}` };
    return { status: 'sent' };
  } catch (err) {
    if (timer) clearTimeout(timer);
    const reason = err && err.name === 'AbortError' ? 'timeout' : (err && err.message) || 'network error';
    return { status: 'failed', reason };
  }
}
