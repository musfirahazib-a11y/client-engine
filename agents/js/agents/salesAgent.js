/* ===========================================================
   MusfirahLoom — AI Agent Platform
   agents/salesAgent.js  ·  AGENT #1 (fully interactive)

   AI Sales & Product Recommendation Agent.

   Not a fixed script: intent/keyword detection drives a real
   business flow — discovery (recipient / budget / occasion /
   style) -> search -> recommend -> compare / cheaper / premium
   -> add to cart. A presenter can go off-script and still land
   somewhere sensible.

   Side effects (cart writes) are returned as `actions` and
   executed by agent.entry.js, keeping this module free of DOM
   and storage concerns.
=========================================================== */
import { createAgent } from './baseAgent.js';
import * as productRepo from '../repositories/productRepo.js';
import { getCurrency } from '../services/scope.js';

const CUR = getCurrency();

/* ---------- parsing helpers ---------- */

const RECIPIENT_MAP = {
  mum: 'mom', mommy: 'mom', mother: 'mom', mom: 'mom',
  dad: 'dad', daddy: 'dad', father: 'dad', 'father-in-law': 'dad',
  wife: 'wife', husband: 'husband',
  gf: 'girlfriend', girlfriend: 'girlfriend', bf: 'boyfriend', boyfriend: 'boyfriend',
  partner: 'partner', spouse: 'partner', fiance: 'partner', 'fiancé': 'partner', 'fiancée': 'partner',
  sister: 'sister', bro: 'brother', brother: 'brother',
  son: 'son', daughter: 'daughter', kid: 'kids', kids: 'kids', child: 'kids',
  friend: 'friend', bestie: 'friend', colleague: 'colleague', coworker: 'colleague',
  'co-worker': 'colleague', boss: 'colleague', teacher: 'colleague',
  grandma: 'grandma', grandmother: 'grandma', nan: 'grandma',
  him: 'him', her: 'her', myself: 'myself', me: 'myself',
};

const OCCASIONS = [
  'birthday', 'anniversary', 'wedding', 'engagement', 'christmas',
  'valentine', "valentine's", 'housewarming', 'graduation', 'retirement',
  "mother's day", "mothers day", "father's day", "fathers day",
  'thank you', 'just because', 'new job', 'promotion',
];

const STYLE_WORDS = {
  minimal: 'minimal', minimalist: 'minimal', simple: 'minimal', understated: 'minimal',
  classic: 'classic', timeless: 'classic', traditional: 'classic',
  modern: 'modern', contemporary: 'modern', sleek: 'modern',
  luxury: 'luxury', luxe: 'luxury', premium: 'luxury', 'high-end': 'luxury', elegant: 'luxury',
  playful: 'playful', fun: 'playful', quirky: 'playful',
  bold: 'bold', statement: 'bold', 'stand-out': 'bold',
  cozy: 'cozy', cosy: 'cozy', warm: 'cozy', homely: 'cozy',
};

function parseBudget(raw) {
  const t = String(raw || '').replace(/,/g, ' ').toLowerCase();
  let m = t.match(/\$?\s*(\d{1,4})\s*(?:-|–|—|to|and)\s*\$?\s*(\d{1,4})/);
  if (m) {
    const a = +m[1];
    const b = +m[2];
    return { minPrice: Math.min(a, b), maxPrice: Math.max(a, b) };
  }
  m = t.match(/(?:under|below|less than|up to|max|maximum|no more than|within|budget of|around|about|approx|~)\s*\$?\s*(\d{1,4})/);
  if (m) return { maxPrice: +m[1] };
  m = t.match(/(?:over|above|more than|at least|minimum|min)\s*\$?\s*(\d{1,4})/);
  if (m) return { minPrice: +m[1] };
  m = t.match(/\$\s*(\d{1,4})/);
  if (m) return { maxPrice: +m[1] };
  m = t.match(/\b(\d{1,4})\s*(?:dollars|dollar|bucks|usd|quid|pounds)\b/);
  if (m) return { maxPrice: +m[1] };
  return null;
}

