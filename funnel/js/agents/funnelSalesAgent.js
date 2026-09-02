/* ===========================================================
   MusfirahLoom — AI Sales Funnel System
   agents/funnelSalesAgent.js  ·  STEP 7 — the AI sales assistant

   Campaign-agnostic. An ordered intent-matcher chain built with
   createAgent() (agents/js/agents/baseAgent.js). Everything it
   says or offers comes from the ACTIVE campaign's config:

     discovery (configured questions, matched by option text /
       per-option signatures / auto word-match)
       -> transparent qualification score  (qualificationEngine)
       -> matched recommendations + active offer  (recommendationRepo)
       -> conversion, per config.meta.conversionGoal:
            'viewing' / 'appointment'  -> shared slotRepo booking
            'purchase'                 -> add-to-cart + checkout
       -> human handoff / WhatsApp

   AI-safety: names, prices, features and discounts come ONLY
   from the config catalog; if nothing matches it says so and
   offers a human.

   Reply fields consumed by funnel/js/landing.entry.js:
   { text, quickReplies, scoreCard, slots, booking, handoff,   // shared MessageBubble
     recs, offer, cta, checkout, links, waLink,                // funnel components (msg.custom)
     actions:[{type}], events, meta }
=========================================================== */
import { createAgent } from '../../../agents/js/agents/baseAgent.js';
import { getConfig, conversionGoal, money0 } from '../services/funnelConfig.js';
import * as reco from '../repositories/recommendationRepo.js';
import { score as scoreAnswers } from './qualificationEngine.js';
import * as slotRepo from '../../../agents/js/repositories/slotRepo.js';

/* ---------- config-derived vocabulary ---------- */

function isPurchase() { return conversionGoal() === 'purchase'; }

function humanLabel() {
  const n = (getConfig().meta.niche || '').toLowerCase();
  if (n.includes('salon')) return 'a stylist';
  if (n.includes('real')) return 'an advisor';
  if (n.includes('commerce')) return 'our team';
  return 'a human';
}

function primaryPathKey() { return isPurchase() ? 'checkout' : 'book'; }
function primaryCtaLabel() {
  const p = getConfig().conversion.paths[primaryPathKey()];
  return (p && p.label) || (isPurchase() ? 'Checkout' : 'Book now');
}
function humanCta() { return `Talk to ${humanLabel()}`; }
function matchesCta() { return 'See my matches'; }

/* ---------- answer detection ---------- */

const STOP = new Set(['the', 'and', 'for', 'with', 'you', 'your', 'have', 'want', 'need', 'this', 'that', 'about', 'just', 'not', 'yes', 'yeah', 'sure', 'a', 'an', 'to', 'of', 'in', 'me', 'my', 'i', 'im', 'is', 'it']);
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** matchOption(question, text) -> option label | null */
function matchOption(q, text) {
  if (!q) return null;
  const t = String(text || '').toLowerCase().trim();
  if (!t) return null;
  // 1. exact option text (a quick-reply chip)
  const exact = (q.options || []).find((o) => t === o.toLowerCase());
  if (exact) return exact;
  // 2. campaign-provided per-option signatures
  if (q.optionSignatures) {
    for (const [label, src] of Object.entries(q.optionSignatures)) {
      try { if (new RegExp(src, 'i').test(text)) return label; } catch { /* bad regex in config */ }
    }
  }
  // 3. auto: the option's own distinctive words
  for (const o of (q.options || [])) {
    const words = o.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
    if (words.length && new RegExp(`\\b(${words.map(escRe).join('|')})\\b`, 'i').test(text)) return o;
  }
  return null;
}

function questions() { return getConfig().qualification.questions || []; }
function questionByAxis(axis) { return questions().find((q) => q.maps === axis) || null; }
function nextQuestion(ctx) { return questions().find((q) => !ctx.answers[q.key]) || null; }
function answeredCount(ctx) { return questions().filter((q) => ctx.answers[q.key]).length; }

