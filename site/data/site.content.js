/* ===========================================================
   MusfirahLoom — Website
   site/data/site.content.js

   The marketing-copy registry for the product pages. Curated
   here so the site/ folder stays self-contained (it does not
   import agent or funnel internals). Demo links point at the
   existing, working implementations.
=========================================================== */

/* base = '' from the site root, '../' from campaigns/<slug>.html */
export function NAV(base = '', active = '') {
  return {
    brandHref: `${base}index.html`,
    ctaHref: `${base}index.html#contact`,
    ctaLabel: 'Start a Project',
    active,
    links: [
      { id: 'home', label: 'Home', href: `${base}index.html` },
      { id: 'ai-agents', label: 'AI Agents', href: `${base}ai-agents.html` },
      { id: 'ai-sales-funnel', label: 'AI Funnel', href: `${base}ai-sales-funnel.html` },
      { id: 'campaigns', label: 'Campaigns', href: `${base}campaigns.html` },
      { id: 'portfolio', label: 'Work', href: `${base}index.html#work` },
      { id: 'services', label: 'Services', href: `${base}index.html#services` },
      { id: 'about', label: 'About', href: `${base}index.html#about` },
      { id: 'resume', label: 'Résumé', href: `${base}resume.html` },
      { id: 'contact', label: 'Contact', href: `${base}index.html#contact` },
    ],
  };
}

/* ---------- the 4 AI agents ---------- */
export const AGENTS = [
  {
    id: 'sales',
    no: '01',
    name: 'AI Sales Agent',
    accent: '--agent-sales',
    tagline: 'Engage prospects, understand intent, recommend solutions, and guide customers toward conversion.',
    description:
      'A conversational sales agent that reads what a shopper actually wants — budget, use case, style — '
      + 'then recommends the right products, handles objections, compares options and moves the conversation '
      + 'toward a decision.',
    capabilities: [
      'Sales conversations', 'Intent detection', 'Product recommendations',
      'Objection handling', 'Conversion assistance',
    ],
    workflow: ['Prospect', 'Intent + needs', 'Recommendation', 'Objection handling', 'Add to cart / convert'],
    demoHref: 'agent.html?id=sales',
  },
  {
    id: 'support',
    no: '02',
    name: 'AI Customer Support Agent',
    accent: '--agent-support',
    tagline: 'Answer customer questions instantly and escalate conversations when human support is needed.',
    description:
      'A support agent that resolves the repetitive tickets — order status, returns and exchanges, policy '
      + 'questions — from a real knowledge base, and hands off cleanly to a person the moment a case needs one.',
    capabilities: [
      'Customer support', 'FAQ handling', 'Order assistance', 'Troubleshooting', 'Human handoff',
    ],
    workflow: ['Question', 'Understand intent', 'Answer / order lookup', 'Resolve', 'Human handoff if needed'],
    demoHref: 'agent.html?id=support',
  },
  {
    id: 'cart',
    no: '03',
    name: 'AI Cart Recovery Agent',
    accent: '--agent-cart',
    tagline: 'Recover abandoned shopping opportunities with intelligent follow-up.',
    description:
      'A recovery agent that reads why a cart was abandoned — price, shipping, uncertainty, timing — chooses '
      + 'the smallest incentive that actually addresses it, drafts the follow-up message, and nudges the '
      + 'shopper back to checkout.',
    capabilities: [
      'Cart recovery', 'Follow-up', 'Customer intent', 'Recovery messaging', 'Conversion assistance',
    ],
    workflow: ['Abandoned cart', 'Detect objection', 'Choose incentive', 'Personalised follow-up', 'Back to checkout'],
    demoHref: 'agent.html?id=cart',
  },
  {
    id: 'lead',
    no: '04',
    name: 'AI Lead + Booking Agent',
    accent: '--agent-lead',
    tagline: 'Qualify prospects, identify high-intent leads, and move them toward booking.',
    description:
      'A lead-intake agent that runs a conversational BANT qualification, scores buying intent transparently, '
      + 'prioritises the leads worth chasing, and books the qualified ones straight into an available slot.',
    capabilities: [
      'Lead qualification', 'Lead scoring', 'Booking', 'Priority detection', 'Sales handoff',
    ],
    workflow: ['Enquiry', 'Qualify (BANT)', 'Score intent', 'Prioritise', 'Book / hand to sales'],
    demoHref: 'agent.html?id=lead',
  },
];