function detectRecipient(raw) {
  const t = String(raw || '').toLowerCase();
  let m = t.match(/\bfor (?:my|a|an|the)?\s*([a-z-]+)/);
  if (m && RECIPIENT_MAP[m[1]]) return RECIPIENT_MAP[m[1]];
  for (const key of Object.keys(RECIPIENT_MAP)) {
    if (new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(t)) {
      return RECIPIENT_MAP[key];
    }
  }
  return null;
}

function detectOccasion(raw) {
  const t = String(raw || '').toLowerCase();
  return OCCASIONS.find((o) => t.includes(o)) || null;
}

function detectStyles(raw) {
  const t = String(raw || '').toLowerCase();
  const out = new Set();
  Object.keys(STYLE_WORDS).forEach((w) => {
    if (new RegExp(`\\b${w}\\b`).test(t)) out.add(STYLE_WORDS[w]);
  });
  return [...out];
}

/* an explicit "recommend / show me" verb — when present, the discovery
   intents defer so the recommend intent runs a search this turn */
const RECOMMEND_VERB = /\b(recommend|suggest|show me|show us|find me|help me (choose|pick|decide)|what would you recommend)\b/i;

const ORDINALS = {
  first: 0, '1st': 0, one: 0,
  second: 1, '2nd': 1, two: 1, middle: 1,
  third: 2, '3rd': 2, three: 2, last: -1,
};

/* ---------- reply builders ---------- */

function reasonFor(product, ctx) {
  const bits = [];
  if (ctx.recipient && (product.recipient || []).some((r) => r === ctx.recipient)) {
    bits.push(`a natural fit for your ${ctx.recipient}`);
  }
  if (ctx.occasion && (product.occasion || []).some((o) => o.includes(ctx.occasion))) {
    bits.push(`works for ${ctx.occasion}`);
  }
  if (ctx.maxPrice != null && product.price <= ctx.maxPrice) {
    bits.push(`under your ${CUR}${ctx.maxPrice} budget at ${CUR}${product.price}`);
  }
  const styleHit = (ctx.styles || []).find((s) => (product.style || []).includes(s));
  if (styleHit) bits.push(`matches the ${styleHit} look you mentioned`);
  if (!bits.length) return product.blurb;
  const s = bits.join(' · ');
  return s.charAt(0).toUpperCase() + s.slice(1) + '.';
}

function contextLine(ctx) {
  const parts = [];
  if (ctx.recipient && ctx.recipient !== 'myself') parts.push(`for your ${ctx.recipient}`);
  if (ctx.recipient === 'myself') parts.push('for yourself');
  if (ctx.occasion) parts.push(ctx.occasion);
  if (ctx.minPrice != null && ctx.maxPrice != null) parts.push(`${CUR}${ctx.minPrice}–${CUR}${ctx.maxPrice}`);
  else if (ctx.maxPrice != null) parts.push(`under ${CUR}${ctx.maxPrice}`);
  else if (ctx.minPrice != null) parts.push(`over ${CUR}${ctx.minPrice}`);
  if (ctx.styles && ctx.styles.length) parts.push(ctx.styles.join(' / '));
  return parts.join(', ');
}

const RECO_QUICK = [
  'Show me a cheaper option',
  'Something more premium',
  'Compare these',
  'Add the first one',
];

