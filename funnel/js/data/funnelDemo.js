/* ===========================================================
   COMPATIBILITY SHIM — demo data is now per-campaign.
   See data/demo/index.js and services/demoData.js.
   This re-exports the Real Estate set for any old import.
=========================================================== */
export { visitors as DEMO_VISITORS, leads as DEMO_LEADS } from './demo/realestate.demo.js';
