/* ===========================================================
   MusfirahLoom — AI Agent Platform
   components/AgentGrid.js

   Renders the hub's 5 agent cards from the registry
   (agents.config.js). No card markup is hand-written in
   agents.html — this module is the only place cards are built.

   Self-contained on purpose: it is loaded in STEP 1 before the
   shared core/ helpers exist, so it uses plain DOM APIs only.
=========================================================== */

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function cardMarkup(agent) {
  const ready = agent.status === 'ready';
  // a system with its own pages (e.g. the AI Sales Funnel) sets `href`;
  // everything else opens the shared agent shell
  const href = agent.href || `agent.html?id=${encodeURIComponent(agent.id)}`;

  const caps = agent.capabilities
    .map((c) => `<li>${esc(c)}</li>`)
    .join('');

  const primaryLabel = agent.href ? 'Open the System &rarr;' : 'Try Live Demo &rarr;';
  const consoleLink = agent.consoleHref
    ? `<a class="ml-card__chip ml-card__chip--link" href="${esc(agent.consoleHref)}">Console &rarr;</a>`
    : '';

  const cta = ready
    ? `<a class="btn btn-solid ml-card__cta" href="${esc(href)}">${primaryLabel}</a>${consoleLink}`
    : `<a class="btn btn-outline ml-card__cta" href="${esc(href)}">Preview Demo &rarr;</a>
       <span class="ml-card__chip" title="Demo workflow in progress">In progress</span>`;

  return `
    <article class="ml-card ml-reveal" style="--card-accent: var(${esc(agent.accent)});">
      <div class="ml-card__top">
        <span class="ml-card__icon" aria-hidden="true">${esc(agent.icon)}</span>
        <span class="ml-card__cat">${esc(agent.category)}</span>
      </div>
      <h3 class="ml-card__name">${esc(agent.name)}</h3>
      <p class="ml-card__benefit">${esc(agent.benefit)}</p>
      <ul class="ml-card__caps">${caps}</ul>
      <div class="ml-card__foot">${cta}</div>
    </article>`;
}

/**
 * @param {HTMLElement} mountEl   container to render into
 * @param {Array}       agents    registry array from agents.config.js
 */
export function renderAgentGrid(mountEl, agents) {
  if (!mountEl) return;
  if (!Array.isArray(agents) || agents.length === 0) {
    mountEl.innerHTML = `<p class="ml-card__benefit">No agents are configured.</p>`;
    return;
  }
  mountEl.innerHTML = agents.map(cardMarkup).join('');
}
