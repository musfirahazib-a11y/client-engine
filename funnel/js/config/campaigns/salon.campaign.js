/* ===========================================================
   MusfirahLoom — AI Sales Funnel · Demo Campaign #1
   config/campaigns/salon.campaign.js

   "Lumière Beauty & Spa" — a fictitious premium salon & spa.
   Goal: turn social-media visitors into booked appointments.
   Full funnel config in the shared schema.
=========================================================== */

const DAY = 86400000;
const iso = (d = 0) => new Date(Date.now() + d * DAY).toISOString();

export const SALON_CONFIG = {
  meta: {
    campaignId: 'salon',
    niche: 'salon-spa',
    schema: 1,
    demo: true,
    conversionGoal: 'appointment',
    goalLabel: 'Appointments booked',
    selectorIcon: '✦',
    selectorBlurb: 'Turn social visitors into booked appointments.',
    demoCta: {
      text: 'This is an interactive demo of the AI concierge behind Lumière Beauty & Spa. Want it for your salon?',
      primary: { label: 'Book a demo', href: 'https://wa.me/923132028898?text=Hi%2C%20I%20saw%20the%20Salon%20%26%20Spa%20AI%20demo%20and%20want%20one%20for%20my%20business.' },
      secondary: { label: 'See all campaigns', href: 'campaigns.html' },
    },
    caseStudy: {
      problem:
        'Bookings come in as Instagram DMs and comments at all hours. The front desk can\'t answer them fast enough, '
        + 'high-value bridal enquiries get the same slow reply as a quick trim, and no-shows eat the calendar.',
      solution:
        'An AI beauty concierge answers instantly, 24/7. It works out what the visitor wants, how soon, and the '
        + 'occasion, recommends the right treatments and package, books the slot, and drives reminders — so the front '
        + 'desk only sees confirmed, qualified appointments.',
      journey: [
        'Instagram / TikTok / Facebook ad → landing page',
        'AI concierge: service, occasion, timing, budget, new or returning',
        'Lead score (HOT for this-week bridal, COLD for "just browsing")',
        'Recommended treatments + New-Client package offer',
        'Appointment booked into the calendar',
        'Reminder → confirmation → post-visit → review request',
      ],
      impact: [
        ['DM → booking', '19%'],
        ['After-hours bookings', '41%'],
        ['No-show rate', '−28%'],
        ['Front-desk time saved', '~6h / week'],
      ],
    },
    agents: [
      { id: 'lead', role: 'Qualifies the enquiry and books the appointment' },
      { id: 'support', role: 'Handles reschedules and pre-visit questions' },
    ],
  },

  traffic: {
    channels: ['instagram', 'tiktok', 'facebook', 'google', 'youtube', 'email', 'direct', 'paid'],
    referrerMap: {
      'instagram.com': 'instagram', 'l.instagram.com': 'instagram',
      'facebook.com': 'facebook', 'l.facebook.com': 'facebook',
      'google.': 'google', 'bing.com': 'google', 'tiktok.com': 'tiktok', 'youtube.com': 'youtube',
    },
  },

  business: {
    name: 'Lumière Beauty & Spa',
    logoText: 'Lumière',
    tagline: 'Your beauty, your time, your experience.',
    description:
      'Lumière Beauty & Spa offers personalised hair, skin, nail and spa treatments in a calm, unhurried setting. '
      + 'Tell our beauty concierge what you need and we\'ll match the treatment and the time.',
    email: 'hello@lumierespa.example',
    phone: '+1 (555) 070-2210',
    whatsapp: '15550702210',
    address: 'The Conservatory, 14 Rosewood Lane',
    hours: 'Tue–Sun, 9:00am–8:00pm',
  },

  branding: { primary: '#8E5B7A', secondary: '#C9A66B', buttonStyle: 'pill' },

  seo: {
    title: 'Lumière Beauty & Spa — personalised hair, skin & spa treatments',
    description:
      'Book hair, facials, nails, massage and bridal packages at Lumière Beauty & Spa. Ask our AI beauty concierge '
      + 'for a recommendation and reserve your appointment in under two minutes.',
    canonical: '', ogImage: '',
  },

  landing: {
    hero: {
      eyebrow: 'AI beauty concierge',
      headline: 'Your beauty. Your time. Your experience.',
      sub:
        'Discover personalised beauty and spa treatments designed around you. Tell our AI concierge what you\'re after '
        + 'and book the perfect slot in two minutes.',
      ctaPrimary: { label: 'Book your appointment', action: 'lead' },
      ctaSecondary: { label: 'Ask our AI beauty assistant', action: 'lead' },
      trust: ['Open 7 days', 'Same-week appointments', 'New-client package'],
    },
    problem: {
      title: 'Booking a treatment shouldn\'t mean waiting for a DM reply.',
      points: [
        'You message on Instagram at 10pm and hear nothing until tomorrow.',
        'You\'re not sure which treatment you actually need.',
        'By the time someone replies, your free Saturday is gone.',
      ],
    },
    solution: {
      title: 'One quick chat. The right treatment, booked.',
      body:
        'Lumière\'s concierge asks what you\'re looking for, the occasion, and when you\'d like to come in — then '
        + 'recommends the treatments that fit, applies the right offer, and books you a slot on the spot.',
      points: [
        'Answers instantly, day or night.',
        'Recommends treatments from our real menu — never invents a service or price.',
        'Sends reminders so you don\'t miss your slot.',
      ],
    },
    steps: [
      { n: 1, title: 'Tell us what you want', body: 'Hair, skin, nails, spa or bridal — and the occasion.' },
      { n: 2, title: 'Get a recommendation', body: 'The concierge matches treatments and the new-client package.' },
      { n: 3, title: 'Pick your time', body: 'Choose a slot that works. We confirm by message.' },
      { n: 4, title: 'Enjoy the experience', body: 'Reminders, then a warm welcome when you arrive.' },
    ],
    benefits: [
      { icon: '✦', title: 'Personalised', body: 'Recommendations built around your hair, skin and occasion.' },
      { icon: '⧗', title: 'Same-week slots', body: 'Qualified enquiries are offered an appointment within days.' },
      { icon: '❀', title: 'New-client package', body: 'A curated first visit at a set introductory price.' },
      { icon: '☎', title: 'Reminders that work', body: 'Automatic nudges cut no-shows without nagging.' },
    ],
    features: [
      { title: 'Menu-accurate', body: 'Every treatment, price and duration comes from the real Lumière menu.' },
      { title: 'Occasion-aware', body: 'Bridal, event or a treat — the concierge adapts the recommendation and the offer.' },
      { title: 'Human handoff', body: 'Ask for a stylist or therapist and the chat transfers with your notes.' },
      { title: 'Automated follow-up', body: 'Booking reminder, confirmation, post-visit check-in and a review request.' },
    ],
    social: {
      note: 'Illustrative examples — synthetic, shown to demonstrate the layout.',
      testimonials: [
        { quote: 'Booked my bridal trial at midnight and had a confirmed slot before breakfast.', name: 'Sample client', role: 'Bride', synthetic: true },
        { quote: 'It knew I wanted a calm spa afternoon, not a rushed blow-dry. Spot on.', name: 'Sample client', role: 'Returning client', synthetic: true },
      ],
    },
    faqEnabled: true,
    finalCta: {
      headline: 'Ready for your Lumière moment?',
      sub: 'Two minutes to a recommendation and a confirmed slot. No obligation.',
      label: 'Book your appointment',
    },
    footerNote: 'Lumière Beauty & Spa is a fictitious business used to demonstrate the AI Sales Funnel System.',
  },

  faqs: [
    { q: 'Do I pay when I book?', a: 'No. You book a time and pay in-salon after your treatment. Packages can be pre-paid if you prefer.' },
    { q: 'How soon can I get an appointment?', a: 'Most treatments have same-week availability. Bridal packages are usually booked 2–6 weeks ahead.' },
    { q: 'Can I change or cancel?', a: 'Yes — reply to your confirmation message up to 24 hours before and we\'ll reschedule at no charge.' },
    { q: 'Do you do trials for bridal?', a: 'Yes. The bridal package includes a hair-and-makeup trial before the day.' },
    { q: 'Can I talk to a stylist first?', a: 'Of course. Ask for a stylist in the chat and we\'ll have one call you.' },
  ],

  listings: [
    { id: 'SV-HC', title: 'Haircut & Styling', category: 'Hair', price: 45, priceLabel: '$45', duration: '45 min', features: ['45 min', 'Consultation + wash', 'Blow-dry finish'], blurb: 'A precision cut with a consultation and a polished blow-dry to finish.', tags: ['hair', 'cut', 'styling', 'quick', 'everyday'], cta: { label: 'Book this', action: 'book' } },
    { id: 'SV-COL', title: 'Hair Color', category: 'Hair', price: 120, priceLabel: 'from $120', duration: '2 hr', features: ['2 hr', 'Full or balayage', 'Gloss + treatment'], blurb: 'Full colour, highlights or balayage, finished with a bond treatment and gloss.', tags: ['hair', 'colour', 'balayage', 'transformation'], cta: { label: 'Book this', action: 'book' } },
    { id: 'SV-HT', title: 'Hair Treatment', category: 'Hair', price: 65, priceLabel: '$65', duration: '45 min', features: ['45 min', 'Bond repair', 'Scalp massage'], blurb: 'An intensive bond-repair and hydration treatment with a scalp massage.', tags: ['hair', 'treatment', 'repair', 'hydration'], cta: { label: 'Book this', action: 'book' } },
    { id: 'SV-FAC', title: 'Signature Facial', category: 'Skin', price: 80, priceLabel: '$80', duration: '60 min', features: ['60 min', 'Double cleanse + mask', 'Facial massage'], blurb: 'A tailored cleanse, exfoliation, mask and lymphatic facial massage for a fresh glow.', tags: ['skin', 'facial', 'glow', 'relax', 'gift'], cta: { label: 'Book this', action: 'book' } },
    { id: 'SV-HYD', title: 'Hydrafacial', category: 'Skin', price: 150, priceLabel: '$150', duration: '60 min', features: ['60 min', 'Deep resurfacing', 'Serum infusion', 'No downtime'], blurb: 'Medical-grade resurfacing and hydration — visible glow with zero downtime.', tags: ['skin', 'hydrafacial', 'event', 'premium', 'glow'], cta: { label: 'Book this', action: 'book' } },
    { id: 'SV-MAN', title: 'Manicure', category: 'Nails', price: 35, priceLabel: '$35', duration: '40 min', features: ['40 min', 'Shape + cuticle care', 'Gel or classic'], blurb: 'A tidy, long-lasting manicure in gel or classic polish.', tags: ['nails', 'manicure', 'quick', 'gift'], cta: { label: 'Book this', action: 'book' } },
    { id: 'SV-PED', title: 'Pedicure', category: 'Nails', price: 45, priceLabel: '$45', duration: '50 min', features: ['50 min', 'Soak + exfoliation', 'Massage + polish'], blurb: 'A restoring soak, exfoliation, foot massage and polish.', tags: ['nails', 'pedicure', 'relax'], cta: { label: 'Book this', action: 'book' } },
    { id: 'SV-MAS', title: 'Full-Body Massage', category: 'Body', price: 95, priceLabel: '$95', duration: '60 min', features: ['60 min', 'Swedish or deep tissue', 'Aromatherapy oils'], blurb: 'A 60-minute Swedish or deep-tissue massage with aromatherapy oils.', tags: ['body', 'massage', 'spa', 'relax', 'stress'], cta: { label: 'Book this', action: 'book' } },
    { id: 'SV-SPA', title: 'Hair Spa Ritual', category: 'Body', price: 70, priceLabel: '$70', duration: '60 min', features: ['60 min', 'Steam + mask', 'Extended head massage'], blurb: 'A slow, restorative hair-and-scalp ritual with steam and an extended head massage.', tags: ['hair', 'spa', 'relax', 'scalp'], cta: { label: 'Book this', action: 'book' } },
    { id: 'SV-BRD', title: 'Bridal Package', category: 'Bridal', price: 650, priceLabel: 'from $650', duration: '4 hr + trial', features: ['Trial + wedding day', 'Hair + makeup', 'Touch-up kit', 'On-site option'], blurb: 'A full bridal experience: a pre-day trial, wedding-day hair and makeup, and a touch-up kit.', tags: ['bridal', 'wedding', 'package', 'premium', 'hair', 'makeup'], cta: { label: 'Enquire about bridal', action: 'book' } },
  ],

  offers: [
    { id: 'off-newclient', name: 'New-Client Beauty Package', kind: 'bundle', value: 99, description: 'A Signature Facial + Hair Treatment + express Manicure for $99 — a curated first visit worth around $180.', urgencyText: 'Introductory price held until {expiry}', startsAt: iso(-3), endsAt: iso(12), cta: { label: 'Claim the package', action: 'book' }, active: true },
    { id: 'off-bridaltrial', name: 'Half-Price Bridal Trial', kind: 'percent', value: 50, description: 'Book the Bridal Package this month and the pre-day trial is half price.', urgencyText: '', startsAt: iso(-30), endsAt: iso(20), cta: { label: 'Enquire about bridal', action: 'book' }, active: false },
  ],

  qualification: {
    questions: [
      {
        key: 'service', maps: 'need',
        label: 'Hi! What are you looking for today?',
        options: ['Hair', 'Facial / skin', 'Spa & massage', 'Nails', 'Bridal', 'Not sure yet'],
        optionScores: { Bridal: 1.0, 'Spa & massage': 0.85, 'Facial / skin': 0.82, Hair: 0.78, Nails: 0.6, 'Not sure yet': 0.4 },
        optionSignatures: {
          Hair: 'hair|cut|colou?r|balayage|highlights|blow ?dry|trim|style',
          'Facial / skin': 'facial|skin|hydrafacial|glow|acne|peel',
          'Spa & massage': 'spa|massage|relax|stress|body|ritual',
          Nails: 'nail|manicure|pedicure|gel|polish',
          Bridal: 'brid(e|al)|wedding|getting married|my big day',
          'Not sure yet': "not sure|don'?t know|unsure|help me (choose|decide)|recommend",
        },
      },
      {
        key: 'occasion', maps: 'authority',
        label: 'Is it for a special occasion?',
        options: ['My wedding', "A wedding I'm in", 'A special event', 'Just treating myself', 'A gift'],
        optionScores: { 'My wedding': 1.0, "A wedding I'm in": 0.8, 'A special event': 0.75, 'Just treating myself': 0.6, 'A gift': 0.55 },
        optionSignatures: {
          'My wedding': 'my wedding|getting married|i am the bride|my big day',
          "A wedding I'm in": "bridesmaid|wedding i'?m in|maid of honou?r|wedding party",
          'A special event': 'event|party|birthday|anniversary|shoot|graduation|gala',
          'Just treating myself': 'treat( myself)?|me time|just because|self ?care|pamper',
          'A gift': 'gift|present|for (my|a) (mum|mom|friend|sister|partner)|voucher',
        },
      },
      {
        key: 'timing', maps: 'timeline',
        label: 'When would you like to come in?',
        options: ['This week', 'Next 1–2 weeks', 'This month', 'Just browsing'],
        optionScores: { 'This week': 1.0, 'Next 1–2 weeks': 0.8, 'This month': 0.5, 'Just browsing': 0.2 },
        optionSignatures: {
          'This week': 'this week|asap|today|tomorrow|soon|as soon as',
          'Next 1–2 weeks': 'next week|two weeks|fortnight|1-2 weeks|couple of weeks',
          'This month': 'this month|few weeks|later this month|end of the month',
          'Just browsing': 'browsing|just looking|no rush|sometime|not sure when|maybe later',
        },
      },
      {
        key: 'budget', maps: 'budget',
        label: 'Roughly what are you comfortable spending?',
        options: ['Under $60', '$60–$150', '$150–$400', '$400+ (package)'],
        optionScores: { 'Under $60': 0.4, '$60–$150': 0.7, '$150–$400': 0.9, '$400+ (package)': 1.0 },
      },
      {
        key: 'client', maps: 'fit',
        label: 'Have you visited Lumière before?',
        options: ['First time', 'Returning client'],
        optionScores: { 'First time': 0.7, 'Returning client': 1.0 },
        optionSignatures: { 'First time': 'first time|never been|new (here|client)', 'Returning client': 'returning|been before|regular|come here|last time' },
      },
    ],
    weights: { need: 25, authority: 15, timeline: 25, budget: 20, fit: 15 },
    thresholds: { hot: 78, warm: 58, cold: 34 },
    target: { budgetValue: 150 },
    categories: {
      HOT: { label: 'HOT', action: 'Book now — call or message the client to confirm the slot' },
      WARM: { label: 'WARM', action: 'Offer 2–3 specific slots and the new-client package' },
      COLD: { label: 'COLD', action: 'Send the treatment guide; follow up in 1–2 weeks' },
      UNQUALIFIED: { label: 'UNQUALIFIED', action: 'Automated nurture only' },
    },
  },

  ai: {
    assistantName: 'Aria',
    role: 'Beauty & wellness concierge at Lumière Beauty & Spa',
    tone: 'warm, attentive and a little indulgent — never pushy',
    instructions: [
      'Only recommend treatments, prices and durations from the configured Lumière menu.',
      'Never invent a service, price, duration, product or result.',
      'Match the recommendation to the stated goal and occasion — bridal enquiries go to the Bridal Package.',
      'Collect the missing details (service, occasion, timing, budget) before recommending.',
      'Guide the visitor toward booking an appointment or speaking with a stylist.',
      'Never ask for card numbers, ID or passwords — payment is in-salon.',
    ],
    knowledge:
      'Lumière Beauty & Spa offers hair (cut, colour, treatment, spa ritual), skin (facial, hydrafacial), nails '
      + '(manicure, pedicure), body (massage) and a full Bridal Package. Open Tue–Sun 9am–8pm. Booking is free; '
      + 'payment is in-salon.',
    escalation: [
      'medical skin conditions or allergies',
      'complaints about a past visit',
      'custom bridal quotes beyond the package',
      'anything the menu does not cover',
    ],
  },

  conversion: {
    paths: {
      book: { type: 'booking', label: 'Book an appointment', url: '', useAgent: true },
      whatsapp: { type: 'whatsapp', label: 'WhatsApp us', url: '' },
      quote: { type: 'lead', label: 'Ask a stylist to call', url: '' },
    },
    whatsappTemplate: "Hi Lumière, I'm interested in {interest}. I came through your website and would like to book.",
  },

  leadForm: {
    heading: 'Book your Lumière appointment',
    sub: 'Under two minutes. No payment now — pay in-salon after your treatment.',
    fields: [
      { key: 'name', label: 'Your name', type: 'text', required: true },
      { key: 'phone', label: 'Phone / WhatsApp', type: 'tel', required: true },
      { key: 'email', label: 'Email (optional)', type: 'email', required: false },
      { key: 'interest', label: 'What are you after? (optional)', type: 'text', required: false, placeholder: 'e.g. bridal trial, or a relaxing facial' },
    ],
    consentText: 'I agree to be contacted by Lumière about my appointment.',
    submitLabel: 'Find my treatment',
  },

  followup: {
    enabled: true,
    sequence: [
      { id: 'f0', delayMinutes: 0, channel: 'whatsapp', trigger: 'lead_captured', message: 'Hi {name}, it\'s {assistant} at {business}. I\'ve noted your interest in {interest} — shall I hold a couple of slots for you?' },
      { id: 'f1', delayMinutes: 45, channel: 'whatsapp', trigger: 'no_action', message: '{name}, I have space this week for {interest}. Want me to book you in?' },
      { id: 'f2', delayMinutes: 1440, channel: 'email', trigger: 'no_action', message: 'Your recommended treatments at {business}, plus times you can pick from — and your New-Client Package details.' },
      { id: 'f3', delayMinutes: 2880, channel: 'email', trigger: 'no_action', message: 'Last note, {name} — the New-Client Package price is held for a little longer. Shall I book you in?' },
    ],
    stopOn: ['booked', 'purchased', 'replied', 'opted_out', 'closed'],
  },

  recovery: {
    abandonAfterHours: 2,
    incentives: {
      'no-objection': 'Send a friendly nudge with two specific slots this week.',
      price: 'Lead with the New-Client Package — a curated first visit at a set price.',
      timing: 'Offer to hold two slots for 48 hours, no commitment.',
      trust: 'Offer a quick call with a stylist before booking.',
      finance: 'Reassure that there\'s no payment until after the treatment.',
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

export default SALON_CONFIG;
