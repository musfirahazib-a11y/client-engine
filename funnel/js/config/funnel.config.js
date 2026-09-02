/* ===========================================================
   MusfirahLoom — AI Sales Funnel System
   config/funnel.config.js  ·  COMPATIBILITY SHIM

   The funnel is now multi-campaign. Each campaign's full
   configuration lives in config/campaigns/*.campaign.js and is
   resolved by services/scope.js + services/funnelConfig.js.

   This file is kept only so older imports of `DEFAULT_FUNNEL`
   still resolve — it points at the Real Estate campaign, which
   was the original single-business demo.
=========================================================== */
export { REALESTATE_CONFIG as DEFAULT_FUNNEL, REALESTATE_CONFIG as default } from './campaigns/realestate.campaign.js';
export const FUNNEL_SCHEMA_VERSION = 1;
