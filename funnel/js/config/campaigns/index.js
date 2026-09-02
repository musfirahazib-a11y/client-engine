/* ===========================================================
   MusfirahLoom — AI Sales Funnel System
   config/campaigns/index.js  ·  THE CAMPAIGN REGISTRY

   Three demo campaigns, each a full funnel configuration in
   the shared schema. The funnel shell (funnel.html), the
   console (funnel-admin.html) and the selector (campaigns.html)
   all load a campaign by id. Add a fourth campaign by dropping
   a config file here — no frontend code.
=========================================================== */
import { SALON_CONFIG } from './salon.campaign.js';
import { REALESTATE_CONFIG } from './realestate.campaign.js';
import { ECOMMERCE_CONFIG } from './ecommerce.campaign.js';

const RAW = [SALON_CONFIG, REALESTATE_CONFIG, ECOMMERCE_CONFIG];

export const CAMPAIGNS = RAW.map((config) => ({
  id: config.meta.campaignId,
  name: config.business.name,
  logoText: config.business.logoText,
  niche: config.meta.niche,
  tagline: config.business.tagline,
  goal: config.meta.conversionGoal,
  goalLabel: config.meta.goalLabel,
  icon: config.meta.selectorIcon,
  blurb: config.meta.selectorBlurb,
  accent: config.branding.primary,
  accent2: config.branding.secondary,
  config,
}));

export const CAMPAIGN_IDS = CAMPAIGNS.map((c) => c.id);
export const DEFAULT_CAMPAIGN_ID = 'salon';

export function getCampaign(id) {
  return CAMPAIGNS.find((c) => c.id === id)
    || CAMPAIGNS.find((c) => c.id === DEFAULT_CAMPAIGN_ID);
}

export function campaignConfig(id) {
  return getCampaign(id).config;
}
