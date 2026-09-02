/* ===========================================================
   MusfirahLoom — AI Agent Platform
   agents/supportAgent.js  ·  AGENT #2 (fully interactive)

   AI Customer Support + Order/Returns Agent.

   Same architecture as salesAgent.js: an ordered intent matcher
   chain via createAgent(). Reads go through orderRepo / kbRepo /
   productRepo; the one write (a demo return) goes through
   returnRepo. Analytics events + success logs are declared on
   the reply (`events`, `log`) and fired by agent.entry.js, so
   this module stays free of DOM, storage and analytics imports.

   Reply shape used here:
   { text, order?, returnCard?, handoff?, quickReplies?,
     events?: [{name, props}], log?: {event, props}, meta? }
=========================================================== */
import { createAgent } from './baseAgent.js';
import * as orderRepo from '../repositories/orderRepo.js';
import * as returnRepo from '../repositories/returnRepo.js';
import * as kbRepo from '../repositories/kbRepo.js';
import * as productRepo from '../repositories/productRepo.js';

/* ---------- parsing helpers ---------- */

const ORDER_RE = /\bML[-\s]?(\d{4,6})\b/i;
const RETURN_RE = /\bRET[-\s]?(\d{4,6})\b/i;

function extractOrderId(text) {
  const s = String(text || '');
  let m = s.match(ORDER_RE);
  if (m) return `ML-${m[1]}`;
  m = s.match(/\b(\d{5})\b/); // bare 5-digit number, e.g. "10482"
  return m ? `ML-${m[1]}` : null;
}

function fmt(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return String(iso || '');
  }
}

const CONFIRM_RE =
  /^\s*(yes|yep|yeah|ya|sure|ok(ay)?|please|please do|do it|go ahead|proceed|confirm|correct|that'?s right|start (the |a )?return|create (the )?return|begin (the |a )?return|i want to return it|return it|let'?s do it)\b/i;

const HANDOFF_CONFIRM_RE =
  /^\s*(yes|yep|yeah|sure|ok(ay)?|please|do it|go ahead|confirm|connect me|request human support|put me through|transfer me)\b/i;

/* ---------- shared handlers (also called by provide_order_id) ---------- */

function notFound(orderId, forWhat) {
  return {
    text:
      `I could not find an order matching ${orderId} in the demo system. ` +
      `Please double-check the number — it looks like "ML-10482". ` +
      `If it still will not match, I can connect you with a human.`,
    quickReplies: ['Try another number', 'Talk to a human'],
    events: [{ name: 'order_lookup', props: { found: false, query: orderId, forWhat } }],
  };
}

function orderSummaryText(o) {
  const parts = [`Order ${o.orderId} is currently "${o.status}".`];
  if (o.status === 'Delivered') parts.push(`It was delivered on ${fmt(o.estimatedDelivery)}.`);
  else if (o.status === 'Cancelled') parts.push('This order was cancelled.');
  else parts.push(`Estimated delivery ${fmt(o.estimatedDelivery)}.`);
  if (o.trackingNumber) parts.push(`Tracking ${o.trackingNumber} with ${o.shippingCarrier}.`);
  return parts.join(' ');
}

function handleOrderStatus(orderId, ctx) {
  const o = orderRepo.getById(orderId);
  if (!o) {
    ctx.awaitingOrderIdFor = 'status';
    return notFound(orderId, 'status');
  }
  ctx.lastOrderId = o.orderId;
  ctx.awaitingOrderIdFor = null;
  const eligible = returnRepo.checkEligibility(o).eligible;

  return {
    text: orderSummaryText(o),
    order: o,
    quickReplies: [
      o.trackingNumber ? 'Track this package' : null,
      eligible ? 'Start a return' : null,
      'Talk to a human',
    ].filter(Boolean),
    events: [
      { name: 'order_lookup', props: { found: true, orderId: o.orderId, status: o.status } },
      { name: 'order_status_viewed', props: { orderId: o.orderId, status: o.status } },
    ],
  };
}

