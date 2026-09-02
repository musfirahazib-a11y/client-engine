/* ===========================================================
   MusfirahLoom — AI Agent Platform
   components/RecoveryCard.js

   Cards for the Abandoned Cart Recovery agent. Reuses the
   .ml-order* shell (thumb + body + rows + actions) so it reads
   as a sibling of OrderCard / ProductCard. Every button calls
   onAction(phrase), fed back into the chat by agent.entry.
=========================================================== */
import { el, money } from '../core/dom.js';

const PRIORITY_ACCENT = { High: '#6E2C3B', Medium: '#A9702F', Low: '#6B5A5F' };

function row(dt, dd) {
  return el('div', { class: 'ml-order__row' },
    el('span', { class: 'ml-order__dt' }, dt),
    el('span', { class: 'ml-order__dd' }, dd));
}

function thumb(glyph, accent) {
  return el('div', {
    class: 'ml-order__thumb',
    'aria-hidden': 'true',
    style: { background: `linear-gradient(150deg, ${accent} 0%, ${accent}bb 100%)` },
  }, glyph);
}

function itemsLine(cart) {
  const count = (cart.items || []).reduce((n, i) => n + (i.qty || 1), 0);
  const names = (cart.items || []).map((i) => `${i.qty > 1 ? `${i.qty}× ` : ''}${i.name}`).join(', ');
  return `${count} · ${names}`;
}

/**
 * renderRecoveryCard(opp, { onAction, compact })
 * opp = cartRecoveryRepo.recoveryOpportunity(cart) merged with cart fields.
 */
export function renderRecoveryCard(opp, opts = {}) {
  const { onAction, compact = false } = opts;
  if (!opp) return el('p', { class: 'ml-cmp__empty' }, 'No cart to show.');

  const accent = PRIORITY_ACCENT[opp.priority] || '#6E2C3B';
  const grid = el('div', { class: 'ml-order__grid' });
  grid.append(row('Customer', opp.customerName || '—'));
  grid.append(row('Items', itemsLine(opp)));
  grid.append(row('Cart value', money(opp.value)));
  grid.append(row('Reason', opp.likelyObjection || '—'));
  grid.append(row('Segment', opp.segment || '—'));
  grid.append(row('Status', opp.status || 'abandoned'));
  grid.append(row('Recommended', opp.recommendedAction || '—'));

  const actions = el('div', { class: 'ml-order__actions' });
  if (typeof onAction === 'function') {
    const btn = (label, phrase) => actions.append(el('button', {
      type: 'button', class: 'btn btn-outline', onClick: () => onAction(phrase),
    }, label));
    btn('View cart', `show ${opp.cartId}`);
    btn('Recovery strategy', `recovery strategy for ${opp.cartId}`);
    btn('Preview message', `preview recovery message for ${opp.cartId}`);
    btn('Recover', `recover cart ${opp.cartId}`);
  }

  return el('article', {
    class: `ml-order ml-order--recovery${compact ? ' ml-order--compact' : ''}`,
    dataset: { cartId: opp.cartId },
  },
    thumb('◈', accent),
    el('div', { class: 'ml-order__body' },
      el('div', { class: 'ml-order__head' },
        el('h4', { class: 'ml-order__id' }, opp.cartId),
        el('span', { class: 'ml-order__status', style: { color: accent, borderColor: accent } },
          `${opp.priority} priority`),
      ),
      grid,
      actions.childElementCount ? actions : null,
    ),
  );
}

/** renderRecoveryList([opp, ...], { onAction }) */
export function renderRecoveryList(opps, opts = {}) {
  const wrap = el('div', { class: 'ml-recovery-list' });
  (opps || []).forEach((opp) => wrap.append(renderRecoveryCard(opp, { ...opts, compact: true })));
  return wrap;
}

/** renderMessagePreview({ cart, incentiveLabel, objection, message }, { onAction }) */
export function renderMessagePreview(preview, opts = {}) {
  const { onAction } = opts;
  const { cart, incentiveLabel, objection, message } = preview;

  const grid = el('div', { class: 'ml-order__grid' });
  grid.append(row('To', `${cart.customerName} · ${cart.email}`));
  grid.append(row('Cart', cart.cartId));
  grid.append(row('Objection', objection || cart.abandonmentReason || '—'));
  grid.append(row('Incentive', incentiveLabel || 'None'));

  const actions = el('div', { class: 'ml-order__actions' });
  if (typeof onAction === 'function') {
    actions.append(el('button', {
      type: 'button', class: 'btn btn-solid', onClick: () => onAction(`start recovery for ${cart.cartId}`),
    }, 'Start recovery'));
    actions.append(el('button', {
      type: 'button', class: 'btn btn-outline', onClick: () => onAction(`recover cart ${cart.cartId}`),
    }, 'Recover cart'));
  }

  return el('article', { class: 'ml-order ml-order--preview' },
    thumb('✉', '#4C3A5E'),
    el('div', { class: 'ml-order__body' },
      el('div', { class: 'ml-order__head' },
        el('h4', { class: 'ml-order__id' }, 'DEMO — Message Preview')),
      grid,
      el('blockquote', { class: 'ml-quote' }, message || ''),
      el('p', { class: 'ml-order__note' },
        'Demo preview only — no email, SMS or WhatsApp message is sent.'),
      actions.childElementCount ? actions : null,
    ),
  );
}

/** renderRecoveredCard(result, { onAction }) */
export function renderRecoveredCard(result, opts = {}) {
  const { onAction } = opts;
  if (!result) return el('p', { class: 'ml-cmp__empty' }, 'No recovery to show.');

  const grid = el('div', { class: 'ml-order__grid' });
  grid.append(row('Cart', result.cartId));
  grid.append(row('Recovered revenue', money(result.revenue)));
  grid.append(row('Recovery method', result.method || 'no incentive'));
  grid.append(row('Status', 'Recovered'));

  const actions = el('div', { class: 'ml-order__actions' });
  if (typeof onAction === 'function') {
    actions.append(el('button', {
      type: 'button', class: 'btn btn-outline', onClick: () => onAction('show recovery metrics'),
    }, 'View recovery metrics'));
  }

  return el('article', { class: 'ml-order ml-order--recovered' },
    thumb('✓', '#4A6157'),
    el('div', { class: 'ml-order__body' },
      el('div', { class: 'ml-order__head' }, el('h4', { class: 'ml-order__id' }, 'Cart recovered')),
      grid,
      el('p', { class: 'ml-order__note' }, 'This is a demo simulation — no real order was placed.'),
      actions.childElementCount ? actions : null,
    ),
  );
}

/** renderMetricsPanel(metrics) */
export function renderMetricsPanel(m) {
  if (!m) return el('p', { class: 'ml-cmp__empty' }, 'No metrics available.');
  const tiles = [
    ['Abandoned carts', String(m.abandonedCarts)],
    ['Abandoned value', money(m.abandonedValue)],
    ['Recovered carts', String(m.recoveredCarts)],
    ['Recovered revenue', money(m.recoveredRevenue)],
    ['Recovery rate', `${m.recoveryRate}%`],
    ['Avg cart value', money(m.avgAbandonedValue)],
    ['Potential recovery', money(m.potentialRecovery)],
  ];
  const grid = el('div', { class: 'ml-metrics' });
  tiles.forEach(([label, value]) => {
    grid.append(el('div', { class: 'ml-metrics__tile' },
      el('span', { class: 'ml-metrics__value' }, value),
      el('span', { class: 'ml-metrics__label' }, label)));
  });
  return grid;
}