/* ---------- the flagship AI Sales Funnel ---------- */
export const FUNNEL = {
  badge: 'Flagship System',
  name: 'AI Sales Funnel System',
  headline: 'Turn traffic into customers with AI.',
  lede:
    'One connected AI system for capturing leads, qualifying prospects, recommending solutions, making '
    + 'offers, booking customers and following up automatically — landing page to conversion, without '
    + 'adding headcount.',
  demoHref: 'funnel.html',
  consoleHref: 'funnel-admin.html',
  campaignsHref: 'campaigns.html',
  workflow: [
    'Traffic', 'Landing page', 'Lead capture', 'AI sales assistant', 'Qualification',
    'Lead score', 'Recommendation', 'Offer', 'Booking / checkout', 'Follow-up', 'Conversion',
  ],
  problem:
    'Most funnels leak. A visitor lands, no one qualifies them, the follow-up is a generic drip, and the '
    + 'abandoned ones are never worked. Every stage is a separate tool and a separate hand-off.',
  solution:
    'The AI Sales Funnel makes every stage one system. The AI assistant qualifies in conversation, scores '
    + 'intent, recommends from your real catalogue, presents a live offer, books the appointment or takes '
    + 'the checkout, then runs the follow-up and recovery — with a CRM and analytics console behind it.',
  stages: [
    ['AI Sales Assistant', 'A conversational agent on the landing page that understands intent and guides the visitor.'],
    ['Lead Capture', 'A short form or an in-chat capture — name, contact, interest — into the CRM.'],
    ['Qualification', 'Configurable questions with per-answer scores across five axes (budget, authority, need, timing, fit).'],
    ['Lead Scoring', 'A transparent 0–100 score and a Hot / Warm / Cold read, with the reasoning shown.'],
    ['Recommendations', 'Matched from the business’s real catalogue — services, homes or products — never invented.'],
    ['Offers', 'A live, time-boxed offer from the config, with a real expiry.'],
    ['Booking / Checkout', 'A viewing or appointment into a real slot (double-book prevented), or an add-to-cart checkout.'],
    ['Follow-up', 'A scheduled sequence with stop conditions — no drip after the customer has acted.'],
    ['Recovery', 'Abandoned leads and carts worked with the right incentive.'],
    ['CRM & Analytics', 'Every lead, stage and conversion in one console — funnel, follow-up, recovery, configuration.'],
  ],
};

