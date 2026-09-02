/* ===========================================================
   MusfirahLoom — AI Sales Funnel · demo dataset selector
=========================================================== */
import * as salon from './salon.demo.js';
import * as realestate from './realestate.demo.js';
import * as ecommerce from './ecommerce.demo.js';

const SETS = { salon, realestate, ecommerce };

export function demoFor(campaignId) {
  const s = SETS[campaignId] || SETS.salon;
  return { visitors: s.visitors, leads: s.leads };
}
