/* ===========================================================
   MusfirahLoom — AI Sales Funnel System
   components/funnelCards.js

   Small DOM renderers shared by the AI chat (passed through
   the shared MessageBubble's `custom` slot) and by the console.
   Built on the existing agents core/dom.js helpers and the
   .ml-order* / .ml-product* card shells, so they read as
   siblings of the four agents' cards.
=========================================================== */
import { el } from '../../../agents/js/core/dom.js';
import { money0 } from '../services/funnelConfig.js';

const ACCENT = 'var(--funnel, #2F5D62)';

function row(dt, dd) {
  return el('div', { class: 'ml-order__row' },
    el('span', { class: 'ml-order__dt' }, dt),
    el('span', { class: 'ml-order__dd' }, dd));
}

/* map a config cta.action to a phrase the sales agent understands */
function ctaPhrase(action) {
  if (action === 'checkout') return 'add to cart & checkout';
  if (action === 'quote') return 'request a callback';
  return 'book an appointment';
}

/**
 * renderRecommendation({ listing, reason }, { onAction })
 * Niche-generic: shows whichever of area / layout / duration /
 * features a listing actually has.
 */
export function renderRecommendation(entry, opts = {}) {
  const { onAction } = opts;
  const L = entry.listing || entry;

  const grid = el('div', { class: 'ml-order__grid' });
  if (L.area) grid.append(row('Area', L.area));
  const layout = [
    L.beds != null ? (L.beds ? `${L.beds} bed` : 'Studio') : null,
    L.baths ? `${L.baths} bath` : null,
    L.sqft ? `${L.sqft.toLocaleString()} sqft` : null,
  ].filter(Boolean).join(' · ');
  if (layout) grid.append(row('Layout', layout));
  if (L.duration) grid.append(row('Duration', L.duration));
  grid.append(row('Price', L.priceLabel || money0(L.price)));
  if (L.features && L.features.length) grid.append(row('Highlights', L.features.join(' · ')));
  if (entry.reason) grid.append(row('Why it fits', entry.reason));

  const actions = el('div', { class: 'ml-order__actions' });
  if (typeof onAction === 'function') {
    const cta = L.cta || { label: 'Get started', action: 'book' };
    actions.append(el('button', {
      type: 'button', class: 'btn btn-solid', onClick: () => onAction(ctaPhrase(cta.action)),
    }, cta.label));
    actions.append(el('button', {
      type: 'button', class: 'btn btn-outline', onClick: () => onAction('talk to a human'),
    }, 'Ask a question'));
  }

  const glyph = L.duration ? '✦' : L.beds != null ? '⌂' : '◆';
  return el('article', { class: 'ml-order ml-order--rec', dataset: { listingId: L.id } },
    el('div', { class: 'ml-order__thumb', 'aria-hidden': 'true', style: { background: `linear-gradient(150deg, ${ACCENT} 0%, ${ACCENT}bb 100%)` } }, glyph),
    el('div', { class: 'ml-order__body' },
      el('div', { class: 'ml-order__head' },
        el('h4', { class: 'ml-order__id' }, L.title),
        el('span', { class: 'ml-order__status', style: { color: ACCENT, borderColor: ACCENT } }, L.category || 'Item')),
      grid,
      actions.childElementCount ? actions : null));
}

export function renderRecommendationList(items, opts = {}) {
  const wrap = el('div', { class: 'ml-recovery-list' });
  (items || []).forEach((it) => wrap.append(renderRecommendation(it, opts)));
  return wrap;
}

/** renderOffer(offer, { onAction }) — offer must come from config. */
export function renderOffer(offer, opts = {}) {
  const { onAction } = opts;
  if (!offer) return null;
  const grid = el('div', { class: 'ml-order__grid' });
  grid.append(row('Offer', offer.name));
  grid.append(row('Details', offer.description));
  if (offer.urgency) grid.append(row('Timing', offer.urgency));
  if (offer.daysLeft != null && offer.daysLeft >= 0) {
    grid.append(row('Expires', `in ${offer.daysLeft} day${offer.daysLeft === 1 ? '' : 's'} (${offer.expiryLabel})`));
  }

  const actions = el('div', { class: 'ml-order__actions' });
  if (typeof onAction === 'function' && offer.cta) {
    actions.append(el('button', {
      type: 'button', class: 'btn btn-solid',
      onClick: () => onAction(ctaPhrase(offer.cta.action)),
    }, offer.cta.label));
  }

  return el('article', { class: 'ml-order ml-order--offer' },
    el('div', { class: 'ml-order__thumb', 'aria-hidden': 'true', style: { background: 'linear-gradient(150deg,#C9A66B 0%,#b8905a 100%)' } }, '✦'),
    el('div', { class: 'ml-order__body' },
      el('div', { class: 'ml-order__head' }, el('h4', { class: 'ml-order__id' }, 'Active offer')),
      grid,
      el('p', { class: 'ml-order__note' }, 'Configured offer — the assistant never invents discounts or terms.'),
      actions.childElementCount ? actions : null));
}

