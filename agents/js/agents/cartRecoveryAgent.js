/* ===========================================================
   MusfirahLoom — AI Agent Platform
   agents/cartRecoveryAgent.js  ·  AGENT #3 (fully interactive)

   AI Abandoned Cart Recovery Agent.

   Same architecture as salesAgent.js / supportAgent.js: an
   ordered intent chain via createAgent(). Reads go through
   cartRecoveryRepo / discountRepo / productRepo. The only
   writes (demo recovery state) go through cartRecoveryRepo and
   are cleared by Reset Demo. Analytics events + success logs
   are declared on the reply (`events`, `log`) and fired by
   agent.entry.js.

   Reply shape used here:
   { text, recovery?, recoveryList?, messagePreview?, recovered?,
     metrics?, cards?, cardsReadOnly?, quickReplies?,
     events?: [{name, props}], log?: {event, props}, meta? }
=========================================================== */
import { createAgent } from './baseAgent.js';
import * as repo from '../repositories/cartRecoveryRepo.js';
import { INCENTIVES, selectIncentive, applyIncentive } from '../repositories/discountRepo.js';
import * as productRepo from '../repositories/productRepo.js';

/* ---------- helpers ---------- */

const CART_RE = /\bCART[-\s]?(\d{3,6})\b/i;

function extractCartId(text) {
  const s = String(text || '');
  let m = s.match(CART_RE);
  if (m) return `CART-${m[1]}`;
  m = s.match(/\b(\d{4,6})\b/);
  return m ? `CART-${m[1]}` : null;
}

const round = (n) => Math.round(Number(n) || 0);

function notFound(id) {
  return {
    text:
      `I could not find ${id || 'that cart'} in the demo dataset. Cart IDs look like ` +
      `"CART-10482" — or ask me to "show abandoned carts".`,
    quickReplies: ['Show abandoned carts'],
    events: [{ name: 'abandoned_cart_viewed', props: { found: false, query: id || null } }],
  };
}

/** cart + opportunity analysis, honouring a ctx-selected incentive for the current cart */
function analyzeFor(cart, ctx) {
  const opp = { ...cart, ...repo.recoveryOpportunity(cart) };
  const sel = ctx && ctx.selectedIncentive;
  if (sel && ctx.currentCartId === cart.cartId && INCENTIVES[sel]) {
    const applied = applyIncentive(sel, cart);
    opp.incentive = INCENTIVES[sel];
    opp.recommendedAction = INCENTIVES[sel].label;
    opp.incentiveReason = 'Using the incentive selected for this cart.';
    opp.estimatedIncentiveValue = applied.estimatedValue;
    opp.potentialRecoveredRevenue = applied.resultingCartValue;
  }
  return opp;
}

function objectionExplain(reason) {
  return {
    'shipping cost': 'Delivery charges pushed the total past what they expected at checkout.',
    price: 'The price felt too high relative to their expectation or a competitor.',
    'comparing options': 'They are still weighing this against alternatives elsewhere.',
    'needs more time': 'They were not ready to commit and left to think it over.',
    'checkout distraction': 'They were interrupted mid-checkout and did not come back.',
    'payment concern': 'Something in the payment step stopped them — method, security, or a failure.',
    'unsure about product': 'They were not confident the product was right for them.',
    'sizing uncertainty': 'They were unsure about size or fit and did not want to risk it.',
  }[reason] || 'The recorded reason does not map to a standard objection.';
}

function strategyText(opp) {
  return (
    `Cart ${opp.cartId} is $${opp.value} with a "${opp.likelyObjection}" objection from a ${opp.segment} customer. ` +
    `Recommended play: ${opp.recommendedAction}. ${opp.incentiveReason} ` +
    `Estimated concession $${round(opp.estimatedIncentiveValue)}, leaving $${round(opp.potentialRecoveredRevenue)} of recoverable revenue.`
  );
}

