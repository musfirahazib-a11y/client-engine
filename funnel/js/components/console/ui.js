/* ===========================================================
   MusfirahLoom — AI Sales Funnel System
   components/console/ui.js  ·  shared console building blocks
=========================================================== */
import { el } from '../../../../agents/js/core/dom.js';

export function head(title, sub, ...right) {
  return el('div', { class: 'fc-sechead' },
    el('div', {}, el('h2', {}, title), sub ? el('p', {}, sub) : null),
    right.length ? el('div', { class: 'fc-sechead__right' }, ...right) : null);
}

export function tiles(items) {
  const grid = el('div', { class: 'fc-tiles' });
  items.forEach(([label, value, hint]) => {
    grid.append(el('div', { class: 'fc-tile' },
      el('span', { class: 'fc-tile__val' }, String(value)),
      el('span', { class: 'fc-tile__label' }, label),
      hint ? el('span', { class: 'fc-tile__hint' }, hint) : null));
  });
  return grid;
}

export function bar(pct, label, accent) {
  const clamped = Math.max(0, Math.min(100, Number(pct) || 0));
  return el('div', { class: 'fc-bar' },
    el('div', { class: 'fc-bar__track' },
      el('div', { class: 'fc-bar__fill', style: { width: `${clamped}%`, background: accent || 'var(--funnel)' } })),
    label ? el('span', { class: 'fc-bar__label' }, label) : null);
}

export function pill(text, tone) {
  return el('span', { class: `fc-pill fc-pill--${tone || 'neutral'}` }, text);
}

export function empty(text, actionLabel, onAction) {
  return el('div', { class: 'fc-empty' },
    el('p', {}, text),
    onAction ? el('button', { type: 'button', class: 'btn btn-outline', onClick: onAction }, actionLabel) : null);
}

export function usd(n) {
  return `$${Math.round(Number(n) || 0).toLocaleString()}`;
}

export function ago(iso) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '—';
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export const STATUS_TONE = {
  New: 'neutral', Contacted: 'info', Qualified: 'info',
  Hot: 'hot', Warm: 'warm', Cold: 'cold',
  Converted: 'good', Lost: 'muted',
};

export const CAT_TONE = { HOT: 'hot', WARM: 'warm', COLD: 'cold', UNQUALIFIED: 'muted' };