function handleTracking(orderId, ctx) {
  const o = orderRepo.getById(orderId);
  if (!o) {
    ctx.awaitingOrderIdFor = 'tracking';
    return notFound(orderId, 'tracking');
  }
  ctx.lastOrderId = o.orderId;
  ctx.awaitingOrderIdFor = null;

  if (!o.trackingNumber) {
    const why = o.status === 'Processing'
      ? 'it has not shipped yet — a tracking number appears once it leaves the warehouse'
      : o.status === 'Cancelled'
        ? 'this order was cancelled, so there is no shipment to track'
        : 'a tracking number has not been assigned yet';
    return {
      text: `There is no tracking for ${o.orderId} yet — ${why}.`,
      order: o,
      quickReplies: ['Check order status', 'Talk to a human'],
      events: [{ name: 'tracking_viewed', props: { orderId: o.orderId, hasTracking: false } }],
    };
  }

  return {
    text:
      `${o.orderId} is with ${o.shippingCarrier}. Tracking number ${o.trackingNumber}. ` +
      `Latest status: ${o.status}. Estimated delivery ${fmt(o.estimatedDelivery)}. ` +
      `(Demo tracking — no real carrier is contacted.)`,
    order: o,
    quickReplies: [
      returnRepo.checkEligibility(o).eligible ? 'Start a return' : null,
      'Talk to a human',
    ].filter(Boolean),
    events: [{ name: 'tracking_viewed', props: { orderId: o.orderId, hasTracking: true } }],
  };
}

function handleReturnEligibility(orderId, ctx) {
  const o = orderRepo.getById(orderId);
  if (!o) {
    ctx.awaitingOrderIdFor = 'return';
    return {
      text:
        `I could not find ${orderId} in the demo system — can you double-check the order number? ` +
        `It looks like "ML-10482".`,
      quickReplies: ['Try another number', 'Talk to a human'],
      events: [{ name: 'order_lookup', props: { found: false, query: orderId, forWhat: 'return' } }],
    };
  }
  ctx.lastOrderId = o.orderId;
  ctx.awaitingOrderIdFor = null;
  ctx.awaitingHandoff = false;

  const existing = returnRepo.getReturnByOrder(o.orderId);
  if (existing) {
    ctx.pendingReturnOrderId = null;
    return {
      text: `There is already a demo return on file for ${o.orderId} — reference ${existing.ref}, status "${existing.status}".`,
      returnCard: existing,
      quickReplies: ['Check return status', 'Talk to a human'],
      events: [{ name: 'return_eligibility_checked', props: { orderId: o.orderId, eligible: false, reason: 'existing' } }],
    };
  }

  const elig = returnRepo.checkEligibility(o);
  const lines = [
    `Return check for ${o.orderId}:`,
    elig.eligible ? `Eligible — ${elig.reason}` : `Not eligible — ${elig.reason}`,
    `Return window: ${elig.windowDays} days${elig.deadline ? ` (through ${fmt(elig.deadline)})` : ''}.`,
    `Next step: ${elig.nextStep}`,
  ];

  if (elig.eligible) {
    ctx.pendingReturnOrderId = o.orderId;
    return {
      text: lines.join('\n'),
      order: o,
      quickReplies: ['Yes, start the return', 'Not now', 'Talk to a human'],
      events: [{ name: 'return_eligibility_checked', props: { orderId: o.orderId, eligible: true } }],
    };
  }

  ctx.pendingReturnOrderId = null;
  return {
    text: lines.join('\n'),
    order: o,
    quickReplies: ['Talk to a human', 'Check a different order'],
    events: [{ name: 'return_eligibility_checked', props: { orderId: o.orderId, eligible: false } }],
  };
}

/* ---------- intents ---------- */