function buildMessage(cart, incentiveId) {
  const names = (cart.items || []).map((i) => i.name);
  const itemPhrase = names.length === 1
    ? names[0]
    : names.length === 2
      ? `${names[0]} and ${names[1]}`
      : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;

  const objectionLine = {
    'shipping cost': 'We have covered delivery for you this time.',
    price: 'Here is a little something to make it easier.',
    'comparing options': 'Still deciding? Here is a nudge while your cart is saved.',
    'needs more time': 'No rush — your cart is saved and waiting whenever you are ready.',
    'checkout distraction': 'Looks like checkout got interrupted — you are one step away.',
    'unsure about product': 'Not sure it is the one? Our team is happy to help you choose.',
    'sizing uncertainty': 'Unsure on sizing? The size guide and our team can help before you buy.',
    'payment concern': 'If payment gave you trouble, another method at checkout should do it — your cart is saved.',
  }[cart.abandonmentReason] || 'Your cart is saved and ready when you are.';

  const incentiveLine = {
    freeship: 'Your order now ships free.',
    pct10: 'Use code SAVE10 for 10% off your cart.',
    pct15: 'Use code SAVE15 for 15% off your cart.',
    bundle: 'Add a matching piece and save with our bundle price.',
    none: '',
  }[incentiveId] || '';

  return [
    `Hi ${cart.customerName},`,
    `you left ${itemPhrase} in your cart. ${objectionLine}`,
    incentiveLine,
    'Head back to checkout — your items are reserved for a limited time.',
    '— The MusfirahLoom team',
  ].filter(Boolean).join('\n');
}

/* ---------- intents ---------- */