/* capture every answer visible in one message */
function absorb(text, ctx) {
  let got = false;
  for (const q of questions()) {
    if (ctx.answers[q.key]) continue;
    const hit = matchOption(q, text);
    if (hit) { ctx.answers[q.key] = hit; got = true; }
  }
  // free-form fallback: only if nothing matched a known option this turn
  if (!got && ctx.askedKey && !ctx.answers[ctx.askedKey] && text.trim().length > 1
      && !/\b(recommend|show|book|price|checkout|cart|advisor|stylist|human|team|offer|option|shortlist)\b/i.test(text)) {
    ctx.answers[ctx.askedKey] = text.trim();
    got = true;
  }
  return got;
}

function absorbable(text, ctx) {
  return questions().some((q) => !ctx.answers[q.key] && matchOption(q, text));
}

/* ---------- builders ---------- */

function pathCtas() {
  const paths = getConfig().conversion.paths || {};
  const order = [primaryPathKey(), 'whatsapp', 'quote', 'checkout', 'book']
    .filter((k, i, a) => a.indexOf(k) === i);
  return order.filter((k) => paths[k]).map((k) => ({ kind: k, label: paths[k].label, type: paths[k].type }));
}

function waLink(interest) {
  const cfg = getConfig();
  const num = String(cfg.business.whatsapp || '').replace(/\D/g, '');
  const msg = (cfg.conversion.whatsappTemplate || 'Hi, I\'m interested in {interest}.')
    .replace('{interest}', interest || 'this');
  return num ? `https://wa.me/${num}?text=${encodeURIComponent(msg)}` : '';
}

function describeAnswers(ctx) {
  const bits = questions().map((q) => ctx.answers[q.key]).filter(Boolean).map((v) => String(v).toLowerCase());
  return bits.length ? bits.slice(0, 3).join(', ') : 'what you\'ve told me';
}

function recommendReply(ctx) {
  const { items, note } = reco.match(ctx.answers, ctx.leadInterest);
  const offer = reco.activeOffer();
  if (!items.length) {
    return {
      text: `${note} Shall I connect you with ${humanLabel()}?`,
      quickReplies: [humanCta(), 'Change my budget'],
      events: [{ name: 'recommendation_empty', props: {} }],
    };
  }
  ctx.lastRecs = items.map((i) => i.listing.id);
  return {
    text:
      `Based on ${describeAnswers(ctx)}, here ${items.length === 1 ? 'is the closest match' : `are the ${items.length} closest matches`} — and why each fits:`,
    recs: items,
    offer,
    cta: pathCtas(),
    quickReplies: [primaryCtaLabel(), offer ? offer.cta.label : humanCta(), 'Something cheaper'],
    actions: [{ type: 'recommendations', ids: ctx.lastRecs, offerId: offer ? offer.id : null }],
    events: [{ name: 'recommendation_shown', props: { count: items.length } }],
  };
}

function finishQualification(ctx) {
  const scoring = scoreAnswers(ctx.answers);
  ctx.scored = scoring;
  const rec = recommendReply(ctx);
  return {
    text: `Thanks — that's everything I need. Here's where you land, transparently: ${scoring.reason}`,
    scoreCard: { lead: { leadId: ctx.leadId, name: ctx.leadName }, scoring },
    recs: rec.recs,
    offer: rec.offer,
    cta: rec.cta,
    quickReplies: rec.quickReplies,
    actions: [
      { type: 'qualified', score: scoring.score, category: scoring.category, answers: { ...ctx.answers } },
      ...(rec.actions || []),
    ],
    events: [
      { name: 'lead_qualified', props: { score: scoring.score, category: scoring.category } },
      ...(rec.events || []),
    ],
  };
}

function advance(ctx, ack) {
  const q = nextQuestion(ctx);
  if (q) {
    ctx.askedKey = q.key;
    return { text: ack ? `${ack} ${q.label}` : q.label, quickReplies: q.options, meta: { ask: q.key } };
  }
  ctx.askedKey = null;
  return finishQualification(ctx);
}

/* ---------- conversion: booking (viewing / appointment) ---------- */

