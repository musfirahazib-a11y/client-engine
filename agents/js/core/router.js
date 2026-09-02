/* ===========================================================
   MusfirahLoom — AI Agent Platform
   core/router.js  ·  query-string routing for agent.html

   agent.html?id=<agentId>  ->  one shared shell, config-driven.
   Unknown / missing ids redirect safely back to the hub.
=========================================================== */
import { getAgent } from '../config/agents.config.js';

const HUB_URL = 'agents.html';

export function getAgentIdFromQuery() {
  try {
    return (new URLSearchParams(window.location.search).get('id') || '')
      .trim()
      .toLowerCase();
  } catch {
    return '';
  }
}

/**
 * Resolve the current ?id= to a registry entry.
 * Returns the agent object, or null after triggering a redirect.
 */
export function resolveAgentOrRedirect() {
  const id = getAgentIdFromQuery();
  const agent = id ? getAgent(id) : null;

  if (!agent) {
    // replace() so the broken URL doesn't sit in history
    window.location.replace(HUB_URL);
    return null;
  }
  return agent;
}

export function goToHub() {
  window.location.href = HUB_URL;
}

export function goToAgent(id) {
  window.location.href = `agent.html?id=${encodeURIComponent(id)}`;
}