/** renderCtaRow([{kind,label,type}], { onAction, links }) */
export function renderCtaRow(ctas, opts = {}) {
  const { onAction, links = {} } = opts;
  const wrap = el('div', { class: 'fn-cta-row' });
  (ctas || []).forEach((c) => {
    if (c.type === 'checkout' && links.checkout) {
      wrap.append(el('a', { class: 'btn btn-outline', href: links.checkout, target: '_blank', rel: 'noopener' }, c.label));
    } else if (c.type === 'whatsapp' && links.whatsapp) {
      wrap.append(el('a', { class: 'btn btn-outline', href: links.whatsapp, target: '_blank', rel: 'noopener' }, c.label));
    } else if (typeof onAction === 'function') {
      const phrase = c.kind === 'book' ? 'book a viewing'
        : c.kind === 'quote' ? 'request a callback'
          : c.kind === 'whatsapp' ? 'whatsapp an advisor' : c.label;
      wrap.append(el('button', { type: 'button', class: 'btn btn-outline', onClick: () => onAction(phrase) }, c.label));
    }
  });
  return wrap.childElementCount ? wrap : null;
}

export function renderWaLink(link) {
  if (!link) return null;
  return el('div', { class: 'fn-cta-row' },
    el('a', { class: 'btn btn-solid', href: link, target: '_blank', rel: 'noopener' }, 'Open WhatsApp →'));
}

/** renderLinks([{label, href}]) — plain button-links (e.g. deep-link to another agent) */
export function renderLinks(links) {
  if (!links || !links.length) return null;
  const wrap = el('div', { class: 'fn-cta-row' });
  links.forEach((l) => wrap.append(
    el('a', { class: 'btn btn-outline', href: l.href, target: '_blank', rel: 'noopener' }, l.label),
  ));
  return wrap;
}

/**
 * renderCheckout({ item, discount, total, offer }, { onAction })
 * The e-commerce "cart / checkout" card. Prices come from config.
 */
export function renderCheckout(co, opts = {}) {
  const { onAction } = opts;
  if (!co || !co.item) return null;
  const L = co.item;
  const grid = el('div', { class: 'ml-order__grid' });
  grid.append(row('Item', `${L.title}${L.category ? ` · ${L.category}` : ''}`));
  grid.append(row('Price', L.priceLabel || money0(L.price)));
  if (co.discount) grid.append(row(co.offer ? co.offer.name : 'Discount', `− ${money0(co.discount)}`));
  grid.append(row('Free shipping', 'Applied (first order)'));
  grid.append(row('Order total', money0(co.total)));

  const actions = el('div', { class: 'ml-order__actions' });
  if (typeof onAction === 'function') {
    actions.append(el('button', { type: 'button', class: 'btn btn-solid', onClick: () => onAction('complete checkout') }, 'Complete checkout'));
    actions.append(el('button', { type: 'button', class: 'btn btn-outline', onClick: () => onAction('keep looking') }, 'Keep looking'));
  }

  return el('article', { class: 'ml-order ml-order--checkout' },
    el('div', { class: 'ml-order__thumb', 'aria-hidden': 'true', style: { background: `linear-gradient(150deg, ${ACCENT} 0%, ${ACCENT}bb 100%)` } }, '🛍'),
    el('div', { class: 'ml-order__body' },
      el('div', { class: 'ml-order__head' }, el('h4', { class: 'ml-order__id' }, 'Your cart')),
      grid,
      el('p', { class: 'ml-order__note' }, 'Demo Mode — no real payment is taken at checkout.'),
      actions.childElementCount ? actions : null));
}