const ORDINALS = { first: 0, '1st': 0, one: 0, second: 1, '2nd': 1, two: 1, third: 2, '3rd': 2, three: 2, last: -1 };

function serviceLabel() {
  return conversionGoal() === 'appointment' ? 'Appointment' : 'Property viewing / advisor call';
}

function extractSlotId(text, ctx) {
  const m = String(text).toUpperCase().match(/SLOT[-\s]?(\d{2,4})/);
  if (m) return `SLOT-${m[1]}`;
  const t = text.toLowerCase();
  for (const [w, i] of Object.entries(ORDINALS)) {
    if (new RegExp(`\\b${w}\\b`).test(t) && ctx.lastSlots && ctx.lastSlots.length) {
      return i === -1 ? ctx.lastSlots[ctx.lastSlots.length - 1] : ctx.lastSlots[i];
    }
  }
  return null;
}

function showSlots(ctx) {
  const slots = slotRepo.listAvailable({ limit: 4 }).map((s) => ({ ...s, service: serviceLabel() }));
  if (!slots.length) {
    return { text: `Every slot this week is taken — ${humanLabel()} can open more. Want me to connect you?`, quickReplies: [humanCta()] };
  }
  ctx.lastSlots = slots.map((s) => s.slotId);
  return {
    text: 'Here are the next open slots — pick one:',
    slots,
    quickReplies: [`Book ${slots[0].slotId}`, humanCta()],
    events: [{ name: 'slots_viewed', props: { count: slots.length } }],
  };
}

/* ---------- conversion: checkout (e-commerce) ---------- */

function pickListingId(text, ctx) {
  const recs = (ctx.lastRecs || []).map(reco.byId).filter(Boolean);
  if (!recs.length) return null;
  const t = text.toLowerCase();
  for (const [w, i] of Object.entries(ORDINALS)) {
    if (new RegExp(`\\b${w}\\b`).test(t)) {
      const p = i === -1 ? recs[recs.length - 1] : recs[i];
      if (p) return p.id;
    }
  }
  const byName = recs.find((L) => L.title.toLowerCase().split(/\s+/).some((w) => w.length > 3 && t.includes(w)));
  return byName ? byName.id : recs[0].id;
}

function showCheckout(ctx, explicitId) {
  let listing = explicitId ? reco.byId(explicitId) : null;
  if (!listing && ctx.lastRecs && ctx.lastRecs.length) listing = reco.byId(ctx.lastRecs[0]);
  if (!listing) {
    if (answeredCount(ctx) === 0) return advance(ctx, 'Let\'s find the right piece first.');
    return recommendReply(ctx);
  }
  const offer = reco.activeOffer();
  const discount = offer && offer.kind === 'percent' && offer.value ? Math.round(listing.price * (offer.value / 100)) : 0;
  const total = Math.max(0, listing.price - discount);
  ctx.cart = { id: listing.id, title: listing.title, price: listing.price };
  ctx.cartValue = total;
  return {
    text:
      `Added ${listing.title} (${listing.priceLabel || money0(listing.price)}) to your cart.`
      + `${offer ? ` Your ${offer.name} is applied${discount ? ` — ${money0(discount)} off` : ''}.` : ''} Ready to check out?`,
    checkout: { item: listing, discount, total, offer },
    quickReplies: ['Complete checkout', 'Keep looking', 'I have a question'],
    actions: [{ type: 'cart', value: total, items: [listing.title] }],
    events: [{ name: 'add_to_cart', props: { id: listing.id, value: total } }],
  };
}

function completeCheckout(ctx) {
  const ref = `ML-${Math.floor(10000 + Math.random() * 89999)}`;
  ctx.orderRef = ref;
  const line = ctx.cart ? `${ctx.cart.title} · ${money0(ctx.cartValue)}` : `${money0(ctx.cartValue)}`;
  return {
    text:
      `Order placed — ${ref} (${line}). A confirmation and tracking are on their way. `
      + `Ask me "where is my order?" any time. Demo Mode — no real payment was taken.`,
    actions: [{ type: 'purchased', orderValue: ctx.cartValue, orderRef: ref }],
    quickReplies: ['Where is my order?', 'Anything else'],
    events: [{ name: 'purchase', props: { ref, value: ctx.cartValue } }],
  };
}