async function buildRecommendation(text, ctx, { intro } = {}) {
  ctx.greeted = true;
  const results = await productRepo.search({
    text,
    maxPrice: ctx.maxPrice,
    minPrice: ctx.minPrice,
    recipient: ctx.recipient === 'myself' ? null : ctx.recipient,
    occasion: ctx.occasion,
    style: ctx.styles,
    limit: 3,
  });

  if (!results.length) {
    return {
      text:
        `I could not find a close match for ${contextLine(ctx) || 'that'} in the demo catalog. ` +
        `Try widening the budget or telling me who it is for.`,
      quickReplies: ['Under $100', 'It is a gift', 'Show me anything popular'],
    };
  }

  ctx.lastShown = results.map((p) => p.id);
  const summary = contextLine(ctx);
  const lead = intro
    || (summary
      ? `Based on what you have told me — ${summary} — here ${results.length === 1 ? 'is one option' : `are ${results.length} options`}:`
      : `Here ${results.length === 1 ? 'is a popular option' : `are ${results.length} popular options`} to start with:`);

  return {
    text: lead,
    cards: results.map((p) => ({ product: p, reason: reasonFor(p, ctx) })),
    quickReplies: RECO_QUICK,
    meta: { shown: ctx.lastShown },
  };
}

async function lastShownProducts(ctx) {
  const out = [];
  for (const id of ctx.lastShown || []) {
    const p = await productRepo.get(id);
    if (p) out.push(p);
  }
  return out;
}

function nextDiscoveryQuestion(ctx) {
  if (ctx.maxPrice == null && ctx.minPrice == null) {
    return {
      text: 'Roughly what budget are you working with?',
      quickReplies: ['Under $50', 'Under $100', '$100–$200', 'No firm budget'],
    };
  }
  if (!ctx.recipient) {
    return {
      text: 'Who is this for?',
      quickReplies: ['My wife', 'My husband', 'A friend', 'For myself'],
    };
  }
  if (!ctx.occasion) {
    return {
      text: 'Any particular occasion, or just a treat?',
      quickReplies: ['Birthday', 'Anniversary', 'Just because', 'Christmas'],
    };
  }
  return null;
}

function signalCount(ctx) {
  return [
    ctx.recipient,
    ctx.occasion,
    ctx.maxPrice != null || ctx.minPrice != null,
    ctx.styles && ctx.styles.length,
  ].filter(Boolean).length;
}

/** Either recommend (enough signal) or ask the next best question. */
async function progress(text, ctx, ack) {
  ctx.greeted = true;
  if (signalCount(ctx) >= 2) {
    return buildRecommendation(text, ctx, { intro: ack });
  }
  const q = nextDiscoveryQuestion(ctx);
  if (q) return ack ? { ...q, text: `${ack} ${q.text}` } : q;
  return buildRecommendation(text, ctx, { intro: ack });
}

/* ---------- intents ---------- */

