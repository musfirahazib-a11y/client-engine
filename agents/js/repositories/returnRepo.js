/* ===========================================================
   MusfirahLoom — AI Agent Platform
   repositories/returnRepo.js

   Demo returns. Eligibility is derived from the mock order's
   status / dates / payment. Created returns are stored in
   localStorage so a demo persists across reloads and Reset
   Demo can clear them. No carrier or support team is ever
   contacted.
=========================================================== */
import { bus } from '../core/events.js';

const KEY = 'ml.agents.returns';
const WINDOW_DAYS = 30;

const DAY = 86400000;

function read() {
  try {
    const arr = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function write(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* private mode / quota — in-memory result still returned */
  }
  bus.emit('returns:change', list.slice());
  return list;
}

function makeRef() {
  return `RET-${Math.floor(10000 + Math.random() * 89999)}`;
}

function daysSince(iso) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / DAY);
}

function fmt(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return String(iso || '');
  }
}

/**
 * checkEligibility(order) -> {
 *   eligible, reason, windowDays, deadline?, daysLeft?, nextStep
 * }
 */
export function checkEligibility(order) {
  if (!order) {
    return {
      eligible: false,
      reason: 'That order could not be found in the demo system.',
      windowDays: WINDOW_DAYS,
      nextStep: 'Double-check the order number (it looks like ML-10482).',
    };
  }

  if (order.status === 'Cancelled') {
    return {
      eligible: false,
      reason: 'This order was cancelled, so there is nothing to return.',
      windowDays: WINDOW_DAYS,
      nextStep: order.paymentStatus === 'Refunded'
        ? 'It was already refunded — refunds take 5–10 business days to appear.'
        : 'If you were charged, ask me about a refund.',
    };
  }

  if (['Processing', 'Shipped', 'In Transit', 'Out for Delivery', 'Delayed'].includes(order.status)) {
    return {
      eligible: false,
      reason: `This order is still "${order.status}" — a return can only start once it has been delivered.`,
      windowDays: WINDOW_DAYS,
      nextStep: 'Check back after delivery, or ask for a human if the order is wrong or damaged.',
    };
  }

  // Delivered
  const finalSale = (order.items || []).some((i) => i.finalSale);
  const days = daysSince(order.estimatedDelivery);
  const deadline = fmt(new Date(new Date(order.estimatedDelivery).getTime() + WINDOW_DAYS * DAY).toISOString());

  if (days != null && days > WINDOW_DAYS) {
    return {
      eligible: false,
      reason: `This order was delivered ${days} days ago, past the ${WINDOW_DAYS}-day return window (which ended ${deadline}).`,
      windowDays: WINDOW_DAYS,
      deadline,
      nextStep: 'Ask for a human if you think an exception should apply.',
    };
  }

  if (finalSale) {
    return {
      eligible: false,
      reason: 'This order contains a final-sale item, which cannot be returned unless it arrived faulty.',
      windowDays: WINDOW_DAYS,
      deadline,
      nextStep: 'If the item is damaged or faulty, tell me and I will arrange a replacement or refund.',
    };
  }

  return {
    eligible: true,
    reason: `Delivered ${days == null ? 'recently' : `${days} day${days === 1 ? '' : 's'} ago`} — within the ${WINDOW_DAYS}-day return window.`,
    windowDays: WINDOW_DAYS,
    deadline,
    daysLeft: days == null ? WINDOW_DAYS : Math.max(0, WINDOW_DAYS - days),
    nextStep: 'I can create a demo return for you now.',
  };
}

/** createReturn({ orderId, reason }) -> return record (with .duplicate if one already exists) */
export function createReturn({ orderId, reason } = {}) {
  const list = read();
  const existing = list.find((r) => r.orderId === orderId);
  if (existing) return { ...existing, duplicate: true };

  const rec = {
    ref: makeRef(),
    orderId,
    reason: reason || 'Customer-initiated return (demo)',
    status: 'Awaiting Review',
    createdAt: new Date().toISOString(),
    demo: true,
  };
  list.push(rec);
  write(list);
  return rec;
}

export function getReturnByOrder(orderId) {
  return read().find((r) => r.orderId === orderId) || null;
}

export function getReturnByRef(ref) {
  const key = String(ref || '').toUpperCase();
  return read().find((r) => r.ref.toUpperCase() === key) || null;
}

export function listReturns() {
  return read();
}

export function clearReturns() {
  write([]);
  return [];
}