/* ---------- the 3 industry campaign systems ---------- */
export const CAMPAIGNS = [
  {
    id: 'salon',
    slug: 'salon-spa',
    name: 'Salon & Spa AI System',
    short: 'Salon & Spa',
    accent: '--agent-support',
    tagline: 'Turn late-night enquiries into confirmed appointments — and one visit into a regular.',
    objectives: ['Lead Generation', 'Appointment Booking', 'Customer Support', 'Customer Retention'],
    agents: [
      ['AI Sales Funnel', 'Landing page, AI assistant, treatment match, offer'],
      ['AI Lead + Booking Agent', 'Qualifies the enquiry and books the appointment'],
      ['AI Customer Support Agent', 'Handles reschedules and pre-visit questions'],
    ],
    problem:
      'Enquiries arrive at midnight through Instagram and WhatsApp. By the time the salon replies, the client '
      + 'has booked elsewhere — and there is no system to bring past clients back.',
    solution:
      'The AI assistant answers instantly, matches the right treatment, qualifies the enquiry, books a real '
      + 'slot and sends the confirmation and reminder. A follow-up sequence brings clients back for the next visit.',
    journey: [
      'Visitor arrives from Instagram or a Google search',
      'AI assistant asks what they are looking for and when',
      'Matches a treatment and shows the new-client package',
      'Qualifies (occasion, timing) and books a real slot',
      'Confirmation + reminder; follow-up invites the next visit',
    ],
    demoHref: 'funnel.html?campaign=salon',
    consoleHref: 'funnel-admin.html?campaign=salon',
  },
  {
    id: 'realestate',
    slug: 'real-estate',
    name: 'Real Estate AI System',
    short: 'Real Estate',
    accent: '--agent-lead',
    tagline: 'Qualify buyers before an agent spends a minute — and book only the viewings worth doing.',
    objectives: ['Lead Generation', 'Lead Qualification', 'Appointment Booking', 'Follow-up', 'Sales Conversion'],
    agents: [
      ['AI Sales Funnel', 'Landing page, AI assistant, shortlist match, offer'],
      ['AI Lead + Booking Agent', 'Qualifies buyers on budget, timeline and intent, and books the viewing'],
      ['AI Customer Support Agent', 'Answers post-viewing questions and reschedules'],
    ],
    problem:
      'Portal leads are mostly tyre-kickers. Agents burn hours on calls that go nowhere, and the genuinely '
      + 'ready buyers wait days for a reply.',
    solution:
      'The AI assistant builds a matched shortlist, qualifies on budget, timeline and buy-to-live vs invest, '
      + 'scores the lead, and books viewings only for the ones that clear the bar — with automated follow-up for the rest.',
    journey: [
      'Buyer lands on a property or area page',
      'AI assistant asks budget, timeline and what they are buying for',
      'Builds a matched shortlist and shows priority-access offer',
      'Scores the lead; books a viewing for qualified buyers',
      'Follow-up nurtures the not-yet-ready; advisor picks up the hot ones',
    ],
    demoHref: 'funnel.html?campaign=realestate',
    consoleHref: 'funnel-admin.html?campaign=realestate',
  },
  {
    id: 'ecommerce',
    slug: 'ecommerce',
    name: 'E-commerce AI System',
    short: 'E-commerce',
    accent: '--agent-sales',
    tagline: 'Help shoppers find the right thing, raise the order value, and win back the carts that leave.',
    objectives: ['Product Discovery', 'Sales Conversion', 'Upsell / Cross-sell', 'Cart Recovery', 'Customer Retention'],
    agents: [
      ['AI Sales Funnel', 'Storefront, AI assistant, guided discovery, checkout'],
      ['AI Sales Agent', 'Understands intent and recommends from the real catalogue'],
      ['AI Cart Recovery Agent', 'Works abandoned carts with the right incentive'],
    ],
    problem:
      'Shoppers cannot find the right product, average order value is flat, and two in three carts are '
      + 'abandoned with no follow-up.',
    solution:
      'The AI assistant runs guided product discovery, recommends and compares from the real catalogue, adds '
      + 'a complementary upsell at the right moment, takes the checkout, and hands abandoned carts to the '
      + 'recovery agent.',
    journey: [
      'Visitor lands on the storefront',
      'AI assistant runs guided discovery — need, budget, style',
      'Recommends and compares real products; adds to cart',
      'One well-chosen upsell, then checkout',
      'Abandoned carts recovered; post-purchase follow-up for repeat orders',
    ],
    demoHref: 'funnel.html?campaign=ecommerce',
    consoleHref: 'funnel-admin.html?campaign=ecommerce',
  },
];

export function getCampaign(idOrSlug) {
  return CAMPAIGNS.find((c) => c.id === idOrSlug || c.slug === idOrSlug) || null;
}

/* ---------- the ecosystem ---------- */
export const ECOSYSTEM = {
  levels: [
    ['4 AI Agents', 'The intelligent workers — one job each, done end to end.'],
    ['1 AI Sales Funnel', 'The core conversion infrastructure that connects them.'],
    ['3 AI Campaign Systems', 'Ready-to-deploy industry solutions built on the agents + funnel.'],
    ['Business automation', 'Capture, convert, support and retain — on autopilot.'],
    ['Growth', 'More qualified pipeline, higher conversion, less manual work.'],
  ],
};
