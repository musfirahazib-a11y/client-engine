/* ===========================================================
   MusfirahLoom — AI Agent Platform
   repositories/discountRepo.js

   Demo-only incentive logic for cart recovery. The point of
   this module is NOT to hand out coupons — it is to pick the
   *smallest effective* incentive for a given objection and be
   able to explain why. It never auto-selects the biggest
   discount.
=========================================================== */

const SHIPPING_ESTIMATE = 6; // flat demo shipping cost used for "free shipping" value

export const INCENTIVES = {
  none: { id: 'none', label: 'No incentive', kind: 'none' },
  freeship: { id: 'freeship', label: 'Free shipping', kind: 'shipping' },
  pct10: { id: 'pct10', label: '10% discount', kind: 'percent', percent: 10 },
  pct15: { id: 'pct15', label: '15% discount', kind: 'percent', percent: 15 },
  bundle: { id: 'bundle', label: 'Bundle offer', kind: 'bundle' },
};

function round(n) {
  return Math.round(n * 100) / 100;
}

/** applyIncentive(incentiveId, cart) -> { estimatedValue, resultingCartValue } */
export function applyIncentive(incentiveId, cart) {
  const total = Number(cart?.total || 0);
  const subtotal = Number(cart?.subtotal || total);
  const inc = INCENTIVES[incentiveId] || INCENTIVES.none;

  if (inc.kind === 'shipping') {
    const value = subtotal >= 75 ? 0 : SHIPPING_ESTIMATE;
    return { estimatedValue: value, resultingCartValue: round(total) };
  }
  if (inc.kind === 'percent') {
    const value = round(subtotal * (inc.percent / 100));
    return { estimatedValue: value, resultingCartValue: round(total - value) };
  }
  if (inc.kind === 'bundle') {
    const value = round(Math.min(20, subtotal * 0.08));
    return { estimatedValue: value, resultingCartValue: round(total - value) };
  }
  return { estimatedValue: 0, resultingCartValue: round(total) };
}

/**
 * selectIncentive(cart) -> {
 *   incentive: INCENTIVES.*, reason, estimatedValue, resultingCartValue
 * }
 * Deterministic: objection first, then cart value guardrails.
 */
export function selectIncentive(cart) {
  const reason = String(cart?.abandonmentReason || '').toLowerCase();
  const total = Number(cart?.total || 0);
  const categories = new Set((cart?.items || []).map((i) => i.category));

  let id = 'pct10';
  let why = 'A modest 10% discount is a proportionate nudge when no stronger signal is present.';

  if (reason.includes('shipping')) {
    id = 'freeship';
    why = 'The stored objection is shipping cost, so free shipping addresses it directly while protecting product margin.';
  } else if (reason.includes('price') || reason.includes('expensive')) {
    if (total >= 250) {
      id = 'pct15';
      why = `The cart is $${total} and the objection is price — a 15% discount is justified because the recovered revenue far outweighs the concession.`;
    } else if (total >= 80) {
      id = 'pct10';
      why = `The objection is price on a $${total} cart — 10% is enough to tip the decision without over-discounting.`;
    } else {
      id = 'freeship';
      why = `The cart is only $${total}; a percentage discount would erode margin, so lead with free shipping instead.`;
    }
  } else if (reason.includes('comparing')) {
    id = 'pct10';
    why = 'The customer is comparing options — a small, time-boxed 10% discount tips the comparison without a deep concession.';
  } else if (reason.includes('more time') || reason.includes('distraction')) {
    id = 'none';
    why = 'There was no price objection — the customer simply got interrupted. A gentle reminder recovers this without any discount.';
  } else if (reason.includes('unsure') || reason.includes('sizing') || reason.includes('uncertain')) {
    id = 'none';
    why = 'This is a confidence problem, not a price problem. Reassurance and product detail recover it better than a coupon.';
  } else if (reason.includes('payment')) {
    id = 'none';
    why = 'The blocker is the payment step, not the price. Fix the payment path — a discount would not help and loses margin.';
  } else if (categories.size >= 2 && total >= 100) {
    id = 'bundle';
    why = 'The cart spans multiple categories — a bundle offer raises perceived value without a straight discount.';
  }

  const { estimatedValue, resultingCartValue } = applyIncentive(id, cart);
  return {
    incentive: INCENTIVES[id],
    reason: why,
    estimatedValue,
    resultingCartValue,
  };
}

/** short label used in cards / summaries */
export function incentiveLabel(incentiveId) {
  return (INCENTIVES[incentiveId] || INCENTIVES.none).label;
}
