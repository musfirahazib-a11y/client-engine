/* ===========================================================
   MusfirahLoom — AI Agent Platform
   repositories/kbRepo.js

   Lightweight keyword FAQ matcher — no vector database. Scores
   each FAQ by keyword phrase hits, question-word overlap and
   category mention, and returns the best answer or null.
=========================================================== */
import { FAQS } from '../../data/faqs.js';

const STOP = new Set([
  'the', 'a', 'an', 'and', 'or', 'is', 'are', 'was', 'do', 'does', 'did', 'my', 'me',
  'i', 'to', 'of', 'in', 'on', 'for', 'it', 'this', 'that', 'you', 'your', 'can', 'how',
  'what', 'when', 'where', 'why', 'with', 'have', 'has', 'get', 'about', 'please', 'im',
]);

function tokens(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

/* loose token equality: exact, or a shared prefix when the shorter
   token is at least 5 chars (so "international" ~ "internationally",
   but "ship" is NOT treated as "shipping") */
function tokenMatch(a, b) {
  if (a === b) return true;
  const short = a.length <= b.length ? a : b;
  const long = a.length <= b.length ? b : a;
  return short.length >= 5 && long.startsWith(short);
}

function scoreFaq(faq, queryRaw, queryTokens) {
  const q = String(queryRaw || '').toLowerCase();
  let score = 0;

  for (const kw of faq.keywords || []) {
    const k = kw.toLowerCase();
    if (k.includes(' ')) {
      if (q.includes(k)) score += 5; // multi-word phrase hit is strong
    } else if (queryTokens.includes(k)) {
      score += 3;
    } else if (queryTokens.some((t) => tokenMatch(t, k))) {
      score += 2;
    }
  }

  const qWords = tokens(faq.question);
  for (const w of queryTokens) {
    if (qWords.some((qw) => tokenMatch(qw, w))) score += 1;
  }

  if (q.includes(faq.category.toLowerCase())) score += 2;

  return score;
}

/** search(query, limit) -> [{ ...faq, score }] sorted best-first */
export function search(query, limit = 3) {
  const qTokens = tokens(query);
  return FAQS
    .map((faq) => ({ ...faq, score: scoreFaq(faq, query, qTokens) }))
    .filter((f) => f.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** bestAnswer(query, minScore) -> { id, category, question, answer, score } | null */
export function bestAnswer(query, minScore = 3) {
  const [top] = search(query, 1);
  return top && top.score >= minScore ? top : null;
}

export function byId(id) {
  return FAQS.find((f) => f.id === id) || null;
}

export function byCategory(category) {
  const c = String(category || '').toLowerCase();
  return FAQS.filter((f) => f.category.toLowerCase() === c);
}

export const FALLBACK =
  'I can help with orders and delivery, tracking, returns and exchanges, refunds, shipping, payments and product questions — or connect you with a human. What do you need?';
