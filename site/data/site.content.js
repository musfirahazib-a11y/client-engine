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
    ctaHref: `${base}start.html`,
    ctaLabel: 'Start a Project',
    active,
    links: [
      { id: 'home', label: 'Home', href: `${base}index.html` },
      { id: 'services', label: 'Services', href: `${base}index.html#services` },
      { id: 'solutions', label: 'Solutions', href: `${base}index.html#solutions` },
      { id: 'portfolio', label: 'Work', href: `${base}index.html#work` },
      { id: 'ai-agents', label: 'AI Agents', href: `${base}ai-agents.html` },
      { id: 'ai-sales-funnel', label: 'AI Funnel', href: `${base}ai-sales-funnel.html` },
      { id: 'campaigns', label: 'Campaigns', href: `${base}campaigns.html` },
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

/* ===========================================================
   Phase 1 · client-conversion registry
   -----------------------------------------------------------
   Additive only. Nothing above imports these names. They are
   consumed later by the Services pages (STEP 2), the Solution
   pages (STEP 3) and the homepage rework (STEP 4). Until those
   steps wire them in, these exports are dormant and change
   nothing on any existing page.

   Copy rule: the portfolio projects are concept demos and are
   labelled as such — no client names, no results, no claims of
   live integrations that do not exist.
=========================================================== */

/* ---------- how we work — shared 4-step process ---------- */
export const PROCESS = [
  { no: '01', name: 'Discover', blurb: 'A short call to understand your business, your customers and what a visitor needs to see before they get in touch.' },
  { no: '02', name: 'Strategize', blurb: 'A clear plan — pages, messaging, structure and the one action every page should drive.' },
  { no: '03', name: 'Build', blurb: 'Design and development on the MusfirahLoom system, shown to you on a staging link as it comes together.' },
  { no: '04', name: 'Launch & Grow', blurb: 'Go live, hand over, then keep it healthy and improving through a monthly care or growth plan.' },
];

/* ---------- productized services ---------- */
export const SERVICES = [
  {
    id: 'conversion-websites',
    name: 'Conversion-Focused Business Websites',
    tagline: 'A professional digital presence built to turn visitors into inquiries.',
    who: 'Service businesses, consultants, agencies, clinics, salons and growing local businesses with an outdated or DIY site.',
    problem: 'The current site looks amateur, is slow on phones, and doesn’t generate inquiries — visitors leave without making contact.',
    build: [
      'A fast, mobile-first site on the MusfirahLoom design system',
      'Clear positioning and messaging for a non-technical visitor',
      'Strong calls to action and a single primary next step per page',
      'Lead capture, contact and WhatsApp routing where it fits',
      'Sound information architecture, basic SEO structure and accessibility',
    ],
    included: [
      'Design and build of the agreed pages',
      'Responsive layouts — desktop, tablet, mobile',
      'Contact form and enquiry routing',
      'Basic on-page SEO — titles, meta, headings, semantic markup',
      'A staging preview and a handover walkthrough',
    ],
    proofHref: 'work/fashion.html',
    proofLabel: 'See the Atelier Nocturne concept build',
    tiers: [
      { name: 'Starting', scope: 'Up to 4 pages, one layout system, contact form, basic SEO, 1 revision round.', price: 'from $650' },
      { name: 'Typical', scope: '6–8 pages, custom sections, copy polish, booking embed, conversion structure, 2 revision rounds.', price: '$1,200–$2,400' },
      { name: 'Custom quote', scope: 'CMS or blog, multi-language, bespoke design system, 10+ pages, integrations or migration.', price: '$2,800+' },
    ],
    upgrades: ['Copywriting', 'Logo / brand refresh', 'Extra landing pages', 'AI Website Assistant', 'SEO starter'],
    carePlan: 'Website Care Plan — $99–$149/mo, optional, starts after launch.',
    faq: [
      { q: 'How long does it take?', a: 'Most builds are 2–4 weeks from kickoff, depending on page count and how quickly content is ready.' },
      { q: 'Do I own the site?', a: 'Yes. On final payment the code and accounts are yours.' },
      { q: 'What do you need from me?', a: 'Copy, images, brand assets and access — collected in a shared folder at kickoff. I can help shape the copy.' },
    ],
  },
  {
    id: 'ecommerce-systems',
    name: 'E-commerce Website Systems',
    tagline: 'A store that helps people find the right product and buy without friction.',
    who: 'Fashion, jewellery, beauty, skincare and product brands, and boutiques on a generic template that under-converts.',
    problem: 'Traffic arrives but doesn’t convert, the store looks generic, average order value is flat, and abandoned carts are never followed up.',
    build: [
      'An editorial storefront on the MusfirahLoom design system',
      'Product and collection pages built for discovery',
      'Cart and checkout integration — Shopify, or a WhatsApp-order flow where that fits',
      'Email capture and considered upsell placement',
      'Optional AI product assistant and cart-recovery flow',
    ],
    included: [
      'Storefront design and build',
      'Home, product and collection templates',
      'Product data setup for the agreed range',
      'Responsive layouts and a speed pass',
      'Staging preview and handover walkthrough',
    ],
    proofHref: 'work/ecommerce.html',
    proofLabel: 'See the AÉRA skincare concept build',
    tiers: [
      { name: 'Starting', scope: 'Theme setup and brand styling, up to 20 products, home / product / collection templates, basic analytics.', price: 'from $1,400' },
      { name: 'Typical', scope: 'Custom sections, guided product discovery, upsell blocks, cart-recovery flow, speed pass, 2 revision rounds.', price: '$3,000–$5,500' },
      { name: 'Custom quote', scope: 'Full editorial redesign, AI product advisor, subscriptions or bundles, platform migration, 50+ SKUs or B2B.', price: '$6,500+' },
    ],
    upgrades: ['Product-photo art direction', 'Email / SMS flows', 'AI product advisor', 'Ad landing pages', 'Platform migration'],
    carePlan: 'Store Care + Growth Plan — $149–$249/mo, optional, starts after launch.',
    faq: [
      { q: 'Which platform?', a: 'Usually Shopify for a full store. For a small range, a lighter build with WhatsApp or a hosted checkout can work — decided on the call.' },
      { q: 'Can you move my existing store?', a: 'Yes — migration is quoted separately based on product count and complexity.' },
      { q: 'Is the AI product assistant included?', a: 'It’s an optional upgrade with its own care plan. The store works fully without it.' },
    ],
  },
  {
    id: 'ai-website-assistants',
    name: 'AI Website Assistants',
    tagline: 'A guide on your site that answers, recommends and captures — offered as an upgrade to a website build.',
    who: 'Any business with a website and repetitive inquiries — services, e-commerce, real estate, clinics.',
    problem: 'Leads are lost after hours and the team answers the same handful of questions all day instead of doing higher-value work.',
    build: [
      'An assistant grounded in your own content and catalogue',
      'FAQ and intent handling for your common questions',
      'Service or product recommendations and visitor guidance',
      'Lead capture and information collection, with a clean human handoff',
      'Appointment-inquiry support where relevant',
    ],
    included: [
      'Assistant setup on your agreed content',
      'Brand-styled chat interface',
      'Lead-capture handoff to email or a sheet',
      'A staging preview and a short admin walkthrough',
      'An honest scope note — what is demo, prototype and production-integrated',
    ],
    proofHref: 'ai-agents.html',
    proofLabel: 'Try the four AI agent demos',
    tiers: [
      { name: 'Starting', scope: 'Add-on to a build: FAQ + intent assistant on ~30 topics, lead-capture handoff, email notifications.', price: 'from $600' },
      { name: 'Typical', scope: 'Catalogue or service-aware recommendations, qualification questions, booking-inquiry handoff, CRM or sheet push, brand styling.', price: '$1,500–$3,000' },
      { name: 'Custom quote', scope: 'Lead scoring, multi-intent routing, WhatsApp or Instagram channel, deep CRM integration, multilingual, analytics dashboard.', price: '$3,500+' },
    ],
    upgrades: ['Extra channels — WhatsApp, Instagram', 'Deeper CRM integration', 'Multilingual', 'Monthly prompt tuning'],
    carePlan: 'AI Assistant Care Plan — $120–$450/mo, required. API usage billed to you or passed through +10%.',
    faq: [
      { q: 'Is this a real AI or a scripted demo?', a: 'The portfolio agents run in demo mode on sample data. A paid build is wired to a real language model and your real content — the scope note spells out exactly what is connected.' },
      { q: 'Why is a care plan required?', a: 'An assistant needs its knowledge kept current and its answers reviewed against real conversations, or it goes stale and starts to mislead.' },
      { q: 'Can it book appointments?', a: 'It can qualify and hand off a booking inquiry. Full calendar booking is an integration quoted as an upgrade.' },
    ],
  },
];

export function getService(id) {
  return SERVICES.find((s) => s.id === id) || null;
}

/* ---------- industry solution pages ---------- */
export const SOLUTIONS = [
  {
    slug: 'local-business',
    name: 'Local & Service Businesses',
    hero: {
      headline: 'The website and inquiry system your competitors don’t have yet.',
      sub: 'A fast, professional site for salons, clinics, studios, trades and professional services — built so more visitors turn into booked inquiries.',
    },
    pains: [
      'Inquiries arrive after hours through Instagram or the contact form and go cold before anyone replies',
      'The phone rings during appointments and calls get missed',
      'The current “site” is a Facebook page or an old builder template',
      'There is no simple way to bring past clients back',
    ],
    solution: 'A clean, mobile-first site with a clear message and one obvious next step, plus an optional assistant that answers common questions, points visitors to the right service and captures the inquiry — day or night.',
    features: [
      'Clear services and pricing structure a first-time visitor understands',
      'A prominent booking or inquiry action on every page',
      'WhatsApp and click-to-call routing where it fits',
      'Optional AI assistant for after-hours questions and capture',
    ],
    demo: { href: 'campaigns/salon-spa.html', label: 'See the Salon & Spa concept system' },
    benefits: [
      'Capture inquiries that arrive outside opening hours',
      'Fewer missed opportunities from unanswered calls',
      'A professional first impression that matches the quality of the service',
    ],
    aiUpgrade: 'Add an AI Website Assistant to handle repeat questions and capture leads when you can’t pick up.',
    faq: [
      { q: 'Do I need to be technical?', a: 'No. You get a short walkthrough and, if you want, a monthly care plan so you never touch the code.' },
      { q: 'How much and how long?', a: 'Most local-business sites fall in the $650–$2,400 range and take 2–4 weeks. You get a fixed quote after the discovery call.' },
    ],
  },
  {
    slug: 'ecommerce',
    name: 'E-commerce & Product Brands',
    hero: {
      headline: 'A store that helps shoppers buy — discovery and recovery built in.',
      sub: 'An editorial storefront for product brands that under-convert on a generic theme.',
    },
    pains: [
      'Traffic comes from ads and social but doesn’t convert',
      'The store looks like every other template',
      'Average order value is flat — no upsell at the right moment',
      'Most carts are abandoned and nothing follows up',
    ],
    solution: 'A brand-led storefront with guided product discovery, considered upsell placement and a cart-recovery flow — with an optional AI product advisor that recommends from your real catalogue.',
    features: [
      'Editorial home, product and collection templates',
      'Guided discovery that narrows to the right product',
      'Upsell and cross-sell blocks placed where they convert',
      'A cart-recovery flow for abandoned checkouts',
    ],
    demo: { href: 'work/ecommerce.html', label: 'See the AÉRA skincare concept build' },
    benefits: [
      'More conversions from the traffic you already pay for',
      'Higher average order value from well-placed upsells',
      'Recovered revenue from carts that would otherwise be lost',
    ],
    aiUpgrade: 'Add an AI product advisor and cart-recovery assistant, grounded in your catalogue.',
    faq: [
      { q: 'Shopify or something else?', a: 'Usually Shopify. A small range can run on a lighter setup — decided on the call.' },
      { q: 'Can you redesign without rebuilding everything?', a: 'Often yes — a focused conversion pass on the templates that matter most is a common starting point.' },
    ],
  },
  {
    slug: 'real-estate',
    name: 'Real Estate',
    hero: {
      headline: 'Your own branded property search — with buyer inquiry capture built in.',
      sub: 'A site for independent agents, consultants and small agencies that want presence beyond the portals.',
    },
    pains: [
      'Portal leads are mostly unqualified and slow to convert',
      'Hours are lost on calls with buyers who were never ready',
      'Genuinely ready buyers wait days for a reply',
      'There is no branded web presence to point people to',
    ],
    solution: 'A branded listings site with search and filtering, clear area and advisor pages, and an inquiry capture flow — plus an optional assistant that asks budget, timeline and intent before an inquiry reaches you.',
    features: [
      'A listings grid and detail view with strong imagery',
      'A search and filter interface',
      'Area guides and advisor profiles',
      'Buyer inquiry capture, with optional budget and timeline qualification',
    ],
    demo: { href: 'work/real-estate.html', label: 'See the Meridian Estates concept build' },
    benefits: [
      'Inquiries arrive with context instead of a bare phone number',
      'Faster response to the buyers who are actually ready',
      'A branded presence you control, beyond the portals',
    ],
    aiUpgrade: 'Add the AI Lead + Booking assistant to qualify buyers on budget and timeline before handoff.',
    faq: [
      { q: 'Where do listings come from?', a: 'Managed manually for a small set, or fed from a sheet or a portal export — scoped on the call.' },
      { q: 'Is this an MLS or portal integration?', a: 'Not by default. Direct portal or CRM integrations are quoted as an upgrade.' },
    ],
  },
  {
    slug: 'fashion',
    name: 'Fashion & Beauty Brands',
    hero: {
      headline: 'A website as premium as your brand already looks.',
      sub: 'A cinematic brand site for apparel, jewellery, beauty and studio labels.',
    },
    pains: [
      'The brand looks premium on Instagram and cheap on the website',
      'There is no proper lookbook or collection showcase',
      'Campaigns have nowhere to live outside social',
      'A builder template limits the art direction',
    ],
    solution: 'An editorial brand site — full-bleed hero, lookbook, collection showcase, campaign section, studio story and newsletter — with optional light commerce or a clean link to your store.',
    features: [
      'Art-directed hero and editorial photography layouts',
      'A lookbook and collection showcase',
      'A campaign or film section',
      'Newsletter capture and a press or stockist section',
    ],
    demo: { href: 'work/fashion.html', label: 'See the Atelier Nocturne concept build' },
    benefits: [
      'Credibility with stockists, press and collaborators',
      'A permanent home for campaigns and collections',
      'A foundation to grow into a full store later',
    ],
    aiUpgrade: 'Add an assistant for size guidance, product questions and private-appointment requests.',
    faq: [
      { q: 'Can it sell products?', a: 'Yes — light commerce or a Shopify link at this tier, or a full store as the E-commerce service.' },
      { q: 'Do you help with the photography?', a: 'I can art-direct a shoot or work with what you have. Shoot production is a separate upgrade.' },
    ],
  },
  {
    slug: 'ai-automation',
    name: 'AI Automation & Lead Systems',
    hero: {
      headline: 'Stop losing the leads you already paid for.',
      sub: 'A connected capture-to-conversion system for businesses running paid traffic into a leaky pipeline.',
    },
    pains: [
      'Traffic is paid for, then leaks — no one qualifies it',
      'Follow-up is a generic drip that ignores what the lead said',
      'Abandoned leads and carts are never worked',
      'Every stage is a separate tool and a separate handoff',
    ],
    solution: 'The AI Sales Funnel — one system for capture, conversational qualification, transparent scoring, recommendations, offers, booking or checkout, follow-up and recovery, with a CRM and analytics console behind it.',
    features: [
      'Conversational qualification with a visible, understandable score',
      'Recommendations matched from your real catalogue',
      'Follow-up sequences that stop once the customer acts',
      'A console for every lead, stage and conversion',
    ],
    demo: { href: 'ai-sales-funnel.html', label: 'Explore the AI Sales Funnel system' },
    benefits: [
      'A qualified pipeline instead of raw form fills',
      'Better conversion on the traffic budget you already have',
      'Less manual chasing across disconnected tools',
    ],
    aiUpgrade: 'This is the AI system itself — scoped per business after a discovery call.',
    faq: [
      { q: 'Is the demo the real thing?', a: 'The demo runs on sample data to show the flow. A build connects it to a live model and your tools — scoped and quoted per project.' },
      { q: 'Do I need to run ads for this to help?', a: 'It helps any steady inflow of leads, but the return is clearest when you’re already paying for traffic.' },
    ],
  },
];

/* ---------- shared FAQ sets ---------- */
export const FAQ = {
  home: [
    { q: 'What exactly do you build?', a: 'Conversion-focused business websites, e-commerce stores, and AI website assistants as an optional upgrade. Every engagement starts with a short call to scope the work.' },
    { q: 'How much does a project cost?', a: 'Websites typically run $650–$2,400, e-commerce $1,400–$5,500, and an AI assistant add-on from $600. You get a fixed quote after the discovery call, not a surprise invoice.' },
    { q: 'How long does it take?', a: 'Most projects are 2–4 weeks from kickoff, depending on scope and how quickly content is ready.' },
    { q: 'Are the portfolio projects real clients?', a: 'They are concept builds — real front-ends for fictional brands, made to show the standard of the work. They are labelled as demos throughout; no client names or results are implied.' },
    { q: 'Do you work with international clients?', a: 'Yes — remote, across the UK, UAE, US, Canada and beyond. Communication is in English, over your preferred channel.' },
    { q: 'What happens after launch?', a: 'You own the site. An optional monthly care or growth plan keeps it healthy, updated and improving.' },
  ],
  scope: [
    { q: 'How many revisions are included?', a: 'Two consolidated revision rounds unless your package says otherwise. A round is one combined set of feedback, not endless small changes.' },
    { q: 'What if I need something outside the agreed scope?', a: 'It gets a short written quote through a change-request form before any work starts — so there are no surprise costs.' },
    { q: 'What do you need from me, and by when?', a: 'Copy, images, brand assets and any accounts, in a shared folder by the date agreed at kickoff. Feedback within 48 hours keeps the timeline on track.' },
    { q: 'How does payment work?', a: '50% to start, 50% before launch. Care and growth plans are billed monthly and are always optional.' },
  ],
};
