/* ===========================================================
   MusfirahLoom — AI Agent Platform
   components/AgentHeader.js

   The banner above the chat on agent.html: name, category,
   commercial benefit, capability chips, DEMO MODE badge, and a
   live cart readout that other modules can update.
=========================================================== */
import { el } from '../core/dom.js';

export function renderAgentHeader(agent) {
  const caps = el('ul', { class: 'ml-agent-header__caps' });
  (agent.capabilities || []).forEach((c) => caps.append(el('li', {}, c)));

  // the cart readout only makes sense for agents that touch a cart
  const usesCart = (agent.tools || []).some((t) => String(t).startsWith('cart.'));
  const cart = usesCart
    ? el('span', {
        class: 'ml-agent-header__cart',
        dataset: { cartReadout: '' },
        'aria-live': 'polite',
      }, 'Cart: 0 items')
    : null;

  const badges = el('div', { class: 'ml-agent-header__badges' },
    el('span', { class: 'ml-badge' }, 'Demo Mode'),
    cart,
  );

  const note =
    agent.status === 'ready'
      ? null
      : el('p', { class: 'ml-agent-header__note' },
          `This agent's guided workflow is still being scripted for Demo Mode. ` +
          `The chat below is live but gives placeholder responses — the ` +
          `Sales & Product Recommendation agent is fully interactive today.`);

  return el('header', {
    class: 'ml-agent-header',
    style: { '--agent-accent': `var(${agent.accent})` },
  },
    el('a', { class: 'ml-agent-header__back', href: 'agents.html' }, '← All AI Agents'),
    el('div', { class: 'ml-agent-header__row' },
      el('span', { class: 'ml-agent-header__icon', 'aria-hidden': 'true' }, agent.icon),
      el('div', {},
        el('span', { class: 'ml-agent-header__cat' }, agent.category),
        el('h1', {}, agent.name),
      ),
    ),
    el('p', { class: 'ml-agent-header__benefit' }, agent.benefit),
    badges,
    caps,
    note,
  );
}

/** Update the "Cart: N items · $X" readout in the header. */
export function updateCartReadout(count, total) {
  const node = document.querySelector('[data-cart-readout]');
  if (!node) return;
  if (!count) {
    node.textContent = 'Cart: 0 items';
    return;
  }
  const money = `$${(Number(total) || 0).toFixed(2)}`;
  node.innerHTML = `Cart: <strong>${count} item${count === 1 ? '' : 's'}</strong> · ${money}`;
}
