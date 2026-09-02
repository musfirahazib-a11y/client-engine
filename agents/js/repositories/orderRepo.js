/* ===========================================================
   MusfirahLoom — AI Agent Platform
   repositories/orderRepo.js

   Read-only access to the mock order set. Demo Mode only — no
   network. In Phase 2 the bodies swap to a real store API and
   supportAgent does not change.
=========================================================== */
import { ORDERS } from '../../data/orders.js';

const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();

/** Accepts "ML-10482", "ml10482", "ML 10482", or "10482". */
export function normalizeId(raw) {
  const s = String(raw || '').toUpperCase();
  const m = s.match(/ML[-\s]?(\d{4,6})/) || s.match(/\b(\d{4,6})\b/);
  return m ? `ML-${m[1]}` : null;
}

export function getById(orderId) {
  const id = normalizeId(orderId);
  if (!id) return null;
  return ORDERS.find((o) => o.orderId.toUpperCase() === id) || null;
}

export function findByEmail(email) {
  const key = norm(email);
  if (!key) return [];
  return ORDERS.filter((o) => norm(o.email) === key);
}

export function findByName(name) {
  const key = norm(name);
  if (!key || key.length < 3) return [];
  return ORDERS.filter((o) => norm(o.customerName).includes(key));
}

export function recent(limit = 5) {
  return [...ORDERS]
    .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
    .slice(0, limit);
}

export function getStatus(orderId) {
  const o = getById(orderId);
  return o ? o.status : null;
}

export function getTracking(orderId) {
  const o = getById(orderId);
  if (!o) return null;
  return {
    orderId: o.orderId,
    status: o.status,
    trackingNumber: o.trackingNumber,
    shippingCarrier: o.shippingCarrier,
    estimatedDelivery: o.estimatedDelivery,
    hasTracking: Boolean(o.trackingNumber),
  };
}

export function exists(orderId) {
  return getById(orderId) != null;
}

export function all() {
  return ORDERS.slice();
}
