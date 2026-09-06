/* ===========================================================
   Misbah Azib — Website
   site/js/leadScore.js  ·  transparent lead triage

   Turns a completed Start-a-Project brief into a simple
   priority band — HOT / WARM / LOW — from five plain factors.
   No AI, no black box: every point is a lookup you can read
   below, and the result carries the reason for each factor so
   a person can sanity-check it.

   Pure module: no DOM, no network, no storage, deterministic.
   Imported by start.entry.js today; ready to run unchanged in
   a Google Sheet formula or a Cloudflare Worker when a real
   submission destination is chosen.

   --- Google Sheets equivalent (for when capture is wired up) ---
   Given columns for budget (B), timeline (C), need (D),
   challenge (E), goal (F), link (G):

     budgetPts   = IFS(B="$15,000+",3, B="$5,000 – $15,000",3,
                       B="$1,500 – $5,000",2, B="$500 – $1,500",1, TRUE,0)
     timelinePts = IFS(C="As soon as possible",3, C="2–4 weeks",2,
                       C="1–3 months",1, TRUE,0)
     fitPts      = IF(OR(D="Business website",D="Website redesign",
                       D="E-commerce website",D="AI website assistant"),2,
                       IF(D="",0,1))
     detailPts   = (IF(AND(LEN(TRIM(E))>=20,ISNUMBER(SEARCH(" ",TRIM(E)))),1,0))
                 + (IF(AND(LEN(TRIM(F))>=20,ISNUMBER(SEARCH(" ",TRIM(F)))),1,0))
     maturityPts = IF(TRIM(G)="",1,2)
     score       = budgetPts+timelinePts+fitPts+detailPts+maturityPts   (max 12)
     rawBand     = IFS(score>=9,"HOT", score>=5,"WARM", TRUE,"LOW")
     band        = IF(AND(budgetPts=0,timelinePts=0),"LOW",
                     IF(AND(OR(budgetPts=0,timelinePts=0),rawBand="HOT"),"WARM", rawBand))

   Caps (a plain business rule, applied after the additive score):
     - no budget AND no urgency        -> always LOW, however well it reads
     - no budget OR no urgency         -> cannot be HOT (caps at WARM)
=========================================================== */

export const MAX_SCORE = 12;

/* the whole rubric, as data — readable and portable */
export const RUBRIC = {
  budget: {
    label: 'Budget',
    max: 3,
    map: {
      '$15,000+': 3,
      '$5,000 – $15,000': 3,
      '$1,500 – $5,000': 2,
      '$500 – $1,500': 1,
      'Under $500': 0,
    },
  },
  timeline: {
    label: 'Timeline',
    max: 3,
    map: {
      'As soon as possible': 3,
      '2–4 weeks': 2,
      '1–3 months': 1,
      'Just exploring for now': 0,
    },
  },
  serviceFit: {
    label: 'Service fit',
    max: 2,
    core: ['Business website', 'Website redesign', 'E-commerce website', 'AI website assistant'],
    secondary: ['Real estate website', 'Lead generation system'],
    // anything else (incl. "Other / not sure") scores 1; a blank scores 0
  },
  detail: {
    label: 'Detail given',
    max: 2,
    // 1 point each for a challenge and a goal that read like a real sentence
    minChars: 20,
  },
  maturity: {
    label: 'Existing presence',
    max: 2,
    // a website/social link suggests a real, operating business
  },
};

export const BANDS = [
  { id: 'hot', label: 'HOT', emoji: '🔥', min: 9, action: 'Reply within 2 hours. Prep a short proposal before the call.' },
  { id: 'warm', label: 'WARM', emoji: '🟡', min: 5, action: 'Reply same day. Offer a call; nurture with the matching solution page if no reply in 48h.' },
  { id: 'low', label: 'LOW', emoji: '⚪', min: 0, action: 'Polite templated reply with a self-serve option. No call. Add to the newsletter.' },
];

function lookup(map, key) {
  return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : 0;
}

