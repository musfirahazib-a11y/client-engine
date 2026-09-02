/* ===========================================================
   MusfirahLoom — AI Agent Platform
   agents/leadBookingAgent.js  ·  AGENT #4 (fully interactive)

   AI Lead Qualification + Appointment Booking Agent.

   Same architecture as the other agents: an ordered intent
   chain via createAgent(). Reads go through leadRepo / slotRepo;
   the writes (created leads, bookings) go through those repos
   and are cleared by Reset Demo. Analytics events + success
   logs are declared on the reply and fired by agent.entry.js.

   Reply fields used here:
   { text, lead?, leadList?, scoreCard?, slots?, booking?,
     leadMetrics?, handoff?, quickReplies?, events?, log?, meta? }
=========================================================== */
import { createAgent } from './baseAgent.js';
import * as leadRepo from '../repositories/leadRepo.js';
import * as slotRepo from '../repositories/slotRepo.js';

/* ---------- extractors ---------- */

function extractLeadId(text) {
  const m = String(text || '').match(/\bLEAD[-\s]?(\d{3,6})\b/i);
  return m ? `LEAD-${m[1]}` : null;
}

function extractBookingRef(text) {
  const m = String(text || '').match(/\bBK[-\s]?(\d{3,6})\b/i);
  return m ? `BK-${m[1]}` : null;
}

const SERVICE_MAP = [
  [/ecom|e-com|online store|online shop|storefront|shopify|sell online/i, 'Ecommerce website'],
  [/\bai\b|automation|chatbot|receptionist|ai agent|workflow automation/i, 'AI automation'],
  [/social media|instagram management|content calendar|social posts|manage (my )?social/i, 'Social media'],
  [/\bseo\b|search engine|google ranking|rank higher|rankings?/i, 'SEO'],
  [/brand(ing)?|logo|visual identity|rebrand/i, 'Branding'],
  [/lead gen(eration)?|more leads|sales funnel|lead funnel|pipeline of leads/i, 'Lead generation'],
  [/web ?site|landing page|web design|web development|new site|revamp (my|the) site/i, 'Website'],
];

function detectService(text) {
  for (const [re, label] of SERVICE_MAP) if (re.test(text)) return label;
  return null;
}

function detectBudget(text) {
  const s = String(text || '').toLowerCase();
  const hasCue = /\$|\bbudget\b|\bspend\b|\binvest\b|\d\s*k\b|dollars?|\bpay\b|\bprice\b|around \$?\d|about \$?\d|under \$?\d|up to \$?\d/.test(s);
  if (!hasCue && !/^\s*[\$£]?\s*\d/.test(s)) return undefined;
  if (/flex|open budget|no (set |fixed )?budget|whatever it (takes|costs)/.test(s)) return 'flexible';
  if (/don'?t know|not sure|no idea|unsure|tbd|haven'?t decided|no budget yet/.test(s)) return null;
  const nb = leadRepo.normalizeBudget(text);
  if (nb.amount != null) return nb.amount;
  if (nb.label === 'flexible') return 'flexible';
  return undefined;
}

function detectAuthority(text) {
  const s = String(text || '').toLowerCase();
  const cue = /\bi'?m the\b|\bi am the\b|\bowner\b|\bfounder\b|\bceo\b|\bmanager\b|decision[- ]?maker|deciding with|my (boss|partner|manager|spouse|co-?founder)|ask my|need approval|researching for|on behalf|the one who decides|i decide|it'?s my (call|decision|business)|my own business/.test(s);
  if (!cue) return null;
  if (/owner|founder|ceo|i own|my own business|it'?s my (call|business)|i decide|the one who decides/.test(s)) return 'owner';
  if (/manager|head of|marketing lead/.test(s)) return 'manager';
  if (/deciding with|with my (partner|spouse|co-?founder)/.test(s)) return 'deciding with partner';
  if (/ask my|need approval|researching for|on behalf|check with/.test(s)) return 'need to ask boss';
  return 'owner';
}

const BIZ_TYPES = {
  salon: 'salon', spa: 'spa', agency: 'agency', clinic: 'clinic', dental: 'dental',
  dentist: 'dental', restaurant: 'restaurant', cafe: 'cafe', gym: 'gym', studio: 'studio',
  boutique: 'boutique', store: 'store', shop: 'shop', coaching: 'coach', coach: 'coach',
  consultant: 'consultant', consulting: 'consultant', realtor: 'real estate',
  'real estate': 'real estate', 'law firm': 'law firm', lawyer: 'law firm',
  accountant: 'accountant', florist: 'florist', photographer: 'photographer', bakery: 'bakery',
};

function detectBusinessType(text) {
  const s = String(text || '').toLowerCase();
  for (const key of Object.keys(BIZ_TYPES)) {
    if (new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(s)) return BIZ_TYPES[key];
  }
  return null;
}

function budgetStr(lead) {
  if (typeof lead.budget === 'number') return `$${lead.budget.toLocaleString()}`;
  if (typeof lead.budget === 'string') return lead.budget;
  return 'not stated';
}

function cap(s) {
  return String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1);
}

