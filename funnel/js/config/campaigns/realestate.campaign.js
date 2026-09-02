/* ===========================================================
   MusfirahLoom — AI Sales Funnel · Demo Campaign #2
   config/campaigns/realestate.campaign.js

   "Aurora Bay Realty" — a fictitious premium real-estate
   agency. Goal: turn property enquiries into qualified buyers
   with a booked viewing. Full funnel config in the shared
   schema; the campaign shell loads it by id.
=========================================================== */

const DAY = 86400000;
const iso = (d = 0) => new Date(Date.now() + d * DAY).toISOString();

export const REALESTATE_CONFIG = {
  meta: {
    campaignId: 'realestate',
    niche: 'real-estate',
    schema: 1,
    demo: true,
    conversionGoal: 'viewing',
    goalLabel: 'Viewings booked',
    selectorIcon: '⌂',
    selectorBlurb: 'Turn property inquiries into qualified buyers.',
    demoCta: {
      text: 'This is an interactive demo of the AI system behind Aurora Bay Realty. Want it running for your agency?',
      primary: { label: 'Book a demo', href: 'https://wa.me/923132028898?text=Hi%2C%20I%20saw%20the%20Real%20Estate%20AI%20demo%20and%20want%20one%20for%20my%20business.' },
      secondary: { label: 'See all campaigns', href: 'campaigns.html' },
    },
    caseStudy: {
      problem:
        'Agents field dozens of "is this still available?" messages a day, most from browsers with no budget or timeline. '
        + 'The genuinely ready buyers wait hours for a reply and book viewings elsewhere.',
      solution:
        'The AI property consultant answers instantly, qualifies budget / timeline / financing / decision-makers, matches '
        + 'live inventory with the reason each home fits, books the viewing into the agent\'s calendar, and only then hands '
        + 'a fully-briefed lead to a human.',
      journey: [
        'Portal / social / paid ad → landing page',
        'AI property consultant: buy or rent, area, budget, timeline, financing',
        'Transparent lead score (HOT / WARM / COLD)',
        'Matched shortlist from live inventory + priority-access offer',
        'Viewing booked into the shared calendar',
        'Automated follow-up until booked; abandoned enquiries queued for recovery',
      ],
      impact: [
        ['Visitor → lead', '27%'],
        ['Lead → qualified', '62%'],
        ['Qualified → viewing', '44%'],
        ['Time to first reply', 'instant'],
      ],
    },
    agents: [
      { id: 'lead', role: 'Qualifies buyers and books the viewing' },
      { id: 'support', role: 'Answers post-viewing questions and reschedules' },
    ],
  },

  traffic: {
    channels: ['instagram', 'facebook', 'google', 'tiktok', 'youtube', 'email', 'direct', 'paid'],
    referrerMap: {
      'instagram.com': 'instagram', 'l.instagram.com': 'instagram',
      'facebook.com': 'facebook', 'l.facebook.com': 'facebook',
      'google.': 'google', 'bing.com': 'google', 'tiktok.com': 'tiktok',
      'youtube.com': 'youtube', 't.co': 'twitter',
    },
  },

  business: {
    name: 'Aurora Bay Realty',
    logoText: 'Aurora Bay',
    tagline: 'Waterfront homes, matched to you by AI.',
    description:
      'Aurora Bay Realty helps buyers and investors find the right waterfront home in Port Aurora — without the endless '
      + 'portal scrolling. Tell our assistant what matters and get a shortlist, a viewing and a dedicated advisor.',
    email: 'hello@aurorabay.example',
    phone: '+1 (555) 018-4420',
    whatsapp: '15550184420',
    address: 'Marina District, Port Aurora',
    hours: 'Mon–Sat, 9:00am–7:00pm',
  },

  branding: { primary: '#2F5D62', secondary: '#C9A66B', buttonStyle: 'pill' },

  seo: {
    title: 'Aurora Bay Realty — AI-matched waterfront homes in Port Aurora',
    description:
      'Skip the portal scroll. Tell Aurora Bay Realty\'s AI advisor your budget and timeline and get a matched '
      + 'shortlist, a viewing slot and a dedicated human advisor.',
    canonical: '', ogImage: '',
  },

  landing: {
    hero: {
      eyebrow: 'AI-guided home search',
      headline: 'Find a property that fits your life — without the endless scroll.',
      sub:
        'Answer a few quick questions. Our AI advisor builds your shortlist, explains why each home fits, and books '
        + 'your viewing. A human advisor takes it from there.',
      ctaPrimary: { label: 'Start my match', action: 'lead' },
      ctaSecondary: { label: 'See featured homes', action: 'scroll:listings' },
      trust: ['120+ waterfront homes', 'Viewings in 48h', 'No obligation'],
    },
    problem: {
      title: 'Buying near the water shouldn\'t feel like a second job.',
      points: [
        'Portals bury the good listings under sponsored noise.',
        'Agents chase every lead the same way — regardless of what you actually need.',
        'By the time you\'ve shortlisted, the best homes are already under offer.',
      ],
    },
    solution: {
      title: 'One conversation. A shortlist that actually fits.',
      body:
        'Aurora Bay\'s assistant qualifies what you need — budget, timeline, financing, who\'s deciding — then matches '
        + 'it against live inventory and hands you to a human advisor with the context already gathered.',
      points: [
        'Matched to your budget and timeline, not the newest listing.',
        'Every recommendation comes with the reason it fits.',
        'Priority preview access to homes before they hit the portals.',
      ],
    },
    steps: [
      { n: 1, title: 'Tell us what matters', body: 'Purpose, budget, timeline, decision-makers, financing.' },
      { n: 2, title: 'Get your shortlist', body: 'The assistant matches live inventory and explains each pick.' },
      { n: 3, title: 'Book a viewing', body: 'Pick a slot that works. A named advisor confirms and prepares.' },
      { n: 4, title: 'Move forward', body: 'Your advisor handles offers, paperwork and follow-up end to end.' },
    ],
    benefits: [
      { icon: '◎', title: 'Matched, not spammed', body: 'You only see homes inside your stated budget and timeline.' },
      { icon: '⧗', title: 'Faster to a viewing', body: 'Qualified leads get a confirmed slot within 48 hours.' },
      { icon: '☺', title: 'One advisor, full context', body: 'No repeating yourself — your answers come with the handoff.' },
      { icon: '✦', title: 'Priority access', body: 'See select homes before they\'re listed publicly.' },
    ],
    features: [
      { title: 'Live inventory match', body: 'Recommendations are drawn only from current, real listings — never invented.' },
      { title: 'Financing-aware', body: 'Cash, pre-approved or not yet approved — the assistant adapts the path.' },
      { title: 'Human handoff, any time', body: 'Ask for an advisor at any point and the conversation transfers with its history.' },
      { title: 'Automated follow-up', body: 'Gentle, useful nudges until you book — and they stop the moment you do.' },
    ],
    social: {
      note: 'Illustrative examples — synthetic, shown to demonstrate the layout.',
      testimonials: [
        { quote: 'I had three viewings booked in a week, all inside budget. No time wasted.', name: 'Sample buyer', role: 'First-time buyer', synthetic: true },
        { quote: 'The shortlist actually understood that I was buying to rent out, not to live in.', name: 'Sample investor', role: 'Portfolio investor', synthetic: true },
      ],
    },
    faqEnabled: true,
    finalCta: {
      headline: 'Ready to see homes that fit?',
      sub: 'Two minutes now saves weeks of scrolling. Start your match — no obligation.',
      label: 'Start my match',
    },
    footerNote: 'Aurora Bay Realty is a fictitious business used to demonstrate the AI Sales Funnel System.',
  },

  faqs: [
    { q: 'Is there any cost to use the assistant?', a: 'No. The matching, shortlist and first viewing are free and carry no obligation.' },
    { q: 'How fast can I view a home?', a: 'Qualified enquiries are offered a confirmed viewing slot within 48 hours, subject to availability.' },
    { q: 'Do I need mortgage pre-approval first?', a: 'No — the assistant adapts. If you\'re not yet approved, an advisor can point you to next steps.' },
    { q: 'Will my details be shared?', a: 'Your answers go only to your assigned Aurora Bay advisor. Nothing is sold or shared externally.' },
    { q: 'Can I talk to a person instead?', a: 'Any time. Ask for an advisor in the chat and the conversation transfers with everything you\'ve told us.' },
  ],

  listings: [
    { id: 'AB-101', title: 'Marina Loft — 2 Bed', category: 'Condo', price: 640000, priceLabel: 'from $640,000', area: 'Marina District', beds: 2, baths: 2, sqft: 1180, features: ['Direct water view', '24h concierge', 'Secure parking'], blurb: 'Corner loft with a full-height marina view, in a concierge building two minutes from the boardwalk.', tags: ['condo', 'modern', 'live-in', 'couple', 'investor', 'move-in-ready'], cta: { label: 'Book a viewing', action: 'book' } },
    { id: 'AB-118', title: 'Boardwalk Townhouse — 3 Bed', category: 'Townhouse', price: 920000, priceLabel: 'from $920,000', area: 'North Boardwalk', beds: 3, baths: 3, sqft: 1960, features: ['Private roof terrace', 'Garage', 'Family-friendly street'], blurb: 'End-of-row townhouse with a roof terrace over the water and a garden — built for family living.', tags: ['townhouse', 'family', 'live-in', 'garden', 'space'], cta: { label: 'Book a viewing', action: 'book' } },
    { id: 'AB-124', title: 'Harbour Studio — Investor Unit', category: 'Studio', price: 385000, priceLabel: 'from $385,000', area: 'Old Harbour', beds: 0, baths: 1, sqft: 520, features: ['Managed rental scheme', 'High yield', 'Low fees'], blurb: 'Turn-key studio in the managed harbour scheme — currently tenanted at a 6.2% gross yield.', tags: ['studio', 'investor', 'rental', 'entry-level', 'tenanted'], cta: { label: 'Request the numbers', action: 'quote' } },
    { id: 'AB-140', title: 'Lighthouse Penthouse — 4 Bed', category: 'Penthouse', price: 1750000, priceLabel: 'from $1,750,000', area: 'Aurora Point', beds: 4, baths: 4, sqft: 3120, features: ['360° views', 'Private lift', 'Two terraces'], blurb: 'The point\'s only penthouse — wraparound views, private lift access and two entertaining terraces.', tags: ['penthouse', 'luxury', 'live-in', 'premium', 'view'], cta: { label: 'Arrange a private tour', action: 'book' } },
    { id: 'AB-155', title: 'Cove Cottage — 2 Bed', category: 'House', price: 540000, priceLabel: 'from $540,000', area: 'Willow Cove', beds: 2, baths: 1, sqft: 1040, features: ['Private mooring', 'Renovated 2024', 'Quiet cove'], blurb: 'Recently renovated cottage with its own mooring on a calm cove — a rare sub-$600k waterfront.', tags: ['house', 'live-in', 'entry-level', 'renovated', 'couple', 'move-in-ready'], cta: { label: 'Book a viewing', action: 'book' } },
  ],

  offers: [
    { id: 'off-priority', name: 'Priority Preview Access', kind: 'bonus', value: null, description: 'Book a viewing this week and get first-look access to three off-market homes plus a waived reservation fee.', urgencyText: 'Priority list closes {expiry}', startsAt: iso(-2), endsAt: iso(9), cta: { label: 'Claim priority access', action: 'book' }, active: true },
    { id: 'off-report', name: 'Free Waterfront Value Report', kind: 'consultation', value: null, description: 'A no-obligation 20-minute call with an advisor plus a written area-by-area price report.', urgencyText: '', startsAt: iso(-30), endsAt: iso(60), cta: { label: 'Request the report', action: 'quote' }, active: false },
  ],

  qualification: {
    questions: [
      { key: 'need', maps: 'need', label: 'First — are you looking to buy a home to live in, to invest, or just exploring?', options: ['Buy to live in', 'Buy to invest', 'Just exploring'] },
      { key: 'budget', maps: 'budget', label: 'What budget range are you working with?', options: ['Under $500k', '$500k–$800k', '$800k–$1.2M', '$1.2M+'] },
      { key: 'timeline', maps: 'timeline', label: 'When are you hoping to move or complete?', options: ['ASAP', '1–3 months', '3–6 months', 'Just researching'] },
      { key: 'authority', maps: 'authority', label: 'Who else is involved in the decision?', options: ['Just me', 'Me and a partner', 'Family / board sign-off needed'] },
      { key: 'finance', maps: 'fit', label: 'And how are you planning to finance it?', options: ['Cash buyer', 'Mortgage — pre-approved', 'Mortgage — not yet approved'] },
    ],
    weights: { budget: 25, authority: 20, need: 25, timeline: 20, fit: 10 },
    thresholds: { hot: 80, warm: 60, cold: 35 },
    target: { budgetValue: 700000 },
    categories: {
      HOT: { label: 'HOT', action: 'Contact now — book a viewing or call the buyer directly' },
      WARM: { label: 'WARM', action: 'Book a discovery call and send a tailored shortlist' },
      COLD: { label: 'COLD', action: 'Add to nurture; advisor follow-up in 2–4 weeks' },
      UNQUALIFIED: { label: 'UNQUALIFIED', action: 'Automated nurture only — no advisor time yet' },
    },
  },

  ai: {
    assistantName: 'Ava',
    role: 'Senior property advisor at Aurora Bay Realty',
    tone: 'warm, concise and consultative — never pushy',
    instructions: [
      'Only ever quote listing names, prices and features from the configured catalog.',
      'Never invent prices, availability, yields, policies, timelines or guarantees.',
      'If asked something outside the catalog or you are unsure, say so plainly and offer a human advisor.',
      'Collect any missing qualification answers before recommending a home.',
      'Always give the reason a recommended home fits the person\'s stated needs.',
      'Guide the conversation toward booking a viewing or speaking with an advisor.',
      'Never ask for financial account details, ID numbers or passwords.',
    ],
    knowledge:
      'Aurora Bay Realty sells and rents waterfront homes across Port Aurora — Marina District, North Boardwalk, '
      + 'Old Harbour, Aurora Point and Willow Cove. Core band is $380k–$1.8M. First viewing and matching are free.',
    escalation: [
      'legal, contract or conveyancing questions',
      'specific mortgage rates or lending decisions',
      'complaints or disputes',
      'requests for a discount beyond the configured offers',
      'anything the catalog does not cover',
    ],
  },

  conversion: {
    paths: {
      book: { type: 'booking', label: 'Book a viewing', url: '', useAgent: true },
      quote: { type: 'lead', label: 'Request a callback', url: '' },
      whatsapp: { type: 'whatsapp', label: 'WhatsApp an advisor', url: '' },
    },
    whatsappTemplate: "Hi, I'm interested in {interest}. I came through your website and would like more information.",
  },

  leadForm: {
    heading: 'Start your AI match',
    sub: 'Two minutes. No obligation. An advisor follows up personally.',
    fields: [
      { key: 'name', label: 'Full name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone / WhatsApp', type: 'tel', required: true },
      { key: 'interest', label: 'What are you after? (optional)', type: 'text', required: false, placeholder: 'e.g. 2-bed near the marina' },
    ],
    consentText: 'I agree to be contacted by an Aurora Bay advisor about my enquiry.',
    submitLabel: 'Match me with homes',
  },

  followup: {
    enabled: true,
    sequence: [
      { id: 'f0', delayMinutes: 0, channel: 'email', trigger: 'lead_captured', message: 'Thanks {name} — your shortlist is being prepared. Your advisor {assistant} will be in touch shortly.' },
      { id: 'f1', delayMinutes: 60, channel: 'whatsapp', trigger: 'no_action', message: 'Hi {name}, {assistant} from {business}. Want me to hold a viewing slot for you this week?' },
      { id: 'f2', delayMinutes: 1440, channel: 'email', trigger: 'no_action', message: '{name}, here is your matched shortlist for {interest}, with viewing times you can pick from.' },
      { id: 'f3', delayMinutes: 4320, channel: 'email', trigger: 'no_action', message: 'Last note, {name} — your Priority Preview Access expires soon. Shall I book you in before it does?' },
    ],
    stopOn: ['booked', 'purchased', 'replied', 'opted_out', 'closed'],
  },

  recovery: {
    abandonAfterHours: 2,
    incentives: {
      'no-objection': 'Send a gentle reminder with the shortlist — no incentive needed.',
      price: 'Lead with the sub-$600k waterfront options before offering anything.',
      timing: 'Offer to hold a viewing slot for 72 hours, no commitment.',
      trust: 'Offer the free written value report and an advisor call.',
      finance: 'Point to the pre-approval next-steps guide and an advisor call.',
    },
  },

  integrations: {
    bookingAgentId: 'lead',
    supportAgentId: 'support',
    recoveryAgentId: 'cart',
    productAgentId: 'sales',
    calendarUrl: '',
    crmWebhook: '',
  },
};

export default REALESTATE_CONFIG;