const intents = [
  {
    id: 'greeting',
    match: (text, ctx, history) => {
      if (ctx.greeted) return false;
      if (extractCartId(text)) return false;
      const isGreet =
        /^\s*(hi|hello|hey|yo|hiya|howdy|greetings|good (morning|afternoon|evening)|help|hi there)[\s!.?]*$/i.test(text);
      if (isGreet) return true;
      const hasSignal =
        /\b(carts?|abandon\w*|recover\w*|incentive|discount|objection|revenue|metrics?|priorit\w*|strateg\w*|preview|message|campaign|customer|checkout|offer|product|recommend|suggest|alternative|complementary|bundle|coupon|promo)\b/i.test(text);
      if (hasSignal) return false;
      return history.filter((m) => m.role === 'user').length <= 1;
    },
    run: (text, ctx) => {
      ctx.greeted = true;
      return {
        text:
          `Hi — I recover abandoned carts. I can surface the carts worth chasing, explain why each ` +
          `was abandoned, pick the right incentive, draft the recovery message, and simulate the ` +
          `campaign. Where do you want to start?`,
        quickReplies: ['Show abandoned carts', 'How much revenue can we recover?', 'Which cart should I recover first?'],
      };
    },
  },

  {
    id: 'reset_hint',
    match: (text) => /\b(reset (the )?(demo|recovery|state)|clear (the )?(demo|recovery|state)|start over|start fresh|wipe (the )?state)\b/i.test(text),
    run: () => ({
      text: 'Use the ↺ Reset demo button at the top of the chat — it clears all recovery state (contacted, engaged, recovered) and the transcript.',
      quickReplies: ['Show abandoned carts'],
    }),
  },

  {
    id: 'recover_cart',
    match: (text, ctx) => {
      // never treat a question / strategy request as a "mark recovered" command
      if (/\b(how|should we|strateg|what('?s| is) the|which|why|preview|draft)\b/i.test(text)) {
        // ...unless it is the explicit card-button phrase
        if (!/\brecover cart CART-\d+/i.test(text)) return false;
      }
      const explicit =
        /\bmark (it|this|the cart|this cart) (as )?recovered\b/i.test(text)
        || /\bcustomer (came back|returned|checked out|bought|converted)\b/i.test(text)
        || /\bthey (came back|bought|checked out|completed|purchased|converted)\b/i.test(text)
        || /\bcart recovered\b/i.test(text)
        || /\brecover cart\b/i.test(text)
        || /^\s*recover (this|the|it)\b/i.test(text)
        || /\b(complete|confirm|finalise|finalize) the recovery\b/i.test(text);
      const confirmPending = ctx.pendingRecoverCartId
        && /^\s*(yes|yep|yeah|confirm|do it|go ahead|mark it|recover it|ok(ay)?)\b/i.test(text);
      return explicit || Boolean(confirmPending);
    },
    run: (text, ctx) => {
      const id = extractCartId(text) || ctx.pendingRecoverCartId || ctx.currentCartId;
      if (!id) {
        return { text: 'Which cart recovered? Give me the cart ID (looks like CART-10482).', quickReplies: ['Show abandoned carts'] };
      }
      const cart = repo.getCart(id);
      if (!cart) return notFound(id);
      ctx.currentCartId = cart.cartId;
      ctx.pendingRecoverCartId = null;

      if (repo.effectiveStatus(cart) === 'recovered') {
        const s = repo.getState()[cart.cartId] || {};
        const rev = round(s.recoveredRevenue ?? cart.recoveredRevenue ?? cart.total);
        const method = s.recoveredMethod || cart.recoveredMethod || 'no incentive';
        return {
          text: `${cart.cartId} is already marked recovered — $${rev} via ${method}.`,
          recovered: { cartId: cart.cartId, revenue: rev, method },
          quickReplies: ['Show recovery metrics', 'Show abandoned carts'],
        };
      }

      const sel = ctx.selectedIncentive && INCENTIVES[ctx.selectedIncentive] ? ctx.selectedIncentive : null;
      const method = sel ? INCENTIVES[sel].label : selectIncentive(cart).incentive.label;
      const revenue = round(
        sel ? applyIncentive(sel, cart).resultingCartValue : selectIncentive(cart).resultingCartValue,
      );
      repo.markRecovered(cart.cartId, { method, revenue });
      return {
        text: `${cart.cartId} recovered. Recovered revenue $${revenue} via ${method}.`,
        recovered: { cartId: cart.cartId, revenue, method },
        quickReplies: ['Show recovery metrics', 'Which cart should I recover first?'],
        events: [{ name: 'cart_recovered', props: { cartId: cart.cartId, revenue, method } }],
        log: { event: 'cart_recovered', props: { cartId: cart.cartId, revenue, method } },
      };
    },
  },

  {
    id: 'start_recovery',
    match: (text) =>
      /\b(send|start|launch|kick off|begin|trigger|run) (the )?(recovery|campaign|outreach)\b/i.test(text)
      || /\bcontact the customer\b/i.test(text)
      || /\breach out to (the customer|them)\b/i.test(text)
      || /\bsend (the )?(recovery )?message\b/i.test(text)
      || /\bi want to recover this cart\b/i.test(text),
    run: (text, ctx) => {
      const id = extractCartId(text) || ctx.currentCartId;
      if (!id) {
        return { text: 'Which cart? Give me the ID (CART-10482) or ask to see the abandoned carts.', quickReplies: ['Show abandoned carts'] };
      }
      const cart = repo.getCart(id);
      if (!cart) return notFound(id);
      ctx.currentCartId = cart.cartId;

      const pick = ctx.selectedIncentive && INCENTIVES[ctx.selectedIncentive]
        ? {
            incentive: INCENTIVES[ctx.selectedIncentive],
            ...applyIncentive(ctx.selectedIncentive, cart),
          }
        : selectIncentive(cart);
      ctx.selectedIncentive = pick.incentive.id;

      const updated = repo.markContacted(cart.cartId, { incentive: pick.incentive.id });
      ctx.pendingRecoverCartId = cart.cartId;
      const message = buildMessage(cart, pick.incentive.id);

      return {
        text:
          `Recovery campaign queued for ${cart.cartId} — reference ${updated.campaignRef}. ` +
          `Cart marked "contacted". Below is the message that would be sent (${pick.incentive.label}). ` +
          `Nothing is actually sent in Demo Mode.`,
        messagePreview: {
          cart,
          incentiveLabel: pick.incentive.label,
          objection: cart.abandonmentReason,
          message,
        },
        quickReplies: ['Recover cart', 'Show recovery metrics'],
        events: [{ name: 'recovery_started', props: { cartId: cart.cartId, campaignRef: updated.campaignRef, incentive: pick.incentive.id } }],
        log: { event: 'recovery_started', props: { cartId: cart.cartId, campaignRef: updated.campaignRef } },
      };
    },
  },

  {
    id: 'preview_message',
    match: (text) =>
      /\b(preview|show|see|draft|write|generate) (me )?(the )?(recovery )?message\b/i.test(text)
      || /\bwhat would (we|you) send\b/i.test(text)
      || /\bmessage preview\b/i.test(text)
      || /\brecovery message\b/i.test(text),
    run: (text, ctx) => {
      const id = extractCartId(text) || ctx.currentCartId;
      if (!id) {
        return { text: 'Which cart should I draft for? Give me a cart ID or pick one from the list.', quickReplies: ['Show abandoned carts'] };
      }
      const cart = repo.getCart(id);
      if (!cart) return notFound(id);
      ctx.currentCartId = cart.cartId;

      const pick = ctx.selectedIncentive && INCENTIVES[ctx.selectedIncentive]
        ? { incentive: INCENTIVES[ctx.selectedIncentive] }
        : selectIncentive(cart);
      ctx.selectedIncentive = pick.incentive.id;
      const message = buildMessage(cart, pick.incentive.id);

      return {
        text: `Here is the recovery message for ${cart.cartId}, matched to the "${cart.abandonmentReason}" objection with ${pick.incentive.label}.`,
        messagePreview: {
          cart,
          incentiveLabel: pick.incentive.label,
          objection: cart.abandonmentReason,
          message,
        },
        quickReplies: ['Start recovery', 'Try a different incentive'],
        events: [{ name: 'recovery_message_previewed', props: { cartId: cart.cartId, incentive: pick.incentive.id } }],
      };
    },
  },

  {
    id: 'cycle_incentive',
    match: (text, ctx) =>
      Boolean(ctx.currentCartId)
      && (/\b(different|another|other|alternative) incentive\b/i.test(text)
        || /\btry (a )?(different|another|other) (incentive|offer|discount)\b/i.test(text)
        || /\bwhat about (a bigger|a smaller|another) (discount|offer)\b/i.test(text)),
    run: (text, ctx) => {
      const cart = repo.getCart(ctx.currentCartId);
      if (!cart) return notFound(ctx.currentCartId);
      const order = ['none', 'freeship', 'pct10', 'pct15', 'bundle'];
      const cur = ctx.selectedIncentive || selectIncentive(cart).incentive.id;
      const next = order[(order.indexOf(cur) + 1) % order.length];
      ctx.selectedIncentive = next;
      const applied = applyIncentive(next, cart);
      const caveat = {
        none: 'No concession — only works if the objection was not about price.',
        freeship: 'Cheapest lever; best when shipping was the blocker.',
        pct10: 'Moderate margin hit; a safe default for price-sensitive carts.',
        pct15: 'Deeper discount — reserve it for high-value carts.',
        bundle: 'Protects the headline price while adding perceived value.',
      }[next];
      return {
        text:
          `Switched to ${INCENTIVES[next].label} for ${cart.cartId}. Estimated cost $${round(applied.estimatedValue)}, ` +
          `cart value after the offer $${round(applied.resultingCartValue)}. ${caveat}`,
        recovery: analyzeFor(cart, ctx),
        quickReplies: ['Preview the recovery message', 'Start recovery'],
        events: [{ name: 'incentive_recommended', props: { cartId: cart.cartId, incentive: next, cycled: true } }],
      };
    },
  },

  {
    id: 'metrics',
    match: (text) =>
      /\brecovery (stats|metrics|rate|performance|dashboard|numbers|snapshot)\b/i.test(text)
      || /\bhow much (revenue|money) (can|could) we recover\b/i.test(text)
      || /\bhow much is (abandoned|at stake|at risk)\b/i.test(text)
      || /\bhow many carts (are )?abandoned\b/i.test(text)
      || /\btotal abandoned (value|revenue)\b/i.test(text)
      || /\bwhat('?s| is) the recovery opportunity\b/i.test(text)
      || /\babandonment rate\b/i.test(text)
      || /\brevenue (at risk|opportunity)\b/i.test(text),
    run: () => {
      const m = repo.metrics();
      return {
        text:
          `Recovery snapshot: ${m.abandonedCarts} open carts worth $${m.abandonedValue}, ` +
          `${m.recoveredCarts} recovered ($${m.recoveredRevenue}). Recovery rate ${m.recoveryRate}%. ` +
          `Realistic recoverable value after incentives: $${m.potentialRecovery}.`,
        metrics: m,
        quickReplies: ['Which cart should I recover first?', 'Show abandoned carts'],
        events: [{ name: 'recovery_metrics_viewed', props: { open: m.abandonedCarts, recovered: m.recoveredCarts } }],
      };
    },
  },

  {
    id: 'prioritize',
    match: (text) =>
      /\bwhich cart (should|do|to|is)\b/i.test(text)
      || /\bhighest (priority|value|opportunity)\b/i.test(text)
      || /\bbest (opportunity|cart|candidate|bet)\b/i.test(text)
      || /\brecover first\b/i.test(text)
      || /\btop (cart|opportunity|priority)\b/i.test(text)
      || /\bpriorit/i.test(text)
      || /\bnext best cart\b/i.test(text)
      || /\bbiggest opportunity\b/i.test(text)
      || /\bwhere (should|do) i start\b/i.test(text),
    run: (text, ctx) => {
      const [top] = repo.topOpportunities(1);
      if (!top) return { text: 'There are no open carts to prioritise right now.', quickReplies: ['Show recovery metrics'] };
      ctx.currentCartId = top.cart.cartId;
      ctx.selectedIncentive = null;
      const opp = analyzeFor(top.cart, ctx);
      const hoursAgo = Math.round((Date.now() - new Date(top.cart.lastActivityAt).getTime()) / 3600000);
      return {
        text:
          `Start with ${opp.cartId}. It is the strongest opportunity: $${opp.value} cart, ${opp.segment} customer, ` +
          `active ${hoursAgo}h ago, objection "${opp.likelyObjection}". Recommended play: ${opp.recommendedAction}.`,
        recovery: opp,
        quickReplies: [`Recovery strategy for ${opp.cartId}`, `Preview recovery message for ${opp.cartId}`, 'Show abandoned carts'],
        events: [
          { name: 'abandoned_cart_viewed', props: { mode: 'priority', cartId: opp.cartId } },
          { name: 'cart_analyzed', props: { cartId: opp.cartId } },
        ],
      };
    },
  },

  {
    id: 'show_carts',
    match: (text) =>
      /\b(show|list|see|display|pull up|give me|what are) (me )?(the )?(abandoned |open |all )?carts\b/i.test(text)
      || /\bwhich carts (need|to) (recover|chas|follow)/i.test(text)
      || /\bcarts (that )?need recovery\b/i.test(text)
      || /\babandoned carts\b/i.test(text)
      || /\bany carts\b/i.test(text),
    run: () => {
      const tops = repo.topOpportunities(4);
      const opps = tops.map((t) => analyzeFor(t.cart, null));
      if (!opps.length) return { text: 'No open carts right now — everything is recovered or expired.', quickReplies: ['Show recovery metrics'] };
      return {
        text: `${opps.length} carts worth recovering, highest opportunity first:`,
        recoveryList: opps,
        quickReplies: [`Show ${opps[0].cartId}`, 'How much revenue can we recover?', 'Which should I recover first?'],
        events: [{ name: 'abandoned_cart_viewed', props: { count: opps.length } }],
      };
    },
  },

  {
    id: 'recovery_strategy',
    match: (text) =>
      /\bhow (should|do|would) (we|i) recover\b/i.test(text)
      || /\brecovery strateg/i.test(text)
      || /\bwhat should we (offer|do)\b/i.test(text)
      || /\bhow to recover\b/i.test(text)
      || /\bbest way to recover\b/i.test(text)
      || /\brecommend (a )?(recovery )?(strateg|action|play)\b/i.test(text)
      || /\bwhat('?s| is) the play\b/i.test(text)
      || /\bgame plan\b/i.test(text),
    run: (text, ctx) => {
      const id = extractCartId(text) || ctx.currentCartId;
      if (!id) return { text: 'Which cart? Give me a cart ID or say "show abandoned carts".', quickReplies: ['Show abandoned carts'] };
      const cart = repo.getCart(id);
      if (!cart) return notFound(id);
      ctx.currentCartId = cart.cartId;
      const base = repo.recoveryOpportunity(cart);
      ctx.selectedIncentive = base.incentive.id;
      const opp = analyzeFor(cart, ctx);
      return {
        text: strategyText(opp),
        recovery: opp,
        quickReplies: ['Preview the recovery message', 'Try a different incentive', 'Recommend another product'],
        events: [
          { name: 'recovery_strategy_generated', props: { cartId: cart.cartId, incentive: base.incentive.id } },
          { name: 'cart_analyzed', props: { cartId: cart.cartId } },
        ],
      };
    },
  },

  {
    id: 'incentive',
    match: (text) =>
      /\bwhat incentive\b/i.test(text)
      || /\bwhich incentive\b/i.test(text)
      || /\bincentive should\b/i.test(text)
      || /\bgive (them|the customer) (a |an )?(discount|deal|incentive|offer)\b/i.test(text)
      || /\boffer (them )?(something|a discount|an incentive)\b/i.test(text)
      || /\bshould we discount\b/i.test(text)
      || /\b(coupon|promo code|promo)\b/i.test(text)
      || /\bwhat (discount|offer) (should|do)\b/i.test(text)
      || /\bhow much (of a )?discount\b/i.test(text),
    run: (text, ctx) => {
      const id = extractCartId(text) || ctx.currentCartId;
      if (!id) return { text: 'Point me at a cart first — give me a cart ID or ask to see the abandoned carts.', quickReplies: ['Show abandoned carts'] };
      const cart = repo.getCart(id);
      if (!cart) return notFound(id);
      ctx.currentCartId = cart.cartId;
      const pick = selectIncentive(cart);
      ctx.selectedIncentive = pick.incentive.id;
      return {
        text:
          `Recommended incentive for ${cart.cartId}: ${pick.incentive.label}. ${pick.reason} ` +
          `Estimated cost $${round(pick.estimatedValue)}; cart value after the offer $${round(pick.resultingCartValue)}.`,
        recovery: analyzeFor(cart, ctx),
        quickReplies: ['Preview the recovery message', 'Start recovery', 'Try a different incentive'],
        events: [{ name: 'incentive_recommended', props: { cartId: cart.cartId, incentive: pick.incentive.id, estimatedValue: pick.estimatedValue } }],
        log: { event: 'incentive_recommended', props: { cartId: cart.cartId, incentive: pick.incentive.id } },
      };
    },
  },

  {
    id: 'why_abandon',
    match: (text) =>
      /\bwhy (did|would) (they|the customer|she|he) (abandon|leave|drop|bail)\b/i.test(text)
      || /\bwhat (stopped|blocked|put off) (them|the customer)\b/i.test(text)
      || /\bwhat('?s| is) the objection\b/i.test(text)
      || /\bwhat made them leave\b/i.test(text)
      || /\breason (for|they) (abandon|left|dropped|leaving)\b/i.test(text)
      || /\bwhat went wrong\b/i.test(text),
    run: (text, ctx) => {
      const id = extractCartId(text) || ctx.currentCartId;
      if (!id) return { text: 'Which cart? Give me a cart ID and I will tell you the recorded objection.', quickReplies: ['Show abandoned carts'] };
      const cart = repo.getCart(id);
      if (!cart) return notFound(id);
      ctx.currentCartId = cart.cartId;
      return {
        text:
          `${cart.cartId} was abandoned at "${cart.abandonmentReason}". ${objectionExplain(cart.abandonmentReason)} ` +
          `This is the recorded reason from the demo dataset — not inferred behaviour.`,
        quickReplies: ['How should we recover this cart?', 'What incentive should we use?'],
        events: [{ name: 'cart_analyzed', props: { cartId: cart.cartId, objection: cart.abandonmentReason } }],
      };
    },
  },

  {
    id: 'recommend_products',
    match: (text) =>
      /\b(recommend|suggest|show) (me )?(a |an )?(another|different|alternative|complementary|better|similar) (product|item|option|piece)\b/i.test(text)
      || /\b(another|different|alternative) product\b/i.test(text)
      || /\bmaybe they (need|want) (a |another)\b/i.test(text)
      || /\bsomething (else|different) (for them|to add|to offer)\b/i.test(text)
      || /\bcross.?sell\b/i.test(text)
      || /\bwhat (else )?(goes|pairs) with\b/i.test(text),
    run: async (text, ctx) => {
      const id = extractCartId(text) || ctx.currentCartId;
      const cart = id ? repo.getCart(id) : null;
      let products = [];
      if (cart && cart.items && cart.items.length) {
        const seedId = String(cart.items[0].sku || '').toLowerCase();
        products = await productRepo.related(seedId, 3);
      }
      if (!products.length) products = (await productRepo.all()).slice(0, 3);

      const objection = cart ? cart.abandonmentReason : '';
      const lead = cart
        ? (/unsure|sizing|comparing/i.test(objection)
          ? `For ${cart.cartId}, the blocker is confidence — a better-matched or stronger option may convert better than a discount:`
          : `For ${cart.cartId}, here are complementary pieces that raise cart value in the recovery message:`)
        : 'Here are a few products you could surface in a recovery message:';

      return {
        text: lead,
        cards: products.map((p) => ({ product: p })),
        cardsReadOnly: true,
        quickReplies: cart ? ['How should we recover this cart?', 'Preview the recovery message'] : ['Show abandoned carts'],
        events: [{ name: 'cart_analyzed', props: { cartId: cart ? cart.cartId : null, mode: 'recommendation' } }],
      };
    },
  },

  {
    id: 'cart_details',
    match: (text, ctx) =>
      extractCartId(text) != null
      || (/\b(show|open|view|details of|tell me about|what did (the customer|they) abandon|this cart|that cart|the cart)\b/i.test(text) && Boolean(ctx.currentCartId)),
    run: (text, ctx) => {
      const id = extractCartId(text) || ctx.currentCartId;
      const cart = repo.getCart(id);
      if (!cart) return notFound(id);
      ctx.currentCartId = cart.cartId;
      ctx.selectedIncentive = null;
      const opp = analyzeFor(cart, ctx);
      return {
        text:
          `${cart.cartId} — ${cart.customerName} (${cart.customerSegment}). ` +
          `${opp.itemCount} item${opp.itemCount === 1 ? '' : 's'}, $${cart.total}. ` +
          `Objection: ${cart.abandonmentReason}. Status: ${opp.status}. Recommended action: ${opp.recommendedAction}.`,
        recovery: opp,
        quickReplies: ['Why did they abandon it?', 'How should we recover this cart?', 'Preview the recovery message'],
        events: [
          { name: 'abandoned_cart_viewed', props: { cartId: cart.cartId } },
          { name: 'cart_analyzed', props: { cartId: cart.cartId } },
        ],
      };
    },
  },

  {
    id: 'objection',
    match: (text) =>
      /\bprice is (too )?high\b/i.test(text)
      || /\b(too expensive|too pricey|it('?s| is) expensive)\b/i.test(text)
      || /\bshipping (is )?too (much|expensive|high)\b/i.test(text)
      || /\bnot sure (about|if|it)\b/i.test(text)
      || /\bstill deciding\b/i.test(text)
      || /\bjust comparing\b/i.test(text)
      || /\b(need|needs) more time\b/i.test(text)
      || /\bnot ready (to buy)?\b/i.test(text)
      || /\bpayment (issue|problem|concern|failed|declined)\b/i.test(text)
      || /\b(what size|which size|sizing)\b/i.test(text),
    run: (text, ctx) => {
      const t = text.toLowerCase();
      let type = 'price';
      let advice =
        'Match the discount to cart value: free shipping or 10% for most carts, 15% only for high-value carts where the recovered revenue justifies it.';
      if (/shipping/.test(t)) {
        type = 'shipping cost';
        advice = 'Lead with free shipping — it removes the exact blocker and costs less than a percentage discount.';
      } else if (/not sure|unsure|deciding/.test(t)) {
        type = 'product uncertainty';
        advice = 'Send reassurance, not a coupon — product detail, reviews, or a better-matched recommendation.';
      } else if (/comparing/.test(t)) {
        type = 'comparing options';
        advice = 'A small, time-boxed 10% discount plus a clear "why us" tips a comparison shopper.';
      } else if (/more time|not ready/.test(t)) {
        type = 'needs more time';
        advice = 'A gentle reminder in 24–48h beats discounting someone who never objected on price.';
      } else if (/payment/.test(t)) {
        type = 'payment concern';
        advice = 'Point them to alternative payment methods — a discount does not fix a payment failure.';
      } else if (/size|sizing/.test(t)) {
        type = 'sizing uncertainty';
        advice = 'Share the size guide and offer easy exchanges — sizing doubt is a confidence gap, not a price gap.';
      }
      return {
        text: `Objection: ${type}. ${advice}`,
        quickReplies: ctx.currentCartId
          ? ['How should we recover this cart?', 'What incentive should we use?']
          : ['Show abandoned carts'],
        events: [{ name: 'cart_analyzed', props: { objection: type } }],
      };
    },
  },
];

/* ---------- fallback ---------- */

function fallback() {
  return {
    text:
      `I can surface abandoned carts worth recovering, explain why each was abandoned, choose the right ` +
      `incentive, recommend products, draft the recovery message, and simulate a recovery campaign. ` +
      `Try "show abandoned carts" or "how much revenue can we recover?".`,
    quickReplies: ['Show abandoned carts', 'How much revenue can we recover?', 'Which cart should I recover first?'],
  };
}

export const cartRecoveryAgent = createAgent({ id: 'cart', intents, fallback });
export default cartRecoveryAgent;
