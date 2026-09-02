/* ===========================================================
   MusfirahLoom — AI Agent Platform
   components/OrderCard.js

   Order-status card, return-confirmation card and human-handoff
   card for the Support agent. Visually a sibling of ProductCard
   (same thumb + body + actions layout). Buttons never do
   nothing — each one calls onAction(phrase), which agent.entry
   feeds back into the chat like a quick reply.
=========================================================== */
import { el, money } from '../core/dom.js';

const STATUS_ACCENT = {
  Processing: '#A9702F',
  Shipped: '#6E2C3B',
  'In Transit': '#6E2C3B',
  'Out for Delivery': '#4C3A5E',
  Delivered: '#4A6157',
  Delayed: '#B0562F',
  Cancelled: '#6B5A5F',
};

function fmt(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return String(iso || '—');
  }
}

function row(dt, dd) {
  return el('div', { class: 'ml-order__row' },
    el('span', { class: 'ml-order__dt' }, dt),
    el('span', { class: 'ml-order__dd' }, dd),
  );
}

function thumb(glyph, accent) {
  return el('div', {
    class: 'ml-order__thumb',
    'aria-hidden': 'true',
    style: { background: `linear-gradient(150deg, ${accent} 0%, ${accent}bb 100%)` },
  }, glyph);
}

/**
 * renderOrderCard(order, { onAction })
 */
export function renderOrderCard(order, opts = {}) {
  const { onAction } = opts;
  if (!order) return el('p', { class: 'ml-cmp__empty' }, 'No order to show.');

  const accent = STATUS_ACCENT[order.status] || '#6E2C3B';
  const itemCount = (order.items || []).reduce((n, i) => n + (i.qty || 1), 0);

  const grid = el('div', { class: 'ml-order__grid' });
  grid.append(row('Ordered', fmt(order.orderDate)));
  grid.append(row(order.status === 'Delivered' ? 'Delivered' : 'Est. delivery', fmt(order.estimatedDelivery)));
  if (order.trackingNumber) {
    grid.append(row('Tracking', `${order.trackingNumber}${order.shippingCarrier ? ` · ${order.shippingCarrier}` : ''}`));
  }
  grid.append(row('Items', `${itemCount} · ${(order.items || []).map((i) => i.name).join(', ')}`));
  grid.append(row('Total', money(order.total)));
  grid.append(row('Payment', order.paymentStatus || '—'));

  const actions = el('div', { class: 'ml-order__actions' });
  if (typeof onAction === 'function') {
    const btn = (label, phrase, kind = 'btn-outline') =>
      actions.append(el('button', {
        type: 'button', class: `btn ${kind}`, onClick: () => onAction(phrase),
      }, label));
    btn('Full details', `full details for ${order.orderId}`);
    if (order.trackingNumber) btn('Track package', `tracking for ${order.orderId}`);
    if (order.status === 'Delivered') btn('Start return', `can I return ${order.orderId}`);
    btn('Request support', `I want to talk to a human about ${order.orderId}`);
  }

  return el('article', { class: 'ml-order', dataset: { orderId: order.orderId } },
    thumb('▣', accent),
    el('div', { class: 'ml-order__body' },
      el('div', { class: 'ml-order__head' },
        el('h4', { class: 'ml-order__id' }, order.orderId),
        el('span', {
          class: 'ml-order__status',
          style: { color: accent, borderColor: accent },
        }, order.status),
      ),
      grid,
      actions.childElementCount ? actions : null,
    ),
  );
}

/**
 * renderReturnCard(ret, { onAction })
 */
export function renderReturnCard(ret, opts = {}) {
  const { onAction } = opts;
  if (!ret) return el('p', { class: 'ml-cmp__empty' }, 'No return to show.');

  const grid = el('div', { class: 'ml-order__grid' });
  grid.append(row('Return', ret.ref));
  grid.append(row('Order', ret.orderId));
  grid.append(row('Status', ret.status || 'Awaiting Review'));
  if (ret.reason) grid.append(row('Reason', ret.reason));

  const actions = el('div', { class: 'ml-order__actions' });
  if (typeof onAction === 'function') {
    actions.append(el('button', {
      type: 'button', class: 'btn btn-outline',
      onClick: () => onAction(`status of return ${ret.ref}`),
    }, 'Check return status'));
  }

  return el('article', { class: 'ml-order ml-order--return' },
    thumb('✓', '#4A6157'),
    el('div', { class: 'ml-order__body' },
      el('div', { class: 'ml-order__head' },
        el('h4', { class: 'ml-order__id' }, 'Return request created'),
      ),
      grid,
      el('p', { class: 'ml-order__note' },
        'This is a demo request — no carrier or support team has been contacted.'),
      actions.childElementCount ? actions : null,
    ),
  );
}

/**
 * renderHandoffCard(handoff, { onAction })
 * handoff.stage: 'offer' | 'confirmed' | 'replacement'
 */
export function renderHandoffCard(handoff = {}, opts = {}) {
  const { onAction } = opts;
  const stage = handoff.stage || 'offer';

  const glyph = stage === 'replacement' ? '⇆' : stage === 'confirmed' ? '✓' : '☎';
  const title = stage === 'replacement'
    ? 'Replacement request logged'
    : stage === 'confirmed'
      ? 'Handed to a human specialist'
      : 'Talk to a human';

  const body = el('div', { class: 'ml-order__body' },
    el('div', { class: 'ml-order__head' }, el('h4', { class: 'ml-order__id' }, title)));

  const grid = el('div', { class: 'ml-order__grid' });
  if (handoff.ref) grid.append(row('Reference', handoff.ref));
  if (handoff.orderId) grid.append(row('Order', handoff.orderId));
  if (grid.childElementCount) body.append(grid);

  body.append(el('p', { class: 'ml-order__note' },
    'Demo action — nothing has been emailed or sent to a real team.'));

  if (stage === 'offer' && typeof onAction === 'function') {
    body.append(el('div', { class: 'ml-order__actions' },
      el('button', {
        type: 'button', class: 'btn btn-solid',
        onClick: () => onAction('request human support'),
      }, 'Request Human Support')));
  }

  return el('article', { class: 'ml-order ml-order--handoff' },
    thumb(glyph, '#4C3A5E'),
    body,
  );
}
