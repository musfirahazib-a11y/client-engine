/* ===========================================================
   MusfirahLoom — AI Agent Platform
   repositories/cartRecoveryRepo.js

   Read access to the mock abandoned-cart set + demo recovery
   state (contacted / engaged / recovered) persisted to
   localStorage so a demo survives reloads and Reset Demo can
   clear it. No network calls.
=========================================================== */
import { ABANDONED_CARTS } from '../../data/abandonedCarts.js';
import { selectIncentive } from './discountRepo.js';
import { bus } from '../core/events.js';

const KEY = 'ml.agents.recovery';

/* ---------- persistence ---------- */

function readState() {
  try {
    const obj = JSON.parse(localStorage.getItem(KEY) || '{}');
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    return {};
  }
}

function writeState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* private mode / quota — in-memory result still returned */
  }
  bus.emit('recovery:change', state);
  return state;
}

export function getState() {
  return readState();
}

export function resetRecoveryState() {
  writeState({});
  return {};
}

/* ---------- ids ---------- */

export function normalizeId(raw) {
  const s = String(raw || '').toUpperCase();
  const m = s.match(/CART[-\s]?(\d{3,6})/) || s.match(/\b(\d{4,6})\b/);
  return m ? `CART-${m[1]}` : null;
}

/* ---------- merged view (base data + demo overrides) ---------- */

function merge(cart) {
  const ov = readState()[cart.cartId] || {};
  return { ...cart, ...ov };
}

export function effectiveStatus(cart) {
  return merge(cart).recoveryStatus || cart.recoveryStatus || 'abandoned';
}

export function listCarts({ status = null, limit = null } = {}) {
  let list = ABANDONED_CARTS.map(merge);
  if (status) {
    const wanted = Array.isArray(status) ? status : [status];
    list = list.filter((c) => wanted.includes(c.recoveryStatus));
  }
  list = list.sort((a, b) => new Date(b.lastActivityAt) - new Date(a.lastActivityAt));
  return limit ? list.slice(0, limit) : list;
}

export function getCart(cartId) {
  const id = normalizeId(cartId);
  if (!id) return null;
  const base = ABANDONED_CARTS.find((c) => c.cartId.toUpperCase() === id);
  return base ? merge(base) : null;
}

export function getByCustomer(idOrName) {
  const key = String(idOrName || '').toLowerCase();
  if (!key) return [];
  return ABANDONED_CARTS
    .filter((c) => c.customerId.toLowerCase() === key || c.customerName.toLowerCase() === key)
    .map(merge);
}

/* ---------- opportunity scoring ---------- */

const REASON_WEIGHT = {
  'checkout distraction': 40,
  'shipping cost': 30,
  price: 22,
  'comparing options': 16,
  'payment concern': 14,
  'sizing uncertainty': 10,
  'unsure about product': 10,
  'needs more time': 8,
};

const SEGMENT_WEIGHT = {
  VIP: 60, returning: 30, 'at-risk': 22, new: 12, 'one-time': 6,
};

const STATUS_ADJUST = {
  abandoned: 0, engaged: -8, contacted: -30, recovered: -10000, expired: -10000,
};

export function opportunityScore(cart) {
  const c = merge(cart);
  let s = Number(c.total || 0);
  const hoursAgo = (Date.now() - new Date(c.lastActivityAt).getTime()) / 3600000;
  s += Math.max(0, 48 - hoursAgo) * 1.5; // recency bonus, decays over ~48h
  s += REASON_WEIGHT[c.abandonmentReason] ?? 10;
  s += SEGMENT_WEIGHT[c.customerSegment] ?? 10;
  s += STATUS_ADJUST[effectiveStatus(c)] ?? 0;
  return Math.round(s);
}

export function priorityLabel(score) {
  if (score >= 280) return 'High';
  if (score >= 190) return 'Medium';
  return 'Low';
}

export function topOpportunities(limit = 4) {
  return ABANDONED_CARTS
    .map(merge)
    .filter((c) => ['abandoned', 'contacted', 'engaged'].includes(effectiveStatus(c)))
    .map((c) => ({ cart: c, score: opportunityScore(c) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/* ---------- analysis ---------- */

export function recoveryOpportunity(cart) {
  const c = merge(cart);
  const itemCount = (c.items || []).reduce((n, i) => n + (i.qty || 1), 0);
  const categories = [...new Set((c.items || []).map((i) => i.category))];
  const pick = selectIncentive(c);
  const score = opportunityScore(c);

  return {
    cartId: c.cartId,
    value: Number(c.total || 0),
    itemCount,
    categories,
    segment: c.customerSegment,
    likelyObjection: c.abandonmentReason,
    status: effectiveStatus(c),
    score,
    priority: priorityLabel(score),
    recommendedAction: pick.incentive.label,
    incentive: pick.incentive,
    incentiveReason: pick.reason,
    estimatedIncentiveValue: pick.estimatedValue,
    potentialRecoveredRevenue: pick.resultingCartValue,
  };
}

/* ---------- mutations (demo only) ---------- */

function setStatus(cartId, patch) {
  const id = normalizeId(cartId);
  const base = ABANDONED_CARTS.find((c) => c.cartId.toUpperCase() === id);
  if (!base) return null;
  const state = readState();
  state[base.cartId] = { ...(state[base.cartId] || {}), ...patch };
  writeState(state);
  return { ...base, ...state[base.cartId] };
}

export function markContacted(cartId, { incentive = null, campaignRef = null } = {}) {
  return setStatus(cartId, {
    recoveryStatus: 'contacted',
    incentive,
    campaignRef: campaignRef || `RCV-${Math.floor(10000 + Math.random() * 89999)}`,
    contactedAt: new Date().toISOString(),
  });
}

export function markEngaged(cartId) {
  return setStatus(cartId, { recoveryStatus: 'engaged', engagedAt: new Date().toISOString() });
}

export function markRecovered(cartId, { method = null, revenue = null } = {}) {
  const cart = getCart(cartId);
  const rev = revenue != null ? revenue : Number(cart?.total || 0);
  return setStatus(cartId, {
    recoveryStatus: 'recovered',
    recoveredMethod: method || 'no incentive',
    recoveredRevenue: rev,
    recoveredAt: new Date().toISOString(),
  });
}

/* ---------- portfolio metrics ---------- */

export function metrics() {
  const carts = ABANDONED_CARTS.map(merge);
  const open = carts.filter((c) => ['abandoned', 'contacted', 'engaged'].includes(effectiveStatus(c)));
  const recovered = carts.filter((c) => effectiveStatus(c) === 'recovered');
  const expired = carts.filter((c) => effectiveStatus(c) === 'expired');

  const abandonedValue = open.reduce((s, c) => s + Number(c.total || 0), 0);
  const recoveredRevenue = recovered.reduce((s, c) => s + Number(c.recoveredRevenue ?? c.total ?? 0), 0);
  const recoverable = open.length + recovered.length + expired.length;
  const potential = open.reduce((s, c) => s + selectIncentive(c).resultingCartValue, 0);

  return {
    abandonedCarts: open.length,
    abandonedValue: Math.round(abandonedValue),
    recoveredCarts: recovered.length,
    recoveredRevenue: Math.round(recoveredRevenue),
    expiredCarts: expired.length,
    recoveryRate: recoverable ? Math.round((recovered.length / recoverable) * 100) : 0,
    avgAbandonedValue: open.length ? Math.round(abandonedValue / open.length) : 0,
    potentialRecovery: Math.round(potential),
  };
}
