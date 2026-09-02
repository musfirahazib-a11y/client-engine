/* ===========================================================
   MusfirahLoom — Website
   site/js/home.entry.js  ·  builds the AI ecosystem bands on
   index.html (hydrates placeholder <div>s inside #work).
   Runs alongside the existing script.js.
=========================================================== */
import { AGENTS, FUNNEL, CAMPAIGNS, ECOSYSTEM } from '../data/site.content.js';
import { renderAgentCard, renderCampaignCard, renderEcosystem, el } from './components.js';
import { initReveal } from './reveal.js';

function band(node, cls, ...kids) {
  if (!node) return;
  node.className = `home-band site-reveal ${cls}`;
  node.append(el('div', { class: 'site-wrap' }, ...kids));
}

/* --- 4 AI Agents --- */
band(document.getElementById('homeAgents'), '',
  el('span', { class: 'eyebrow' }, 'AI Agents'),
  el('h2', {}, 'Four agents, built for real business work.'),
  el('p', { class: 'home-lede' }, 'Specialised AI agents designed to automate the tasks that slow businesses down — sales, support, cart recovery and lead qualification.'),
  el('div', { class: 'ml-agent-grid' },
    ...AGENTS.map((a) => renderAgentCard(a, { detailBase: 'ai-agents.html' }))),
  el('a', { class: 'btn btn-outline home-more', href: 'ai-agents.html' }, 'Explore all agents →'));

/* --- Flagship AI Sales Funnel --- */
const funnelNode = document.getElementById('homeFunnel');
if (funnelNode) {
  funnelNode.className = 'home-band home-funnel site-reveal';
  funnelNode.append(el('div', { class: 'site-wrap' },
    el('span', { class: 'ml-badge' }, FUNNEL.badge),
    el('span', { class: 'eyebrow', style: { display: 'block' } }, 'AI Sales Funnel System'),
    el('h2', {}, FUNNEL.headline),
    el('p', { class: 'home-lede' }, FUNNEL.lede),
    el('div', { class: 'wf', style: { '--card-accent': 'var(--agent-funnel)' } },
      el('ol', { class: 'wf__list' },
        ...FUNNEL.workflow.map((s, i) => el('li', { class: 'wf__step' },
          el('span', { class: 'wf__node', 'aria-hidden': 'true' }, String(i + 1)),
          el('span', { class: 'wf__label' }, s))))),
    el('a', { class: 'btn btn-outline home-more', href: 'ai-sales-funnel.html' }, 'Explore the funnel →')));
}

/* --- Agents -> System ecosystem --- */
band(document.getElementById('homeEco'), 'home-eco',
  el('span', { class: 'eyebrow' }, 'The ecosystem'),
  el('h2', {}, 'Individual agents solve tasks. Connected systems automate journeys.'),
  el('p', { class: 'home-lede' }, 'Four agents, one funnel, three industry systems — one connected machine for capture, conversion, support and retention.'),
  renderEcosystem(ECOSYSTEM.levels));

/* --- 3 Industry Campaigns --- */
band(document.getElementById('homeCampaigns'), '',
  el('span', { class: 'eyebrow' }, 'AI Campaigns'),
  el('h2', {}, 'Ready-to-deploy industry systems.'),
  el('p', { class: 'home-lede' }, 'The agents and funnel, configured and packaged for a specific industry — with a live interactive demo for each.'),
  el('div', { class: 'ml-agent-grid' }, ...CAMPAIGNS.map((c) => renderCampaignCard(c, ''))),
  el('a', { class: 'btn btn-outline home-more', href: 'campaigns.html' }, 'Explore all campaigns →'));

initReveal(document);