function looksWritten(s) {
  const t = (s || '').trim();
  return t.length >= RUBRIC.detail.minChars && /\s/.test(t);
}

/**
 * scoreLead(values) -> {
 *   score, max, band, bandLabel, bandEmoji, action,
 *   factors: [{ key, label, points, max, note }]
 * }
 * `values` is the Start-a-Project field object (budget, timeline,
 * need, challenge, goal, link, ...). Missing fields score 0 for
 * that factor rather than throwing.
 */
export function scoreLead(values = {}) {
  const v = values || {};

  const budgetPts = lookup(RUBRIC.budget.map, v.budget);
  const timelinePts = lookup(RUBRIC.timeline.map, v.timeline);

  let fitPts;
  let fitNote;
  if (RUBRIC.serviceFit.core.includes(v.need)) { fitPts = 2; fitNote = `${v.need} → core service`; }
  else if (RUBRIC.serviceFit.secondary.includes(v.need)) { fitPts = 1; fitNote = `${v.need} → secondary service`; }
  else if (v.need) { fitPts = 1; fitNote = `${v.need} — needs a call to scope`; }
  else { fitPts = 0; fitNote = 'no service selected'; }

  const detailChallenge = looksWritten(v.challenge);
  const detailGoal = looksWritten(v.goal);
  const detailPts = (detailChallenge ? 1 : 0) + (detailGoal ? 1 : 0);
  const detailNote = detailPts === 2 ? 'challenge and goal both specific'
    : detailPts === 1 ? 'partial detail — one answer is thin'
      : 'thin answers — follow up to clarify';

  const hasLink = Boolean((v.link || '').trim());
  const maturityPts = hasLink ? 2 : 1;
  const maturityNote = hasLink ? 'has a website / social link' : 'no link given (may be pre-launch)';

  const factors = [
    { key: 'budget', label: RUBRIC.budget.label, points: budgetPts, max: 3, note: v.budget || 'not given' },
    { key: 'timeline', label: RUBRIC.timeline.label, points: timelinePts, max: 3, note: v.timeline || 'not given' },
    { key: 'serviceFit', label: RUBRIC.serviceFit.label, points: fitPts, max: 2, note: fitNote },
    { key: 'detail', label: RUBRIC.detail.label, points: detailPts, max: 2, note: detailNote },
    { key: 'maturity', label: RUBRIC.maturity.label, points: maturityPts, max: 2, note: maturityNote },
  ];

  const score = factors.reduce((sum, f) => sum + f.points, 0);
  let band = BANDS.find((b) => score >= b.min) || BANDS[BANDS.length - 1];

  // Caps — a plain rule applied after the additive score:
  //   no budget AND no urgency  -> always LOW
  //   no budget OR  no urgency  -> cannot be HOT (cap at WARM)
  let capNote = '';
  const byId = (id) => BANDS.find((b) => b.id === id);
  if (budgetPts === 0 && timelinePts === 0 && band.id !== 'low') {
    band = byId('low');
    capNote = 'capped to LOW — no budget and no timeline';
  } else if ((budgetPts === 0 || timelinePts === 0) && band.id === 'hot') {
    band = byId('warm');
    capNote = 'capped to WARM — no budget or no timeline yet';
  }

  return {
    score,
    max: MAX_SCORE,
    band: band.id,
    bandLabel: band.label,
    bandEmoji: band.emoji,
    action: band.action,
    capped: Boolean(capNote),
    capNote,
    factors,
  };
}

/** A plain-text triage block — for a CRM row, an email footer or a log line. */
export function triageText(result) {
  const lines = [
    `Priority: ${result.bandLabel}  ${result.score}/${result.max}${result.capped ? `  (${result.capNote})` : ''}`,
    ...result.factors.map((f) => `  ${(f.label + ':').padEnd(20)} ${f.points}/${f.max}  ${f.note}`),
    `  → ${result.action}`,
  ];
  return lines.join('\n');
}
