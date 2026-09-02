/* ===========================================================
   MusfirahLoom — AI Sales Funnel System
   services/scope.js  ·  active campaign + per-campaign storage keys

   The funnel is now a shell for THREE demo campaigns (Salon &
   Spa, Real Estate, E-commerce). Every campaign is a full
   funnel configuration + its own isolated data. This module
   resolves which campaign is active and namespaces every
   localStorage/sessionStorage key so the campaigns never mix.

   Resolution order:  ?campaign=<id>  →  session  →  saved  →  default
=========================================================== */
import { CAMPAIGN_IDS, DEFAULT_CAMPAIGN_ID } from '../config/campaigns/index.js';

let _forced = null;

export function activeCampaignId() {
  if (_forced) return _forced;
  try {
    const p = new URLSearchParams(location.search).get('campaign');
    if (p && CAMPAIGN_IDS.includes(p)) {
      try { sessionStorage.setItem('funnel.campaign', p); } catch { /* ignore */ }
      try { localStorage.setItem('funnel.activeCampaign', p); } catch { /* ignore */ }
      return p;
    }
  } catch { /* ignore */ }
  try {
    const s = sessionStorage.getItem('funnel.campaign');
    if (s && CAMPAIGN_IDS.includes(s)) return s;
  } catch { /* ignore */ }
  try {
    const l = localStorage.getItem('funnel.activeCampaign');
    if (l && CAMPAIGN_IDS.includes(l)) return l;
  } catch { /* ignore */ }
  return DEFAULT_CAMPAIGN_ID;
}

export function setActiveCampaignId(id) {
  if (!CAMPAIGN_IDS.includes(id)) return;
  _forced = id;
  try { sessionStorage.setItem('funnel.campaign', id); } catch { /* ignore */ }
  try { localStorage.setItem('funnel.activeCampaign', id); } catch { /* ignore */ }
}

/** namespaced key, e.g. scoped('funnel.leads') -> 'funnel.leads.salon' */
export function scoped(base) {
  return `${base}.${activeCampaignId()}`;
}

/**
 * Run fn() as if `id` were the active campaign, then restore.
 * fn MUST be synchronous. Used by the cross-campaign dashboard
 * and by "seed every campaign's demo data".
 */
export function withCampaign(id, fn) {
  const prev = _forced;
  _forced = CAMPAIGN_IDS.includes(id) ? id : prev;
  try {
    return fn();
  } finally {
    _forced = prev;
  }
}
