/* ===========================================================
   MusfirahLoom — AI Sales Funnel System
   campaigns.entry.js  ·  bootstraps campaigns.html
=========================================================== */
import { CAMPAIGNS, CAMPAIGN_IDS } from './config/campaigns/index.js';
import { withCampaign } from './services/scope.js';
import { invalidateConfigCache } from './services/funnelConfig.js';
import { ensureAllDemoLoaded } from './services/demoData.js';
import { kpis } from './services/funnelAnalytics.js';
import { renderCampaignsPage } from './components/campaigns.js';

const root = document.getElementById('campaignsRoot');

/* seed a synthetic dataset for every campaign (once) so the
   cross-campaign panel and every console are populated */
try { ensureAllDemoLoaded(CAMPAIGN_IDS); } catch (e) { console.error('[campaigns] demo seed failed', e); }

function statsFor(id) {
  return withCampaign(id, () => {
    invalidateConfigCache();
    const k = kpis();
    const c = CAMPAIGNS.find((x) => x.id === id);
    return {
      visitors: k.visitors,
      leads: k.leads,
      qualified: k.qualified,
      conversions: k.conversions,
      revenue: k.revenue,
      overall: k.overall,
      goalLabel: (c && c.goalLabel) || 'Conversions',
    };
  });
}

renderCampaignsPage(root, { campaigns: CAMPAIGNS, statsFor });
invalidateConfigCache();
