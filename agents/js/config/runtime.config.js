/* ===========================================================
   MusfirahLoom — AI Agent Platform
   runtime.config.js  ·  public runtime configuration

   COMMITTED FILE — NEVER put secrets, API keys or tokens here.
   Everything in this file ships to the browser.

   Phase 1 (this build) runs entirely in MODE 'demo':
     - no real AI API
     - no backend / serverless
     - no n8n
   Phase 2 flips MODE to 'live' and fills API_BASE_URL. The
   frontend code does not otherwise change.
=========================================================== */
export const RUNTIME = {
  /* 'demo'  — mock transport only, mock data, no network
     'live'  — (Phase 2) routes AI turns through a serverless proxy */
  MODE: 'demo',

  /* Phase 2 only. Left blank in demo. */
  API_BASE_URL: '',

  /* 'local' — repositories read bundled mock data
     'api'   — (Phase 2) repositories fetch real endpoints        */
  DATA_SOURCE: 'local',

  /* Analytics sink: 'noop' | 'console' (dev) | 'plausible' (P2)  */
  ANALYTICS: { sink: 'console', id: '' },

  FEATURES: {
    incentives: true,      // cart-recovery style discount offers (demo)
    humanHandoff: true,    // "talk to a human" action
    metricsPanel: false,   // live funnel drawer — off until needed
  },

  LIMITS: {
    maxMessageChars: 800,
    maxTurns: 40,
  },

  VERSION: '0.1.0-demo',
};

export const isDemo = () => RUNTIME.MODE === 'demo';