const intents = [
  {
    id: 'greeting',
    match: (text, ctx, history) => {
      if (ctx.greeted) return false;
      // if the opener already carries a budget / recipient / occasion /
      // style, let the specific intents handle it rather than greeting.
      const hasSignal = parseBudget(text) != null
        || detectRecipient(text) != null
        || detectOccasion(text) != null
        || detectStyles(text).length > 0
        || /\b(recommend|suggest|show me|compare|cheaper|options|ideas|find me|browse)\b/i.test(text);
      if (hasSignal) return false;
      const users = history.filter((m) => m.role === 'user').length;
      return users <= 1 || /^\s*(hi|hello|hey|yo|hiya|good (morning|afternoon|evening)|start|help)\b/i.test(text);
    },
    run: (text, ctx) => {
      ctx.greeted = true;
      // still parse anything useful they said in the opener
      const b = parseBudget(text); if (b) Object.assign(ctx, b);
      const r = detectRecipient(text); if (r) ctx.recipient = r;
      const o = detectOccasion(text); if (o) ctx.occasion = o;
      const s = detectStyles(text); if (s.length) ctx.styles = [...new Set([...ctx.styles, ...s])];

      if (signalCount(ctx) >= 2) {
        return buildRecommendation(text, ctx, {
          intro: `Happy to help. Going on ${contextLine(ctx)}, here is where I would start:`,
        });
      }
      return {
        text:
          `Hi — I can help you find the right thing. Tell me who it is for and roughly your budget, ` +
          `and I will pull a few options.`,
        quickReplies: ['It is a gift', 'For myself', 'Under $100', 'Recommend something for my wife'],
      };
    },
  },

  {
    id: 'add_to_cart',
    match: (text, ctx) =>
      (ctx.lastShown || []).length > 0 &&
      /\b(add|buy|take|get|purchase|i(?:'| a)?ll take|put .* in (?:the )?cart|checkout with)\b/i.test(text),
    run: async (text, ctx) => {
      const products = await lastShownProducts(ctx);
      if (!products.length) {
        return { text: 'Let me show you some options first — what is your budget?' };
      }
      const t = text.toLowerCase();
      let picks = [];

      if (/\b(all|everything|both)\b/.test(t)) {
        picks = products.slice();
      } else {
        // by ordinal
        for (const [word, idx] of Object.entries(ORDINALS)) {
          if (new RegExp(`\\b${word}\\b`).test(t)) {
            picks.push(idx === -1 ? products[products.length - 1] : products[idx]);
          }
        }
        // by name fragment
        if (!picks.length) {
          picks = products.filter((p) => {
            const words = p.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
            return words.some((w) => t.includes(w)) || t.includes(p.category.toLowerCase());
          });
        }
        // "it" / "that one" with a single option shown
        if (!picks.length && products.length === 1 && /\b(it|that|this|one)\b/.test(t)) {
          picks = [products[0]];
        }
      }
      picks = picks.filter(Boolean).filter((p, i, a) => a.findIndex((x) => x.id === p.id) === i);

      if (!picks.length) {
        return {
          text: `Which one — ${products.map((p, i) => `${i + 1}) ${p.title}`).join(', ')}?`,
          quickReplies: products.map((p, i) => `Add the ${['first', 'second', 'third'][i] || 'first'} one`),
        };
      }

      const names = picks.map((p) => `“${p.title}”`).join(' and ');
      return {
        text:
          `Done — I have added ${names} to your cart (demo). ` +
          `Want to keep looking, or is that everything?`,
        actions: picks.map((p) => ({ type: 'add_to_cart', product: p })),
        quickReplies: ['That is everything', 'Show me more', 'Something to go with it'],
      };
    },
  },

  {
    id: 'cheaper',
    match: (text) => /\b(cheap(er)?|less expensive|lower price|lower budget|more affordable|budget option|too expensive|anything under|save money)\b/i.test(text),
    run: async (text, ctx) => {
      const b = parseBudget(text);
      if (b) Object.assign(ctx, b);

      const shown = await lastShownProducts(ctx);
      let ceiling = ctx.maxPrice;
      if (shown.length) {
        const minShown = Math.min(...shown.map((p) => p.price));
        ceiling = ceiling != null ? Math.min(ceiling, minShown) : minShown;
      }
      if (ceiling == null) ceiling = 60;

      const pool = [];
      const seen = new Set();
      const collect = (arr) => arr.forEach((p) => {
        if (p.price < ceiling && !seen.has(p.id)) { seen.add(p.id); pool.push(p); }
      });

      if (shown.length) {
        collect(await productRepo.cheaperAlternatives(shown[0], { sameCategory: true, limit: 4 }));
      }
      if (pool.length < 3) {
        collect(await productRepo.search({
          text, maxPrice: ceiling, recipient: ctx.recipient === 'myself' ? null : ctx.recipient,
          occasion: ctx.occasion, style: ctx.styles, limit: 4,
        }));
      }
      if (pool.length < 3) {
        // last resort: drop recipient/occasion, just honour the price ceiling
        collect(await productRepo.search({ maxPrice: ceiling, limit: 6 }));
      }
      const results = pool.sort((a, b) => b.price - a.price).slice(0, 3);

      if (!results.length) {
        return {
          text: `The demo catalog does not go much below ${CUR}${Math.round(ceiling)} for this kind of thing. ` +
                `Happy to show a different category if that helps.`,
          quickReplies: ['Show me candles / home', 'Show me accessories', 'That is fine'],
        };
      }
      ctx.lastShown = results.map((p) => p.id);
      return {
        text: `Here are more budget-friendly picks, all under ${CUR}${Math.round(ceiling)}:`,
        cards: results.map((p) => ({ product: p, reason: reasonFor(p, ctx) })),
        quickReplies: ['Compare these', 'Add the first one', 'Back to the pricier ones'],
      };
    },
  },

  {
    id: 'premium',
    match: (text) => /\b(more premium|premium|nicer|higher end|high-end|splurge|luxur|upgrade|better quality|more expensive|top of the range)\b/i.test(text),
    run: async (text, ctx) => {
      const shown = await lastShownProducts(ctx);
      const floor = shown.length ? Math.max(...shown.map((p) => p.price)) : (ctx.maxPrice || 80);
      if (!ctx.styles.includes('luxury')) ctx.styles = [...ctx.styles, 'luxury'];

      let results = await productRepo.search({
        text, minPrice: floor, recipient: ctx.recipient === 'myself' ? null : ctx.recipient,
        occasion: ctx.occasion, style: ctx.styles, limit: 3,
      });
      results = results.filter((p) => p.price >= floor * 0.98).slice(0, 3);
      if (!results.length) results = await productRepo.search({ text, minPrice: floor, limit: 3 });

      if (!results.length) {
        return { text: 'That is already near the top of the demo range. The lab-diamond studs at $320 are the premium pick.' };
      }
      ctx.lastShown = results.map((p) => p.id);
      return {
        text: `Stepping it up — these have a more premium finish:`,
        cards: results.map((p) => ({ product: p, reason: reasonFor(p, ctx) })),
        quickReplies: ['Compare these', 'Show me a cheaper option', 'Add the first one'],
      };
    },
  },

  {
    id: 'compare',
    match: (text) => /\b(compare|comparison|difference|differ|vs\.?|versus|which (is|one) (is )?(better|best|nicer)|which should i)\b/i.test(text),
    run: async (text, ctx) => {
      let picks = await lastShownProducts(ctx);
      if (picks.length < 2) {
        picks = await productRepo.search({
          text, maxPrice: ctx.maxPrice, recipient: ctx.recipient === 'myself' ? null : ctx.recipient,
          occasion: ctx.occasion, style: ctx.styles, limit: 3,
        });
        ctx.lastShown = picks.map((p) => p.id);
      }
      if (picks.length < 2) {
        return { text: 'Show me a couple of options first and I will compare them side by side.' };
      }
      picks = picks.slice(0, 3);
      return {
        text: `Here is how ${picks.map((p) => p.title).join(', ')} compare:`,
        compare: picks,
        quickReplies: [`Add ${picks[0].title.split(/\s+/)[0]}`, 'Show me a cheaper option', 'These both work'],
      };
    },
  },

  {
    id: 'budget',
    match: (text) => parseBudget(text) != null && !RECOMMEND_VERB.test(text),
    run: (text, ctx) => {
      Object.assign(ctx, parseBudget(text));
      // opportunistically capture anything else in the same message
      const r = detectRecipient(text); if (r) ctx.recipient = r;
      const o = detectOccasion(text); if (o) ctx.occasion = o;
      const s = detectStyles(text); if (s.length) ctx.styles = [...new Set([...ctx.styles, ...s])];
      const ack = ctx.minPrice != null && ctx.maxPrice != null
        ? `${CUR}${ctx.minPrice}–${CUR}${ctx.maxPrice}, noted.`
        : ctx.maxPrice != null ? `Under ${CUR}${ctx.maxPrice}, noted.` : `Over ${CUR}${ctx.minPrice}, noted.`;
      return progress(text, ctx, ack);
    },
  },

  {
    id: 'no_budget',
    match: (text, ctx) =>
      (ctx.maxPrice == null && ctx.minPrice == null) &&
      /\b(no (firm |set |real )?budget|any budget|budget is flexible|price is not|doesn'?t matter|open budget|whatever it costs)\b/i.test(text),
    run: (text, ctx) => {
      ctx.maxPrice = 200; // sensible demo ceiling
      return progress(text, ctx, 'No problem, I will keep it reasonable.');
    },
  },

  {
    id: 'recipient',
    match: (text, ctx) => !ctx.recipient && detectRecipient(text) != null && !RECOMMEND_VERB.test(text),
    run: (text, ctx) => {
      ctx.recipient = detectRecipient(text);
      const b = parseBudget(text); if (b) Object.assign(ctx, b);
      const o = detectOccasion(text); if (o) ctx.occasion = o;
      const s = detectStyles(text); if (s.length) ctx.styles = [...new Set([...ctx.styles, ...s])];
      const ack = ctx.recipient === 'myself' ? 'For you — nice.' : `A gift for your ${ctx.recipient} — lovely.`;
      return progress(text, ctx, ack);
    },
  },

  {
    id: 'occasion',
    match: (text, ctx) => !ctx.occasion && detectOccasion(text) != null && !RECOMMEND_VERB.test(text),
    run: (text, ctx) => {
      ctx.occasion = detectOccasion(text);
      const b = parseBudget(text); if (b) Object.assign(ctx, b);
      const s = detectStyles(text); if (s.length) ctx.styles = [...new Set([...ctx.styles, ...s])];
      return progress(text, ctx, `${ctx.occasion.charAt(0).toUpperCase() + ctx.occasion.slice(1)} — got it.`);
    },
  },

  {
    id: 'style',
    match: (text, ctx) => detectStyles(text).length > 0
      && !/\b(cheap|premium|compare)\b/i.test(text)
      && !RECOMMEND_VERB.test(text),
    run: (text, ctx) => {
      const s = detectStyles(text);
      ctx.styles = [...new Set([...ctx.styles, ...s])];
      const b = parseBudget(text); if (b) Object.assign(ctx, b);
      return progress(text, ctx, `${s.join(' and ')} — good to know.`);
    },
  },

  {
    id: 'recommend',
    match: (text, ctx) =>
      /\b(recommend|suggest|show me|show us|options|ideas|what (do you have|would you|about)|find me|help me (choose|pick|decide)|something for|anything (good|popular)|browse|what'?s good)\b/i.test(text)
      || (signalCount(ctx) >= 1 && /\b(go|ok|okay|sure|yes|please|do it)\b/i.test(text.trim())),
    run: (text, ctx) => {
      ctx.greeted = true;
      const r = detectRecipient(text); if (r && !ctx.recipient) ctx.recipient = r;
      const o = detectOccasion(text); if (o && !ctx.occasion) ctx.occasion = o;
      const b = parseBudget(text); if (b) Object.assign(ctx, b);
      const s = detectStyles(text); if (s.length) ctx.styles = [...new Set([...ctx.styles, ...s])];
      return buildRecommendation(text, ctx, {});
    },
  },

  {
    id: 'thanks_done',
    match: (text) => /\b(thanks|thank you|that'?s all|that is all|that is everything|perfect|great, ?thanks|no that'?s it)\b/i.test(text),
    run: () => ({
      text: 'Anytime. Everything you added is in the demo cart — a presenter can hit “Reset demo” to start fresh.',
      quickReplies: ['Start a new search'],
    }),
  },
];

/* ---------- fallback ---------- */

async function fallback(text, ctx) {
  if ((ctx.lastShown || []).length) {
    return {
      text:
        'I can compare those, find a cheaper or more premium version, or add one to the cart — ' +
        'just say the word.',
      quickReplies: ['Compare these', 'Show me a cheaper option', 'Add the first one'],
    };
  }
  if (signalCount(ctx) >= 1) {
    return progress(text, ctx, 'Let me make sure I point you the right way.');
  }
  return {
    text:
      `I help you find the right product fast. Tell me who it is for and a rough budget — ` +
      `for example, “a gift for my wife under $100”.`,
    quickReplies: ['I need a gift under $100', 'Recommend something for my wife', 'Show me anything popular'],
  };
}

export const salesAgent = createAgent({ id: 'sales', intents, fallback });
export default salesAgent;
