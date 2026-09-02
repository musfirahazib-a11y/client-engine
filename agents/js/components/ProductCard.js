/* ===========================================================
   MusfirahLoom — AI Agent Platform
   components/ProductCard.js

   Rich product card + a small comparison table, used inside
   agent chat bubbles (Sales, Upsell, Cart agents).

   No external image files: each product gets an on-brand
   monogram tile drawn from its title + category accent, so
   nothing can 404 during a client demo.
=========================================================== */
import { el, money } from '../core/dom.js';

const CATEGORY_ACCENT = {
  Fragrance: '#6E2C3B',
  Jewelry: '#7A6A33',
  Home: '#4A6157',
  Accessories: '#4C3A5E',
  Beauty: '#A9702F',
  Tech: '#3B4A5A',
};

function monogram(product) {
  const accent = CATEGORY_ACCENT[product.category] || '#6E2C3B';
  const words = String(product.title || '?')
    .split(/\s+/)
    .filter((w) => /[a-z]/i.test(w[0] || '')); // skip "14k", "0.5ct", "&" etc.
  const initials = (words.length ? words : [String(product.title || '?')])
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const tile = el('div', {
    class: 'ml-product__thumb',
    'aria-hidden': 'true',
    style: {
      background: `linear-gradient(150deg, ${accent} 0%, ${accent}cc 55%, ${accent}99 100%)`,
    },
  }, initials);
  return tile;
}

function stars(rating) {
  const r = Math.round(Number(rating) || 0);
  return '★★★★★'.slice(0, r) + '☆☆☆☆☆'.slice(0, 5 - r);
}

/**
 * renderProductCard(product, {
 *   reason,               // one-line "why this" explanation
 *   onAdd(product),       // add-to-cart handler
 *   onCompare(product),   // optional "compare" handler
 *   compact,              // tighter layout for multi-card rows
 * })
 */
export function renderProductCard(product, opts = {}) {
  const { reason, onAdd, onCompare, compact = false } = opts;

  const priceRow = el('div', { class: 'ml-product__pricerow' },
    el('span', { class: 'ml-product__price' }, money(product.price)),
    product.rating
      ? el('span', {
          class: 'ml-product__rating',
          title: `${product.rating} out of 5${product.reviews ? ` · ${product.reviews} reviews` : ''}`,
        }, `${stars(product.rating)} ${Number(product.rating).toFixed(1)}`)
      : null,
  );

  const actions = el('div', { class: 'ml-product__actions' });
  if (typeof onAdd === 'function') {
    actions.append(
      el('button', {
        type: 'button',
        class: 'btn btn-solid ml-product__add',
        onClick: () => onAdd(product),
      }, 'Add to cart'),
    );
  }
  if (typeof onCompare === 'function') {
    actions.append(
      el('button', {
        type: 'button',
        class: 'btn btn-outline ml-product__compare',
        onClick: () => onCompare(product),
      }, 'Compare'),
    );
  }

  return el('article', {
    class: `ml-product${compact ? ' ml-product--compact' : ''}`,
    dataset: { productId: product.id },
  },
    monogram(product),
    el('div', { class: 'ml-product__body' },
      el('span', { class: 'ml-product__cat' }, product.category || ''),
      el('h4', { class: 'ml-product__title' }, product.title || 'Untitled'),
      priceRow,
      reason
        ? el('p', { class: 'ml-product__reason' }, reason)
        : (product.blurb ? el('p', { class: 'ml-product__reason' }, product.blurb) : null),
      actions.childElementCount ? actions : null,
    ),
  );
}

/**
 * renderComparison([productA, productB], { onAdd })
 * Small spec table for "compare these" requests.
 */
export function renderComparison(products, opts = {}) {
  const { onAdd } = opts;
  const items = (products || []).slice(0, 3);
  if (items.length < 2) {
    return el('p', { class: 'ml-cmp__empty' }, 'I need at least two products to compare.');
  }

  const rows = [
    ['Price', (p) => money(p.price)],
    ['Category', (p) => p.category || '—'],
    ['Rating', (p) => (p.rating ? `${Number(p.rating).toFixed(1)} / 5` : '—')],
    ['Best for', (p) => (p.recipient || []).slice(0, 2).join(', ') || '—'],
    ['Style', (p) => (p.style || []).slice(0, 2).join(', ') || '—'],
    ['In stock', (p) => (p.stock > 0 ? 'Yes' : 'No')],
  ];

  const table = el('table', { class: 'ml-cmp' });
  const thead = el('tr', {}, el('th', { scope: 'col' }, ''));
  items.forEach((p) => thead.append(el('th', { scope: 'col' }, p.title)));
  table.append(el('thead', {}, thead));

  const tbody = el('tbody', {});
  rows.forEach(([label, fn]) => {
    const tr = el('tr', {}, el('th', { scope: 'row' }, label));
    items.forEach((p) => tr.append(el('td', {}, fn(p))));
    tbody.append(tr);
  });
  table.append(tbody);

  const wrap = el('div', { class: 'ml-cmp-wrap' }, table);

  if (typeof onAdd === 'function') {
    const addRow = el('div', { class: 'ml-cmp__actions' });
    items.forEach((p) => {
      addRow.append(
        el('button', {
          type: 'button',
          class: 'btn btn-outline',
          onClick: () => onAdd(p),
        }, `Add ${p.title.split(/\s+/)[0]}`),
      );
    });
    wrap.append(addRow);
  }
  return wrap;
}