function notFoundLead(id) {
  return {
    text:
      `I could not find ${id || 'that lead'} in the demo dataset. Lead IDs look like "LEAD-10482" — ` +
      `or ask me to "show my leads".`,
    quickReplies: ['Show my leads'],
    events: [{ name: 'lead_viewed', props: { found: false, query: id || null } }],
  };
}

/* ---------- qualification flow ---------- */

function nextQualQuestion(q) {
  if (!q.service) {
    return {
      key: 'service',
      text: 'What do you need help with — a website, ecommerce, AI automation, SEO, branding, social media, or lead generation?',
      quick: ['A website', 'An ecommerce store', 'AI automation'],
    };
  }
  if (q.budget === undefined) {
    return {
      key: 'budget',
      text: 'What is your approximate budget?',
      quick: ['Under $1,000', 'Around $3,000', '$5,000+', 'Not sure yet'],
    };
  }
  if (!q.timeline) {
    return {
      key: 'timeline',
      text: 'When would you like to start?',
      quick: ['ASAP', 'This month', 'Next month', 'Just researching'],
    };
  }
  if (!q.authority) {
    return {
      key: 'authority',
      text: 'Are you the decision-maker, or is someone else involved?',
      quick: ["I'm the owner", 'Deciding with a partner', 'I need to check with my boss'],
    };
  }
  return null;
}

function scoreQual(q) {
  return leadRepo.calculateScore({
    service: q.service,
    budget: q.budget,
    timeline: q.timeline,
    authority: q.authority,
    needStrength: q.needStrength || 'good',
    source: q.source || 'Website',
  });
}

/* ---------- intents ---------- */