const intents = [
  {
    id: 'greeting',
    match: (text, ctx, history) => {
      if (ctx.greeted) return false;
      if (extractOrderId(text)) return false;
      const isGreetingWord =
        /^\s*(hi|hello|hey|yo|hiya|howdy|greetings|good (morning|afternoon|evening)|hi there|hey there|help|are you there|is anyone there)[\s!.?]*$/i.test(text);
      if (isGreetingWord) return true;
      // any concrete support signal -> let a specific intent handle it
      const hasSignal =
        /\b(return|refund|track|tracking|shipping|shipp|ship|delivery|deliver|order|package|parcel|damaged|broken|wrong|human|agent|cancel|exchange|material|made of|gold|silver|leather|size|sizing|care|clean|payment|pay|card|faq|international|warranty|gift|engrav|customi)\b/i.test(text);
      if (hasSignal) return false;
      // first contact with nothing actionable -> a friendly menu beats a cold fallback
      return history.filter((m) => m.role === 'user').length <= 1;
    },
    run: (text, ctx) => {
      ctx.greeted = true;
      return {
        text:
          `Hi! I can help with an order, delivery or tracking, returns and exchanges, refunds, ` +
          `shipping, or product questions — and I can bring in a human if you need one. ` +
          `What can I help you with?`,
        quickReplies: ['Where is my order?', 'I want to return something', 'How long does shipping take?'],
      };
    },
  },

  {
    id: 'create_handoff',
    match: (text, ctx) =>
      (ctx.awaitingHandoff && HANDOFF_CONFIRM_RE.test(text))
      || /^\s*request human support\s*$/i.test(text),
    run: (text, ctx) => {
      ctx.awaitingHandoff = false;
      const ref = `HS-${Math.floor(10000 + Math.random() * 89999)}`;
      return {
        text:
          `Done — this conversation is queued for a human support specialist (demo). ` +
          `Reference ${ref}. In the real system they would pick it up here or by email; ` +
          `nothing has actually been sent.`,
        handoff: { stage: 'confirmed', ref, orderId: ctx.lastOrderId || null },
        quickReplies: ['Anything else'],
        events: [{ name: 'human_handoff_confirmed', props: { ref, orderId: ctx.lastOrderId || null } }],
        log: { event: 'human_handoff', props: { ref, orderId: ctx.lastOrderId || null } },
      };
    },
  },

  {
    id: 'create_return',
    match: (text, ctx) => {
      if (!CONFIRM_RE.test(text)) return false;
      if (ctx.pendingReturnOrderId) return true;
      return Boolean(ctx.lastOrderId && returnRepo.getReturnByOrder(ctx.lastOrderId));
    },
    run: (text, ctx) => {
      const orderId = ctx.pendingReturnOrderId || ctx.lastOrderId;
      const existing = returnRepo.getReturnByOrder(orderId);
      if (existing) {
        ctx.pendingReturnOrderId = null;
        return {
          text: `That return is already in — reference ${existing.ref} for ${orderId}, status "${existing.status}". This is a demo request.`,
          returnCard: existing,
          quickReplies: ['Check return status', 'Anything else'],
        };
      }

      const o = orderRepo.getById(orderId);
      const elig = returnRepo.checkEligibility(o);
      if (!o || !elig.eligible) {
        ctx.pendingReturnOrderId = null;
        return {
          text: o
            ? `Actually, ${orderId} is not eligible for a return — ${elig.reason}`
            : `I do not have an order to attach that return to. What is the order number?`,
          quickReplies: ['Talk to a human'],
        };
      }

      const rec = returnRepo.createReturn({ orderId, reason: ctx.returnReason || 'Customer-initiated return (demo)' });
      ctx.pendingReturnOrderId = null;
      ctx.returnReason = null;
      return {
        text:
          `Your demo return request has been created. No carrier or support team has been ` +
          `contacted — this is a demo.`,
        returnCard: rec,
        quickReplies: ['Check return status', 'Anything else'],
        events: [
          { name: 'return_started', props: { orderId } },
          { name: 'return_created', props: { ref: rec.ref, orderId } },
        ],
        log: { event: 'return_created', props: { ref: rec.ref, orderId } },
      };
    },
  },

  {
    id: 'provide_order_id',
    match: (text, ctx) => Boolean(ctx.awaitingOrderIdFor) && extractOrderId(text) != null,
    run: (text, ctx) => {
      const id = extractOrderId(text);
      const forWhat = ctx.awaitingOrderIdFor;
      ctx.awaitingOrderIdFor = null;
      if (forWhat === 'tracking') return handleTracking(id, ctx);
      if (forWhat === 'return') return handleReturnEligibility(id, ctx);
      return handleOrderStatus(id, ctx);
    },
  },

  {
    id: 'human_handoff',
    match: (text) =>
      /\b(speak|talk|chat) (to|with) (a |an )?(human|person|someone|agent|representative|rep|advisor|specialist)\b/i.test(text)
      || /\b(connect|transfer|put) me (through|to)\b/i.test(text)
      || /\b(real|live) (person|human|agent)\b/i.test(text)
      || /\b(customer (service|support)) (rep|agent|team|person|line)\b/i.test(text)
      || /\bneed (a|an) (human|agent|person)\b/i.test(text)
      || /\bthis (is ?n'?t|is not) (helping|working)\b/i.test(text)
      || /\byou'?re not helping\b/i.test(text),
    run: (text, ctx) => {
      ctx.awaitingHandoff = true;
      ctx.pendingReturnOrderId = null;
      const oid = extractOrderId(text) || ctx.lastOrderId || null;
      if (oid) ctx.lastOrderId = oid;
      return {
        text: 'Absolutely. I can hand this conversation to a human support specialist. Want me to do that now?',
        handoff: { stage: 'offer', orderId: oid },
        quickReplies: ['Request human support', 'Not yet'],
        events: [{ name: 'human_handoff_requested', props: { orderId: oid } }],
      };
    },
  },

  {
    id: 'damaged_or_wrong',
    match: (text) =>
      /\b(damaged|broken|cracked|faulty|defective|smashed|shattered|snapped)\b/i.test(text)
      || /\b(wrong|incorrect|different) (item|product|thing|order|one)\b/i.test(text)
      || /\b(sent|shipped) me the wrong\b/i.test(text)
      || /\bnot what i ordered\b/i.test(text)
      || /\bmissing (item|piece|part)\b/i.test(text)
      || /\b(item|order|necklace|package|parcel|it) (arrived|came|is|was) (damaged|broken)\b/i.test(text),
    run: (text, ctx) => {
      const oid = extractOrderId(text) || ctx.lastOrderId || null;
      if (oid && orderRepo.exists(oid)) ctx.lastOrderId = oid;
      ctx.issueType = /\b(wrong|incorrect|different|not what)\b/i.test(text) ? 'wrong item' : 'damaged item';
      return {
        text:
          `I am sorry your order arrived with a problem${oid ? ` (${oid})` : ''} — that should not happen. ` +
          `I can send a free replacement, start a return for a refund, or put you through to a specialist. ` +
          `Which would you prefer?`,
        order: oid && orderRepo.exists(oid) ? orderRepo.getById(oid) : undefined,
        quickReplies: ['Send a replacement', 'Start a return', 'Talk to a human'],
        events: [{ name: 'issue_reported', props: { type: ctx.issueType, orderId: oid } }],
      };
    },
  },

  {
    id: 'replacement',
    match: (text) => /\b(send|want|need|request) (me )?(a )?replacement\b/i.test(text) || /\breplace (it|the item|my order|this)\b/i.test(text),
    run: (text, ctx) => {
      const oid = extractOrderId(text) || ctx.lastOrderId || null;
      const ref = `REP-${Math.floor(10000 + Math.random() * 89999)}`;
      return {
        text:
          `A demo replacement request has been logged${oid ? ` for ${oid}` : ''}. Reference ${ref}, ` +
          `status "Awaiting Review". This is a demo — nothing has been shipped and no team has been contacted.`,
        handoff: { stage: 'replacement', ref, orderId: oid },
        quickReplies: ['Anything else', 'Talk to a human'],
        events: [{ name: 'replacement_requested', props: { ref, orderId: oid } }],
        log: { event: 'replacement_requested', props: { ref, orderId: oid } },
      };
    },
  },

  {
    id: 'return_status',
    match: (text) =>
      RETURN_RE.test(text)
      || /\b(return|rma) (status|update|progress)\b/i.test(text)
      || /\bstatus of (my )?return\b/i.test(text)
      || /\bwhere('?s| is) my return\b/i.test(text),
    run: (text, ctx) => {
      let rec = null;
      const rm = text.match(RETURN_RE);
      if (rm) rec = returnRepo.getReturnByRef(`RET-${rm[1]}`);
      if (!rec) {
        const oid = extractOrderId(text) || ctx.lastOrderId;
        if (oid) rec = returnRepo.getReturnByOrder(oid);
      }
      if (!rec) {
        return {
          text:
            `I could not find a demo return matching that. A return reference looks like "RET-58241" — ` +
            `or give me the order number and I will look it up.`,
          quickReplies: ['Talk to a human'],
        };
      }
      return {
        text:
          `Demo return ${rec.ref} for ${rec.orderId}: status "${rec.status}", created ${fmt(rec.createdAt)}. ` +
          `Next, the team reviews it within 2 business days (demo).`,
        returnCard: rec,
        quickReplies: ['Anything else', 'Talk to a human'],
        events: [{ name: 'return_status_viewed', props: { ref: rec.ref } }],
      };
    },
  },

  {
    id: 'return_eligibility',
    match: (text) =>
      /\bcan i (return|exchange|send back)\b/i.test(text)
      || /\b(is|are) (my order|it|this|they) eligible\b/i.test(text)
      || /\breturn polic(y|ies)\b/i.test(text)
      || /\beligible for (a )?return\b/i.test(text)
      || /\b(want|need|like|trying) to (return|exchange|send back)\b/i.test(text)
      || /\breturn (my |this |the )?(order|item|package|purchase)\b/i.test(text)
      || /\b(start|begin|open) (a |the )?return\b/i.test(text)
      || /\b(want|need|requesting|asking for) a refund\b/i.test(text)
      || /\bhow do i (return|get a refund)\b/i.test(text),
    run: (text, ctx) => {
      const orderId = extractOrderId(text) || ctx.lastOrderId;
      if (!orderId) {
        // no order in play — answer the policy from the KB and ask for a number
        const faq = kbRepo.byId('ret-window');
        ctx.awaitingOrderIdFor = 'return';
        return {
          text:
            `${faq ? faq.answer : 'Unworn items can be returned within 30 days of delivery.'}\n\n` +
            `Which order is it? The number looks like "ML-10482".`,
          quickReplies: ['It is order ML-10482', 'Talk to a human'],
          events: [{ name: 'faq_viewed', props: { topic: 'returns', faqId: 'ret-window' } }],
        };
      }
      return handleReturnEligibility(orderId, ctx);
    },
  },

  {
    id: 'refund',
    match: (text) =>
      /\b(when|where|how long|status).{0,24}refund\b/i.test(text)
      || /\brefund (status|timing|time|update|yet)\b/i.test(text)
      || /\bstill waiting (on|for) (my )?refund\b/i.test(text)
      || /\bhaven'?t (got|received|had) (my )?refund\b/i.test(text)
      || /\bmoney back yet\b/i.test(text),
    run: (text, ctx) => {
      const orderId = extractOrderId(text) || ctx.lastOrderId || null;
      const o = orderId ? orderRepo.getById(orderId) : null;
      const ret = orderId ? returnRepo.getReturnByOrder(orderId) : null;

      if (o && (o.paymentStatus === 'Refunded' || o.status === 'Cancelled')) {
        return {
          text:
            `${o.orderId} shows payment status "${o.paymentStatus}". Refunds go back to the original ` +
            `payment method and usually settle in 5–10 business days from when they are issued.`,
          order: o,
          quickReplies: ['Anything else', 'Talk to a human'],
          events: [{ name: 'refund_question', props: { orderId: o.orderId, state: o.paymentStatus } }],
        };
      }
      if (ret) {
        return {
          text:
            `Your demo return ${ret.ref} for ${ret.orderId} is "${ret.status}". Once a return is ` +
            `received and approved, the refund is issued within 3–5 business days, then another ` +
            `5–10 business days to appear on your statement.`,
          returnCard: ret,
          quickReplies: ['Check return status', 'Talk to a human'],
          events: [{ name: 'refund_question', props: { orderId: ret.orderId, returnRef: ret.ref } }],
        };
      }
      const faq = kbRepo.byId('ret-refund-timing');
      return {
        text: faq ? faq.answer : 'Refunds are issued within 3–5 business days of us receiving the item.',
        quickReplies: ['Check an order', 'Talk to a human'],
        events: [{ name: 'refund_question', props: { fromFaq: true } }],
      };
    },
  },

  {
    id: 'full_details',
    match: (text, ctx) =>
      (/\bfull (details|breakdown)\b/i.test(text)
        || /\bitemi[sz]ed\b/i.test(text)
        || /\bline items\b/i.test(text)
        || /\border (details|breakdown|summary)\b/i.test(text)
        || /\bwhat did i (order|buy)\b/i.test(text)
        || /\bwhat('?s| is) (in|on) (my )?order\b/i.test(text))
      && (extractOrderId(text) || ctx.lastOrderId),
    run: (text, ctx) => {
      const orderId = extractOrderId(text) || ctx.lastOrderId;
      const o = orderRepo.getById(orderId);
      if (!o) return notFound(orderId || 'that order', 'details');
      ctx.lastOrderId = o.orderId;
      const itemLines = (o.items || [])
        .map((i) => `  • ${i.qty} × ${i.name} — $${i.price.toFixed(2)}`)
        .join('\n');
      return {
        text:
          `${o.orderId} — placed ${fmt(o.orderDate)} for ${o.customerName}\n` +
          `${itemLines}\n` +
          `Subtotal $${o.subtotal.toFixed(2)} · Shipping $${o.shipping.toFixed(2)} · Total $${o.total.toFixed(2)}\n` +
          `Payment: ${o.paymentStatus} · Fulfilment: ${o.fulfillmentStatus} · Status: ${o.status}`,
        order: o,
        quickReplies: [
          o.trackingNumber ? 'Track this package' : null,
          returnRepo.checkEligibility(o).eligible ? 'Start a return' : null,
          'Talk to a human',
        ].filter(Boolean),
        events: [{ name: 'order_details_viewed', props: { orderId: o.orderId } }],
      };
    },
  },

  {
    id: 'tracking',
    match: (text) =>
      /\btrack(ing)?\b/i.test(text)
      || /\btracking (number|link|info|code|id)\b/i.test(text)
      || /\bwhere('?s| is) (my|the) (package|parcel|shipment)\b/i.test(text),
    run: (text, ctx) => {
      const orderId = extractOrderId(text) || ctx.lastOrderId;
      if (!orderId) {
        ctx.awaitingOrderIdFor = 'tracking';
        return {
          text: 'Sure — what is your order number? It looks like "ML-10482".',
          quickReplies: ['It is order ML-10482'],
        };
      }
      return handleTracking(orderId, ctx);
    },
  },

  {
    id: 'order_status',
    match: (text) =>
      extractOrderId(text) != null
      || /\bwhere('?s| is| are)?\s*(my|the)?\s*(order|package|parcel|delivery|shipment|stuff|purchase)\b/i.test(text)
      || /\bstatus of (my |the )?order\b/i.test(text)
      || /\bhas (my|the) order (shipped|dispatched|gone out|been sent|left)\b/i.test(text)
      || /\bwhen (will|does|is) (my|the) (order|package|delivery|parcel|it)\b.*\b(arrive|deliver|get here|come|here|ready)\b/i.test(text)
      || /\border (update|status)\b/i.test(text)
      || /\bis (my|the) order (on (its|the) way|coming|out for delivery)\b/i.test(text)
      || /\bdid my order ship\b/i.test(text),
    run: (text, ctx) => {
      const orderId = extractOrderId(text) || ctx.lastOrderId;
      if (!orderId) {
        ctx.awaitingOrderIdFor = 'status';
        return {
          text: 'Sure — what is your order number? It looks like "ML-10482".',
          quickReplies: ['It is order ML-10482'],
        };
      }
      return handleOrderStatus(orderId, ctx);
    },
  },

  {
    id: 'shipping_faq',
    match: (text) =>
      /\bhow long.*(ship|deliver|arrive|dispatch)\b/i.test(text)
      || /\bshipping (time|times|cost|price|fee|fees|options|take|take\?)\b/i.test(text)
      || /\bdo you (ship|deliver) (internationally|worldwide|to|abroad|overseas)\b/i.test(text)
      || /\binternational (shipping|delivery)\b/i.test(text)
      || /\b(delivery|dispatch) (time|times|estimate)\b/i.test(text)
      || /\bhow much (is |for )?(the )?(shipping|delivery|postage)\b/i.test(text)
      || /\bfree shipping\b/i.test(text)
      || /\bmy (package|parcel|order) is (delayed|late)\b/i.test(text),
    run: (text) => {
      const faq = kbRepo.bestAnswer(text) || kbRepo.byId('ship-times');
      return {
        text: faq.answer,
        quickReplies: ['Track my order', 'Anything else'],
        events: [{ name: 'faq_viewed', props: { topic: 'shipping', faqId: faq.id } }],
      };
    },
  },

  {
    id: 'product_question',
    match: (text) =>
      /\bwhat (material|metal|is it made)\b/i.test(text)
      || /\bis (it|this) (gold|silver|solid gold|real gold|plated|vermeil|waterproof|water resistant|hypoallergenic|nickel free)\b/i.test(text)
      || /\bwhat('?s| is) it made (of|from)\b/i.test(text)
      || /\bmade (of|from) what\b/i.test(text)
      || /\bcare (for|instructions|guide)\b/i.test(text)
      || /\bhow (do i|to) (clean|care for|look after|polish|wash)\b/i.test(text)
      || /\b(sizing|size guide|what size|runs (small|large|big)|fit)\b/i.test(text)
      || /\b(customi[sz]|engrav|personali[sz]|monogram)\b/i.test(text),
    run: async (text) => {
      const faq = kbRepo.bestAnswer(text)
        || kbRepo.byId(/\bcare|clean|polish\b/i.test(text) ? 'prod-care'
          : /\bsize|sizing|fit\b/i.test(text) ? 'prod-sizing'
            : /\bcustomi|engrav|personali|monogram\b/i.test(text) ? 'prod-custom'
              : 'prod-materials');

      // enrich with a catalog example if a material was named
      let extra = '';
      const materialWord = (text.toLowerCase().match(/\b(gold|silver|leather|wool|merino|ceramic|stainless)\b/) || [])[1];
      if (materialWord) {
        try {
          const products = await productRepo.all();
          const hit = products.find((p) => (p.tags || []).some((t) => t.toLowerCase() === materialWord));
          if (hit) extra = ` For example, the ${hit.title} (${hit.category}) is ${materialWord}.`;
        } catch { /* catalog optional */ }
      }

      return {
        text: faq.answer + extra,
        quickReplies: ['Anything else', 'Talk to a human'],
        events: [{ name: 'faq_viewed', props: { topic: 'product', faqId: faq.id } }],
      };
    },
  },

  {
    id: 'general_faq',
    match: (text) =>
      /\bcontact (support|you|a human)\b/i.test(text)
      || /\b(support|business|opening) hours\b/i.test(text)
      || /\b(cancel|change|amend) (my |the )?order\b/i.test(text)
      || /\bcan i cancel\b/i.test(text)
      || /\bgift (order|receipt|wrap|message|note)\b/i.test(text)
      || /\b(payment methods|how (do|can) i pay|what (cards|payment))\b/i.test(text)
      || /\bpayment (failed|declined)\b/i.test(text)
      || /\b(email|phone number) (address|for support)?\b/i.test(text),
    run: (text, ctx) => {
      const faq = kbRepo.bestAnswer(text, 2) || kbRepo.byId('gen-contact');
      // if it's a cancellation question and we know the order, add its state
      let extra = '';
      if (/\bcancel\b/i.test(text)) {
        const o = orderRepo.getById(extractOrderId(text) || ctx.lastOrderId);
        if (o) {
          extra = o.status === 'Processing'
            ? ` ${o.orderId} is still Processing, so a cancellation can be raised (demo).`
            : ` ${o.orderId} is "${o.status}", so it can no longer be cancelled — you could return it once delivered.`;
        }
      }
      return {
        text: faq.answer + extra,
        quickReplies: ['Talk to a human', 'Anything else'],
        events: [{ name: 'faq_viewed', props: { topic: faq.category.toLowerCase(), faqId: faq.id } }],
      };
    },
  },
];

/* ---------- fallback ---------- */

function fallback(text, ctx) {
  // try the knowledge base before giving up
  const faq = kbRepo.bestAnswer(text, 4);
  if (faq) {
    return {
      text: faq.answer,
      quickReplies: ['Talk to a human', 'Anything else'],
      events: [{ name: 'faq_viewed', props: { topic: faq.category.toLowerCase(), faqId: faq.id } }],
    };
  }
  return {
    text:
      `I can help with orders and delivery, tracking, returns and exchanges, refunds, shipping, ` +
      `payments and product questions — or connect you with a human. What do you need?`,
    quickReplies: ['Where is my order?', 'Start a return', 'Talk to a human'],
  };
}

export const supportAgent = createAgent({ id: 'support', intents, fallback });
export default supportAgent;
