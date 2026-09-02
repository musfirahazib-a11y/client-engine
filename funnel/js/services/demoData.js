/* ===========================================================
   MusfirahLoom — AI Sales Funnel System
   services/demoData.js

   Loads / clears the synthetic dataset for the ACTIVE campaign
   (data/demo/<campaign>). Demo rows carry _demo:true so
   clearDemo() removes only those and leaves real captures.
   withCampaign() lets the cross-campaign dashboard seed and
   read every campaign without navigating.
=========================================================== */
import { demoFor } from '../data/demo/index.js';
import { activeCampaignId, scoped, withCampaign } from './scope.js';
import { invalidateConfigCache } from './funnelConfig.js';
import * as visitorRepo from '../repositories/visitorRepo.js';
import * as leadRepo from '../repositories/funnelLeadRepo.js';

const FLAG = () => scoped('funnel.demoLoaded');

export function isDemoLoaded(id) {
  const key = id ? `funnel.demoLoaded.${id}` : FLAG();
  try { return localStorage.getItem(key) === '1'; } catch { return false; }
}

export function loadDemo() {
  const set = demoFor(activeCampaignId());
  visitorRepo.seed(set.visitors);
  leadRepo.seed(set.leads);
  try { localStorage.setItem(FLAG(), '1'); } catch { /* ignore */ }
}

export function clearDemo() {
  visitorRepo.reset({ demoOnly: true });
  leadRepo.reset({ demoOnly: true });
  try { localStorage.removeItem(FLAG()); } catch { /* ignore */ }
}

/** Wipe everything the ACTIVE campaign stores (demo + real). */
export function resetAll() {
  visitorRepo.reset({ demoOnly: false });
  leadRepo.reset({ demoOnly: false });
  try {
    localStorage.removeItem(FLAG());
    localStorage.removeItem(scoped('funnel.followup'));
    localStorage.removeItem(scoped('funnel.events'));
  } catch { /* ignore */ }
}

/* ---------- cross-campaign helpers ---------- */

export function loadDemoFor(id) {
  withCampaign(id, () => { invalidateConfigCache(); loadDemo(); });
}

/** Seed every campaign that hasn't been seeded yet (used by campaigns.html). */
export function ensureAllDemoLoaded(ids) {
  ids.forEach((id) => { if (!isDemoLoaded(id)) loadDemoFor(id); });
}