const intents = [
  {
    id: 'greeting',
    match: (text, ctx) => {
      if (ctx.greeted) return false;
      return /^\s*(hi+|hello|hey|yo|hiya|howdy|greetings|good (morning|afternoon|evening)|hi there|hey there|can you help( me)?|are you (there|able to help)|what can you do|help)[\s!.?]*$/i.test(text);
    },
    run: (text, ctx) => {
      ctx.greeted = true;
      return {
        text:
          `Hi — I qualify inbound leads and book appointments. Tell me what a caller needs ` +
          `(e.g. "a website for my salon") and I will qualify and score them, or ask to see your leads, ` +
          `hot leads, available appointments, or lead metrics.`,
        quickReplies: ['I need a website for my salon', 'Show hot leads', 'Show available appointments'],
      };
    },
  },

  {
    id: 'create_handoff',
    match: (text, ctx) =>
      (ctx.awaitingLeadHandoff && /^\s*(yes|yep|yeah|sure|ok(ay)?|please|do it|go ahead|confirm|connect me)\b/i.test(text))
      || /^\s*request human support\s*$/i.test(text)
      || /\brequest (a )?callback\b/i.test(text),
    run: (text, ctx) => {
      ctx.awaitingLeadHandoff = false;
      const ref = `HS-${Math.floor(10000 + Math.random() * 89999)}`;
      const leadId = ctx.currentLeadId || null;
      return {
        text:
          `Done — ${leadId ? `${leadId} ` : ''}queued for a human sales rep (demo). Reference ${ref}. ` +
          `Nothing has actually been sent.`,
        handoff: { stage: 'confirmed', ref },
        quickReplies: ['Show lead metrics', 'Show my leads'],
        events: [{ name: 'human_handoff_confirmed', props: { ref, leadId } }],
        log: { event: 'human_handoff_confirmed', props: { ref, leadId } },
      };
    },
  },

  {
    id: 'human_handoff',
    match: (text) =>
      /\b(talk|speak|chat) (to|with) (a |an )?(human|person|someone|sales ?(person|rep|team)|expert|advisor|specialist|consultant|agent)\b/i.test(text)
      || /\b(connect|put) me (through|with|to)\b/i.test(text)
      || /\bi want (a |to talk to a )?(sales ?person|human|real person|callback)\b/i.test(text)
      || /\bhand .* to a human\b/i.test(text)
      || /\bhuman handoff\b/i.test(text)
      || /\bhave someone (call|contact|reach out to) me\b/i.test(text),
    run: (text, ctx) => {
      ctx.awaitingLeadHandoff = true;
      const id = extractLeadId(text) || ctx.currentLeadId || null;
      if (id) ctx.currentLeadId = id;
      return {
        text: 'Sure — I can pass this to a human on the sales team. Want me to do that now?',
        handoff: { stage: 'offer' },
        quickReplies: ['Request human support', 'Not yet'],
        events: [{ name: 'human_handoff_requested', props: { leadId: id } }],
      };
    },
  },

  {
    id: 'booking_status',
    match: (text) =>
      /\bBK[-\s]?\d{3,6}\b/i.test(text)
      || (/\b(my|the) (booking|appointment)\b/i.test(text) && /\b(status|confirmed|check|what|when|details)\b/i.test(text))
      || /\bis (my|the) (appointment|booking) (confirmed|booked|set)\b/i.test(text)
      || /\bcheck (my |the )?(booking|appointment)\b/i.test(text)
      || /^\s*check BK/i.test(text),
    run: (text) => {
      const ref = extractBookingRef(text);
      let b = ref ? slotRepo.getBooking(ref) : null;
      if (!b && !ref) {
        // "check my booking" with no reference — resolve if there's exactly one
        const list = slotRepo.listBookings();
        if (list.length === 1) b = list[0];
      }
      if (!b || !b.slot) {
        return {
          text: ref
            ? `I could not find ${ref} in the demo bookings. A reference looks like "BK-58241".`
            : `There is no booking on record yet — book a slot and I will track it here.`,
          quickReplies: ['Show available appointments'],
        };
      }
      return {
        text:
          `${b.ref} is confirmed — ${b.slot.service} on ${slotRepo.fmtDate(b.slot.date)} ` +
          `at ${slotRepo.fmtTime(b.slot.startTime)} with ${b.slot.staffMember}.`,
        booking: { booking: b, slot: b.slot },
        quickReplies: ['Show lead metrics'],
        events: [{ name: 'booking_viewed', props: { ref: b.ref } }],
      };
    },
  },

  {
    id: 'book_appointment',
    match: (text) =>
      /^\s*(book|schedule|reserve|set up)\b/i.test(text)
      || /\bbook (an? )?(appointment|call|consultation|slot|meeting|time)\b/i.test(text)
      || /\bschedule (an? )?(appointment|call|consultation|meeting)\b/i.test(text)
      || /\bbook (SLOT-\d|the (first|second|third|1st|2nd|3rd|last) one|that one)\b/i.test(text),
    run: (text, ctx) => {
      const leadId = extractLeadId(text) || ctx.currentLeadId;
      if (leadId) {
        const l = leadRepo.getLead(leadId);
        if (l) ctx.currentLeadId = l.leadId;
        else if (extractLeadId(text)) return notFoundLead(extractLeadId(text));
      }

      const slotIdM = String(text).toUpperCase().match(/SLOT[-\s]?(\d{2,4})/);
      let slotId = slotIdM ? `SLOT-${slotIdM[1]}` : null;

      if (!slotId && ctx.lastSlots && ctx.lastSlots.length) {
        const ord = { first: 0, '1st': 0, one: 0, second: 1, '2nd': 1, third: 2, '3rd': 2, last: -1 };
        for (const [w, i] of Object.entries(ord)) {
          if (new RegExp(`\\b${w}\\b`, 'i').test(text)) {
            slotId = i === -1 ? ctx.lastSlots[ctx.lastSlots.length - 1] : ctx.lastSlots[i];
          }
        }
      }

      const hasSlotSignal = Boolean(slotId)
        || /\b(mon|tue|wed|thu|fri)[a-z]*\b/i.test(text)
        || /\b\d{1,2}(:\d{2})?\s*(am|pm)\b/i.test(text)
        || /\btomorrow\b/i.test(text);

      let target = slotId ? slotRepo.getSlot(slotId) : null;

      if (!target && hasSlotSignal) {
        const found = slotRepo.findSlot({ text });
        if (found.slot) target = found.slot;
        else {
          const opts = slotRepo.listAvailable({ limit: 6 });
          ctx.lastSlots = opts.map((s) => s.slotId);
          return {
            text: found.reason === 'all matching slots are booked'
              ? 'Those times are already taken. Here is what is still open:'
              : 'I could not match that to an open slot. Here are the open times:',
            slots: opts,
            quickReplies: opts.length ? [`Book ${opts[0].slotId}`] : ['Talk to a human'],
            events: [{ name: 'appointment_started', props: { resolved: false } }],
          };
        }
      }

      if (!target) {
        // no clear slot selected — show options, do not book
        const opts = slotRepo.listAvailable({ limit: 6 });
        ctx.lastSlots = opts.map((s) => s.slotId);
        return {
          text: 'Which time works? Here are the open slots — pick one or say e.g. "book Tuesday at 3 PM".',
          slots: opts,
          quickReplies: opts.length ? [`Book ${opts[0].slotId}`, 'Show lead metrics'] : ['Talk to a human'],
          events: [{ name: 'appointment_started', props: { resolved: false } }],
        };
      }

      const lead = ctx.currentLeadId ? leadRepo.getLead(ctx.currentLeadId) : null;
      const name = lead ? lead.name : (ctx.qual && ctx.qual.name) || null;
      const res = slotRepo.bookSlot(target.slotId, { leadId: ctx.currentLeadId || null, name });

      if (res.error) {
        const opts = slotRepo.listAvailable({ limit: 6 });
        ctx.lastSlots = opts.map((s) => s.slotId);
        return {
          text: `${res.message} Here are open alternatives:`,
          slots: opts,
          quickReplies: opts.length ? [`Book ${opts[0].slotId}`] : ['Talk to a human'],
          events: [{ name: 'appointment_started', props: { resolved: true, blocked: res.error } }],
        };
      }

      if (lead) leadRepo.updateLead(lead.leadId, { appointmentStatus: 'booked', bookingRef: res.booking.ref });
      return {
        text:
          `Booked. ${res.booking.ref} — ${target.service} on ${slotRepo.fmtDate(target.date)} ` +
          `at ${slotRepo.fmtTime(target.startTime)} with ${target.staffMember}. Demo Mode booking — no invite sent.`,
        booking: { booking: res.booking, slot: target },
        quickReplies: [`Check ${res.booking.ref}`, 'Show lead metrics'],
        events: [
          { name: 'appointment_started', props: { resolved: true } },
          { name: 'appointment_booked', props: { ref: res.booking.ref, slotId: target.slotId, leadId: ctx.currentLeadId || null } },
        ],
        log: { event: 'appointment_booked', props: { ref: res.booking.ref, slotId: target.slotId } },
      };
    },
  },

  {
    id: 'show_slots',
    match: (text) =>
      /\b(show|see|list|find|any|what) .*(appointments?|slots?|availabilit|time slots?|openings?)\b/i.test(text)
      || /\bavailable (appointments?|slots?|times?)\b/i.test(text)
      || /\bwhen can (they|we|i|you) (meet|talk|chat)\b/i.test(text)
      || /\bfind (me )?a slot\b/i.test(text)
      || /\bwhat times?\b/i.test(text)
      || /\bappointments? (this week|available|open)\b/i.test(text),
    run: (text, ctx) => {
      const dayM = String(text).match(/\b(mon|tue|wed|thu|fri)[a-z]*\b/i);
      const slots = slotRepo.listAvailable({ day: dayM ? dayM[0] : null, limit: 6 });
      if (!slots.length) {
        return { text: 'No open slots match that. Try another day or ask for all availability.', quickReplies: ['Show all available appointments'] };
      }
      ctx.lastSlots = slots.map((s) => s.slotId);
      return {
        text: `${slots.length} open slot${slots.length === 1 ? '' : 's'}${dayM ? ` on ${slots[0].day}` : ''} (${slots[0].timezone}):`,
        slots,
        quickReplies: [`Book ${slots[0].slotId}`, 'Show lead metrics'],
        events: [{ name: 'appointment_slots_viewed', props: { count: slots.length } }],
      };
    },
  },

  {
    id: 'lead_metrics',
    match: (text) =>
      /\blead (metrics|stats|dashboard|numbers|report)\b/i.test(text)
      || /\bhow many (hot |warm |cold |qualified )?leads\b/i.test(text)
      || /\bconversion opportunity\b/i.test(text)
      || /\bpipeline( value| opportunity| worth)?\b/i.test(text)
      || /\bwhat'?s (my|the) pipeline\b/i.test(text)
      || /\bhow (is|are) (my )?leads? (doing|looking)\b/i.test(text),
    run: () => {
      const m = leadRepo.leadMetrics();
      return {
        text:
          `${m.totalLeads} leads: ${m.hot} hot, ${m.warm} warm, ${m.cold} cold, ${m.unqualified} unqualified. ` +
          `${m.qualified} qualified, average score ${m.avgScore}/100. ${m.bookedAppointments} booked. ` +
          `Estimated pipeline $${m.estimatedPipeline.toLocaleString()}.`,
        leadMetrics: m,
        quickReplies: ['Show hot leads', 'Show available appointments'],
        events: [{ name: 'lead_viewed', props: { mode: 'metrics', hot: m.hot } }],
      };
    },
  },

  {
    id: 'show_leads',
    match: (text) =>
      !extractLeadId(text) && (
        /\bshow (me )?(my |all |the )?leads?\b/i.test(text)
        || /\bshow (me )?(hot|warm|cold|unqualified|qualified) leads?\b/i.test(text)
        || /\bwhich leads?\b/i.test(text)
        || /\blist (my |the )?leads?\b/i.test(text)
        || /\b(hot|warm|cold) leads?\b/i.test(text)
        || /\bleads? (that are |who are )?(ready|qualified|hot|warm)\b/i.test(text)
      ),
    run: (text) => {
      const t = text.toLowerCase();
      let temp = null;
      if (/\bhot\b/.test(t)) temp = 'Hot';
      else if (/\bwarm\b/.test(t)) temp = 'Warm';
      else if (/\bcold\b/.test(t)) temp = 'Cold';
      else if (/\bunqualified\b/.test(t)) temp = 'Unqualified';
      else if (/\bqualified\b|\bready\b/.test(t)) temp = ['Hot', 'Warm'];

      const leads = leadRepo.listLeads({ temperature: temp, limit: 6 });
      if (!leads.length) return { text: `No ${temp || ''} leads right now.`, quickReplies: ['Show my leads'] };
      const label = Array.isArray(temp) ? 'qualified' : (temp ? temp.toLowerCase() : '');
      return {
        text: `${leads.length} ${label} lead${leads.length === 1 ? '' : 's'}${temp ? '' : ', highest score first'}:`,
        leadList: leads,
        quickReplies: [`Show ${leads[0].leadId}`, 'Show lead metrics', 'Show available appointments'],
        events: [{ name: 'lead_viewed', props: { count: leads.length, filter: label || 'all' } }],
      };
    },
  },

  {
    id: 'lead_score',
    match: (text) =>
      /\b(qualify|score|analy[sz]e) (this |the |that )?lead\b/i.test(text)
      || /\bqualify LEAD-\d/i.test(text)
      || /\bscore LEAD-\d/i.test(text)
      || /\bhow qualified\b/i.test(text)
      || /\bis (this|it|that) a (hot|warm|cold|good|qualified) lead\b/i.test(text)
      || /\b(lead|this lead)'?s score\b/i.test(text)
      || /\bwhat'?s the (lead )?score\b/i.test(text),
    run: (text, ctx) => {
      const id = extractLeadId(text) || ctx.currentLeadId;
      if (id) {
        const lead = leadRepo.getLead(id);
        if (!lead) return notFoundLead(id);
        ctx.currentLeadId = lead.leadId;
        const scoring = leadRepo.calculateScore(lead);
        const events = [
          { name: 'lead_score_calculated', props: { leadId: lead.leadId, score: scoring.score } },
          { name: 'lead_qualified', props: { leadId: lead.leadId, temperature: scoring.temperature } },
        ];
        if (scoring.temperature === 'Hot') events.push({ name: 'hot_lead_identified', props: { leadId: lead.leadId } });
        return {
          text:
            `${lead.leadId} (${lead.name}) scores ${scoring.score}/100 — ${scoring.temperature}. ` +
            `${scoring.reason} Next: ${scoring.nextAction.toLowerCase()}.`,
          scoreCard: { lead, scoring },
          quickReplies: ['Book an appointment', 'Talk to a human'],
          events,
          log: { event: 'lead_qualified', props: { leadId: lead.leadId, score: scoring.score } },
        };
      }
      if (ctx.qual && (ctx.qual.service || ctx.qual.budget !== undefined)) {
        const scoring = scoreQual(ctx.qual);
        return {
          text: `So far this lead scores ${scoring.score}/100 — ${scoring.temperature}. ${scoring.reason}`,
          scoreCard: { lead: null, scoring },
          quickReplies: ['Show available appointments', 'Talk to a human'],
          events: [{ name: 'lead_score_calculated', props: { score: scoring.score } }],
        };
      }
      return {
        text: `Point me at a lead — give me a lead ID (like LEAD-10482) or tell me what the caller needs and I will qualify them.`,
        quickReplies: ['Show hot leads', 'Show my leads'],
      };
    },
  },

  {
    id: 'lead_details',
    match: (text, ctx) =>
      extractLeadId(text) != null
      || (/\b(tell me about|what does (this|the) lead (want|need)|show (me )?(this|the) lead|about this lead|details? (of|for) (this|the) lead)\b/i.test(text) && Boolean(ctx.currentLeadId)),
    run: (text, ctx) => {
      const id = extractLeadId(text) || ctx.currentLeadId;
      const lead = leadRepo.getLead(id);
      if (!lead) return notFoundLead(id);
      ctx.currentLeadId = lead.leadId;
      return {
        text:
          `${lead.leadId} — ${lead.name} (${lead.business || lead.businessType || '—'}). Wants: ${lead.service}. ` +
          `Budget ${budgetStr(lead)}, timeline ${lead.timeline || 'not stated'}, source ${lead.source}. ` +
          `${lead.qualificationStatus} · ${lead.score}/100. ${lead.notes}`,
        lead,
        quickReplies: ['Qualify this lead', 'Book an appointment', 'Hand to a human'],
        events: [{ name: 'lead_viewed', props: { leadId: lead.leadId } }],
      };
    },
  },

  {
    id: 'qualification',
    match: (text, ctx) => {
      if (ctx.qual && ctx.qual._asked) {
        if (!/\b(show|book|schedule|check|metrics|handoff|reset|leads?|appointments?|slots?)\b/i.test(text)) return true;
      }
      return Boolean(
        detectService(text)
        || detectBudget(text) !== undefined
        || leadRepo.normalizeTimeline(text)
        || detectAuthority(text)
        || detectBusinessType(text)
        || /\bi (need|want|'m looking for|am looking for)\b|help (me )?(with|building|creating|to build)|looking to (get|build|launch|start|redo)/i.test(text),
      );
    },
    run: (text, ctx) => {
      ctx.greeted = true;
      if (!ctx.qual) ctx.qual = {};
      const q = ctx.qual;

      const svc = detectService(text);
      if (svc && !q.service) q.service = svc;
      const bt = detectBusinessType(text);
      if (bt && !q.businessType) q.businessType = bt;
      if (q.service && !q.needStrength) q.needStrength = 'good';

      const bud = detectBudget(text);
      if (bud !== undefined) q.budget = bud;
      const tl = leadRepo.normalizeTimeline(text);
      if (tl) q.timeline = tl;
      const auth = detectAuthority(text);
      if (auth) q.authority = auth;

      // resolve the specific question we just asked
      if (q._asked === 'authority' && q.authority == null) {
        if (/\byes\b|i am|that'?s me|correct|it'?s me/i.test(text)) q.authority = 'owner';
        else if (/\bno\b|someone else|my (boss|partner|manager)|not me/i.test(text)) q.authority = 'need to ask boss';
      }
      if (q._asked === 'budget' && q.budget === undefined) {
        if (/don'?t know|not sure|no idea|unsure|later|figure (it )?out/i.test(text)) q.budget = null;
      }
      if (q._asked === 'service' && !q.service) {
        // capture a freeform need verbatim
        const m = text.match(/\b(?:need|want|help with|looking for|build|create)\s+(?:a |an |some )?([a-z][a-z\s/&-]{2,40})/i);
        if (m) { q.service = cap(m[1].trim()); q.needStrength = 'good'; }
      }

      const next = nextQualQuestion(q);
      if (next) {
        q._asked = next.key;
        const captured = [
          svc && `service: ${q.service}`,
          bud !== undefined && `budget: ${typeof q.budget === 'number' ? `$${q.budget.toLocaleString()}` : (q.budget || 'not stated')}`,
          tl && `timeline: ${q.timeline}`,
          auth && 'decision-maker noted',
        ].filter(Boolean);
        const ack = captured.length ? `Got it (${captured.join(', ')}). ` : '';
        return {
          text: `${ack}${next.text}`,
          quickReplies: next.quick,
          events: [{ name: 'lead_viewed', props: { stage: 'qualifying', asked: next.key } }],
        };
      }

      // complete — score + create the lead
      q._asked = null;
      const scoring = scoreQual(q);
      const lead = leadRepo.createLead({
        service: q.service,
        budget: q.budget,
        timeline: q.timeline,
        authority: q.authority,
        needStrength: q.needStrength || 'good',
        businessType: q.businessType || null,
        name: q.name || (q.businessType ? `${cap(q.businessType)} lead` : 'New lead'),
        source: q.source || 'Website',
        notes: `Qualified via assistant: ${q.service}${q.businessType ? ` for a ${q.businessType}` : ''}, ${scoring.normalized.timeline || 'timeline n/a'}.`,
      });
      ctx.currentLeadId = lead.leadId;

      const events = [
        { name: 'lead_created', props: { leadId: lead.leadId } },
        { name: 'lead_score_calculated', props: { leadId: lead.leadId, score: scoring.score } },
        { name: 'lead_qualified', props: { leadId: lead.leadId, temperature: scoring.temperature } },
      ];
      if (scoring.temperature === 'Hot') events.push({ name: 'hot_lead_identified', props: { leadId: lead.leadId } });

      return {
        text:
          `Based on that, ${lead.leadId} is a ${scoring.temperature} lead — ${scoring.score}/100. ` +
          `Next step: ${scoring.nextAction.toLowerCase()}.`,
        scoreCard: { lead, scoring },
        quickReplies: ['Hot', 'Warm'].includes(scoring.temperature)
          ? ['Show available appointments', 'Talk to a human']
          : ['Show lead metrics', 'Talk to a human'],
        events,
        log: { event: 'lead_qualified', props: { leadId: lead.leadId, score: scoring.score, temperature: scoring.temperature } },
      };
    },
  },

  {
    id: 'reset_hint',
    match: (text) => /\breset (the )?(demo|leads?|bookings?|state)\b|\bstart over\b|\bclear (the )?(demo|state)\b/i.test(text),
    run: () => ({
      text: 'Use the ↺ Reset demo button at the top of the chat — it clears captured leads, bookings and the transcript.',
      quickReplies: ['Show my leads'],
    }),
  },
];

/* ---------- fallback ---------- */

function fallback() {
  return {
    text:
      `I can qualify a new lead, score buying intent, show your leads, find and book appointment slots, ` +
      `check a booking, or bring in a human. What do you need?`,
    quickReplies: ['I need an ecommerce website', 'Show hot leads', 'Show available appointments'],
  };
}

export const leadBookingAgent = createAgent({ id: 'lead', intents, fallback });
export default leadBookingAgent;