/* ---------- FAQ ---------- */

function faqMatch(text) {
  const s = String(text || '').toLowerCase();
  if (s.split(/\s+/).length < 4) return null;
  if (!/\?|\b(how|what|do|does|can|is|are|will|when|why)\b/.test(s)) return null;
  const faqs = getConfig().faqs || [];
  let best = null; let bestScore = 0;
  for (const f of faqs) {
    const words = f.q.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter((w) => w.length > 4);
    const hits = words.filter((w) => s.includes(w)).length;
    if (hits > bestScore) { bestScore = hits; best = f; }
  }
  return bestScore >= 2 ? best : null;
}

/* ---------- intents ---------- */

const intents = [
  {
    id: 'greeting',
    match: (text, ctx) => !ctx.greeted && /^\s*(hi|hello|hey|yo|start|help)\b/i.test(text),
    run: (text, ctx) => {
      ctx.greeted = true;
      return advance(ctx, `Hi${ctx.leadName ? ` ${ctx.leadName.split(' ')[0]}` : ''} — I'm ${getConfig().ai.assistantName}.`);
    },
  },

  {
    id: 'restart',
    match: (text) => /\b(start over|restart|reset|begin again|new search)\b/i.test(text),
    run: (text, ctx) => {
      ctx.answers = {}; ctx.askedKey = null; ctx.lastRecs = []; ctx.scored = null; ctx.cart = null;
      return advance(ctx, 'Fresh start.');
    },
  },

  {
    id: 'order_status',
    match: (text) => isPurchase()
      && /\b(where('?s| is)? my order|track (my )?order|order status|order update|shipping update|when will (it|my order) (arrive|ship)|delivery date)\b/i.test(text),
    run: (text, ctx) => {
      const cfg = getConfig();
      return {
        text:
          `${ctx.orderRef ? `For order ${ctx.orderRef}: ` : ''}our Order Status assistant pulls live tracking and handles `
          + `returns and exchanges. I'll hand you over — your order reference goes with you.`,
        links: [{ label: 'Open Order Status assistant →', href: `agent.html?id=${cfg.integrations.supportAgentId}` }],
        quickReplies: ['Anything else'],
        events: [{ name: 'order_status_asked', props: { ref: ctx.orderRef || null } }],
      };
    },
  },

  {
    id: 'human_confirm',
    match: (text, ctx) => ctx.awaitingHandoff && /^\s*(yes|yep|yeah|sure|please|connect me|do it|go ahead|ok)\b/i.test(text),
    run: (text, ctx) => {
      ctx.awaitingHandoff = false;
      const ref = `HS-${Math.floor(10000 + Math.random() * 89999)}`;
      return {
        text:
          `Done — ${humanLabel()} at ${getConfig().business.name} now has this whole thread and will reach out shortly. `
          + `Reference ${ref}. (Demo Mode — nothing is actually sent.)`,
        handoff: { stage: 'confirmed', ref },
        actions: [{ type: 'handoff', ref }],
        quickReplies: [matchesCta(), primaryCtaLabel()],
        events: [{ name: 'human_handoff', props: { ref } }],
      };
    },
  },

  {
    id: 'human',
    match: (text) =>
      /\b(advisor|human|agent|real person|someone|stylist|therapist|sales ?(rep|person|team)|call me|callback|speak to|talk to)\b/i.test(text)
      && !/\bslot\b/i.test(text),
    run: (text, ctx) => {
      if (/\bwhatsapp\b/i.test(text)) {
        return {
          text: `Here's a direct WhatsApp line — it pre-fills your enquiry:`,
          waLink: waLink(ctx.leadInterest),
          quickReplies: [primaryCtaLabel(), matchesCta()],
          events: [{ name: 'whatsapp_opened', props: {} }],
        };
      }
      ctx.awaitingHandoff = true;
      return {
        text: `I can bring in ${humanLabel()} now — they'll get everything you've told me. Want me to connect you?`,
        handoff: { stage: 'offer' },
        quickReplies: ['Yes, connect me', 'Not yet'],
        events: [{ name: 'human_handoff_requested', props: {} }],
      };
    },
  },

  {
    id: 'book_slot',
    match: (text, ctx) => !isPurchase() && (ctx.lastSlots || []).length > 0
      && (extractSlotId(text, ctx) || /\bbook (it|that|this)\b/i.test(text)),
    run: (text, ctx) => {
      const slotId = extractSlotId(text, ctx) || ctx.lastSlots[0];
      const target = slotRepo.getSlot(slotId);
      if (!target) return showSlots(ctx);
      const res = slotRepo.bookSlot(target.slotId, { leadId: ctx.leadId, name: ctx.leadName });
      if (res.error) {
        const alt = showSlots(ctx);
        return { ...alt, text: `${res.message} Here's what's still open:` };
      }
      const shown = { ...target, service: serviceLabel() };
      return {
        text:
          `Booked. ${res.booking.ref} — ${shown.service} on ${slotRepo.fmtDate(target.date)} at `
          + `${slotRepo.fmtTime(target.startTime)} with ${target.staffMember}. Demo Mode — no calendar invite is sent.`,
        booking: { booking: res.booking, slot: shown },
        actions: [{ type: 'booked', ref: res.booking.ref }],
        quickReplies: [humanCta(), matchesCta()],
        events: [{ name: 'booking_made', props: { ref: res.booking.ref, slotId: target.slotId } }],
      };
    },
  },

  {
    id: 'book',
    match: (text) => !isPurchase()
      && /\b(book|schedule|reserve|viewing|see it|tour|arrange a visit|come see|appointment|come in)\b/i.test(text),
    run: (text, ctx) => showSlots(ctx),
  },

  {
    id: 'checkout',
    match: (text, ctx) => isPurchase()
      && (/\b(add to cart|added to cart|buy( it| this| the)?|check\s?out|purchase|i'?ll take (it|the|this)|place (an? |the )?order|complete (the )?(order|checkout|purchase)|pay now|proceed|order it)\b/i.test(text)
        || (/\b(get|take) (the |this )?(first|second|third|one)\b/i.test(text) && (ctx.lastRecs || []).length)),
    run: (text, ctx) => {
      if (ctx.cart && /\b(complete|place (an|the) order|pay now|proceed|confirm|do it|yes)\b/i.test(text)) {
        return completeCheckout(ctx);
      }
      return showCheckout(ctx, pickListingId(text, ctx));
    },
  },

  {
    id: 'price',
    match: (text) => /\b(price|prices|cost|how much|budget range|cheapest|most expensive|expensive|afford)\b/i.test(text)
      && !matchOption(questionByAxis('budget'), text),
    run: () => {
      const listings = getConfig().listings || [];
      if (!listings.length) return { text: `Pricing isn't configured yet — ${humanLabel()} can help.` };
      const sorted = [...listings].sort((a, b) => a.price - b.price);
      const lo = sorted[0]; const hi = sorted[sorted.length - 1];
      const lines = sorted.slice(0, 8).map((L) => `• ${L.title} — ${L.priceLabel || money0(L.price)}${L.area ? ` (${L.area})` : ''}`).join('\n');
      return {
        text:
          `Prices run ${lo.priceLabel || money0(lo.price)} to ${hi.priceLabel || money0(hi.price)}:\n${lines}\n`
          + `Those are the only prices I can quote.`,
        quickReplies: [matchesCta(), primaryCtaLabel(), humanCta()],
        events: [{ name: 'pricing_viewed', props: {} }],
      };
    },
  },

  {
    id: 'provide_answer',
    match: (text, ctx) => {
      if (nextQuestion(ctx) == null) return false;
      if (absorbable(text, ctx)) return true;
      if (ctx.askedKey && !/\b(recommend|show me|options|shortlist|book|viewing|checkout|cart|price|cost|advisor|stylist|human|team|offer|deal|start over)\b/i.test(text)) return true;
      return false;
    },
    run: (text, ctx) => {
      const before = answeredCount(ctx);
      absorb(text, ctx);
      const gained = answeredCount(ctx) - before;
      const ack = gained > 1 ? 'Got all that.' : gained === 1 ? 'Noted.' : '';
      return advance(ctx, ack);
    },
  },

  {
    id: 'offer',
    match: (text) => /\b(offer|deal|discount|promo|promotion|incentive|priority|package|any specials|voucher|coupon)\b/i.test(text),
    run: () => {
      const o = reco.activeOffer();
      if (!o) {
        return { text: 'No promotion is running right now — but matching is always free.', quickReplies: [matchesCta(), primaryCtaLabel()] };
      }
      return {
        text: `Yes — ${o.name}: ${o.description}${o.urgency ? ` ${o.urgency}.` : ''}`,
        offer: o,
        cta: pathCtas(),
        quickReplies: [o.cta.label, matchesCta()],
        events: [{ name: 'offer_viewed', props: { offerId: o.id } }],
      };
    },
  },

  {
    id: 'objection',
    match: (text) =>
      /\b(too expensive|out of my budget|can'?t afford|pricey|steep)\b/i.test(text)
      || /\b(not sure|unsure|need to think|think about it|thinking it over|just looking|no rush|maybe later)\b/i.test(text)
      || /\b(too soon|not ready|early days)\b/i.test(text),
    run: (text) => {
      const t = text.toLowerCase();
      const listings = [...(getConfig().listings || [])].sort((a, b) => a.price - b.price);
      if (/expensive|afford|budget|pricey|steep/.test(t) && listings.length) {
        const cheap = listings.slice(0, 3).map((L) => `${L.title} (${L.priceLabel || money0(L.price)})`);
        return {
          text: `Fair. A few of ours sit well below that — ${cheap.join(', ')}. Want me to pull those up?`,
          quickReplies: ['Show me those', humanCta()],
        };
      }
      return {
        text:
          `No pressure at all. I'll keep your shortlist ready. When you want to move, one message ${isPurchase() ? 'checks you out' : 'books you in'} — `
          + `the follow-up notes nudge gently, never spam.`,
        quickReplies: [matchesCta(), humanCta()],
      };
    },
  },

  {
    id: 'recommend',
    match: (text, ctx) => answeredCount(ctx) >= 2
      && /\b(recommend|show me|options|matches|shortlist|listings|homes|products|pieces|treatments|what (do you have|have you got)|something (cheaper|bigger|smaller|else)|see (them|homes|options)|properties)\b/i.test(text),
    run: (text, ctx) => {
      if (/\bcheaper|less|lower|smaller budget\b/i.test(text)) {
        const bq = questionByAxis('budget');
        if (bq && bq.options) {
          const idx = bq.options.indexOf(ctx.answers[bq.key]);
          if (idx > 0) ctx.answers[bq.key] = bq.options[idx - 1];
        }
      }
      return recommendReply(ctx);
    },
  },

  {
    id: 'faq',
    match: (text) => faqMatch(text) != null,
    run: (text) => {
      const f = faqMatch(text);
      return {
        text: f.a,
        quickReplies: [matchesCta(), primaryCtaLabel(), humanCta()],
        events: [{ name: 'faq_viewed', props: { q: f.q } }],
      };
    },
  },
];

/* ---------- fallback ---------- */

function fallback(text, ctx) {
  if (nextQuestion(ctx)) return advance(ctx, 'Let me get one more thing.');
  return {
    text: `I can show your matches, ${isPurchase() ? 'set up your cart' : 'book you in'}, walk through pricing, or connect you with ${humanLabel()}. What would help?`,
    quickReplies: [matchesCta(), primaryCtaLabel(), humanCta()],
  };
}

export const funnelSalesAgent = createAgent({ id: 'funnel-sales', intents, fallback });
export default funnelSalesAgent;
