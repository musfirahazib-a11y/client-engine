/* ===========================================================
   MusfirahLoom — AI Sales Funnel System
   agents/qualificationEngine.js  ·  STEP 6 — campaign-agnostic scoring

   Turns the configured qualification answers into a transparent
   0–100 score across five axes (need · budget · timeline ·
   authority · fit). It is driven entirely by config:

     - which question feeds which axis  →  question.maps
     - the points available per axis     →  qualification.weights
     - HOT/WARM/COLD cut-offs            →  qualification.thresholds
     - an answer's strength on its axis  →  question.optionScores
       (0..1 per option), falling back to the built-in AXIS_RULES
       heuristics for free-text answers.

   Every score ships with a written reason — no black-box numbers.
   Return shape stays compatible with the Lead agent's
   renderScoreCard() component.
=========================================================== */
import { getConfig } from '../services/funnelConfig.js';

/* fallback heuristics for free-text answers (mainly the real-estate campaign) */
const AXIS_RULES = {
  need(ans) {
    const s = String(ans || '').toLowerCase();
    if (!s) return { v: 0.35, note: 'goal not given' };
    if (s.includes('invest') || s.includes('bridal') || s.includes('wedding')) return { v: 1.0, note: 'high-intent goal' };
    if (s.includes('live') || s.includes('gift') || s.includes('event')) return { v: 0.85, note: 'clear goal' };
    if (s.includes('explor') || s.includes('brows') || s.includes('not sure')) return { v: 0.35, note: 'still exploring' };
    return { v: 0.6, note: 'goal noted' };
  },
  budget(ans, cfg) {
    const target = (cfg.qualification.target && cfg.qualification.target.budgetValue) || 100;
    const mid = midOfBudget(ans);
    if (mid == null) return { v: 0.3, note: 'budget not stated' };
    const ratio = mid / target;
    if (ratio >= 1.4) return { v: 1.0, note: 'budget well above target' };
    if (ratio >= 1.0) return { v: 0.9, note: 'budget on target' };
    if (ratio >= 0.6) return { v: 0.6, note: 'budget below target' };
    return { v: 0.3, note: 'budget under the entry point' };
  },
  timeline(ans) {
    const s = String(ans || '').toLowerCase();
    if (!s) return { v: 0.4, note: 'timing unclear' };
    if (/asap|this week|now|today|urgent/.test(s)) return { v: 1.0, note: 'ready now' };
    if (/1.?3 ?month|next 1|1-2 week|within the month|this month/.test(s)) return { v: 0.8, note: 'moving soon' };
    if (/3.?6 ?month|few months/.test(s)) return { v: 0.5, note: 'mid-term' };
    if (/research|brows|no rush|someday/.test(s)) return { v: 0.2, note: 'no timeline' };
    return { v: 0.45, note: 'timing noted' };
  },
  authority(ans) {
    const s = String(ans || '').toLowerCase();
    if (!s) return { v: 0.5, note: 'decision-makers unclear' };
    if (/just me|myself|my (wedding|decision)|sole/.test(s)) return { v: 1.0, note: 'sole decision-maker' };
    if (/partner|spouse|together|jointly/.test(s)) return { v: 0.8, note: 'deciding jointly' };
    if (/board|family|sign-off|approval|committee/.test(s)) return { v: 0.45, note: 'needs sign-off' };
    return { v: 0.6, note: 'noted' };
  },
  fit(ans) {
    const s = String(ans || '').toLowerCase();
    if (!s) return { v: 0.5, note: 'not stated' };
    if (/cash|returning|pre-?approved|first time/.test(s)) return { v: 0.9, note: 'good fit' };
    if (/not yet|not approved|browsing/.test(s)) return { v: 0.4, note: 'weaker fit' };
    return { v: 0.6, note: 'noted' };
  },
};

function midOfBudget(ans) {
  const s = String(ans || '').toLowerCase().replace(/,/g, '');
  const scale = (n, unit) => (unit === 'm' ? n * 1e6 : unit === 'k' ? n * 1e3 : n);
  const nums = [...s.matchAll(/\$?\s*(\d+(?:\.\d+)?)\s*(k|m)?/g)].map((m) => scale(parseFloat(m[1]), m[2]));
  if (!nums.length) return null;
  if (/under|below|less than|max/.test(s)) return nums[0] * 0.8;
  if (nums.length >= 2) return (nums[0] + nums[1]) / 2;
  if (/\+|over|above/.test(s)) return nums[0] * 1.3;
  return nums[0];
}

export function score(answers = {}) {
  const cfg = getConfig();
  const weights = cfg.qualification.weights;
  const thr = cfg.qualification.thresholds;
  const questions = cfg.qualification.questions || [];

  const breakdown = {};
  const notes = {};
  let total = 0;

  for (const axis of Object.keys(weights)) {
    const q = questions.find((x) => x.maps === axis);
    const ans = q ? answers[q.key] : undefined;
    let v = null;
    let note = null;

    if (q && q.optionScores && ans != null) {
      const key = Object.keys(q.optionScores).find((k) => k.toLowerCase() === String(ans).toLowerCase().trim());
      if (key != null) { v = q.optionScores[key]; note = `${q.key}: ${key.toLowerCase()}`; }
    }
    if (v == null) {
      const rule = AXIS_RULES[axis];
      const r = rule
        ? rule(ans, cfg)
        : { v: ans != null ? 0.6 : 0.35, note: ans != null ? `${q ? q.key : axis} noted` : `${q ? q.key : axis} not given` };
      v = r.v; note = r.note;
    }

    const pts = Math.round(v * weights[axis]);
    breakdown[axis] = pts;
    notes[axis] = note;
    total += pts;
  }

  const category =
    total >= thr.hot ? 'HOT'
      : total >= thr.warm ? 'WARM'
        : total >= thr.cold ? 'COLD'
          : 'UNQUALIFIED';

  const temperature = { HOT: 'Hot', WARM: 'Warm', COLD: 'Cold', UNQUALIFIED: 'Unqualified' }[category];
  const nextAction = (cfg.qualification.categories[category] || {}).action || 'Follow up';

  const ranked = Object.keys(weights)
    .map((a) => ({ a, frac: breakdown[a] / weights[a] }))
    .sort((x, y) => y.frac - x.frac);
  const strong = ranked.filter((r) => r.frac >= 0.8).slice(0, 2).map((r) => notes[r.a]);
  const weak = ranked.filter((r) => r.frac < 0.5).slice(-1).map((r) => notes[r.a]);
  let reason = '';
  if (strong.length) reason += `Strong: ${strong.join(', ')}.`;
  if (weak.length) reason += `${reason ? ' ' : ''}Watch: ${weak.join(', ')}.`;
  if (!reason) reason = 'Balanced across the board.';

  return { score: total, category, temperature, breakdown, max: { ...weights }, reason, nextAction, notes };
}

export function previewCategory(answers) {
  return score(answers).category;
}
