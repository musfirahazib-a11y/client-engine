/* ===========================================================
   MusfirahLoom — AI Sales Funnel · Demo Campaign #3
   config/campaigns/ecommerce.campaign.js

   "Loom & Luxe" — a fictitious premium lifestyle store.
   Goal: increase product conversions and recover abandoned
   carts. conversionGoal:'purchase' switches the sales agent to
   an add-to-cart / checkout flow and the console to a
   cart-recovery view.
=========================================================== */

const DAY = 86400000;
const iso = (d = 0) => new Date(Date.now() + d * DAY).toISOString();

export const ECOMMERCE_CONFIG = {
  meta: {
    campaignId: 'ecommerce',
    niche: 'e-commerce',
    schema: 1,
    demo: true,
    conversionGoal: 'purchase',
    goalLabel: 'Purchases',
    selectorIcon: '◆',
    selectorBlurb: 'Turn shoppers into customers and recover abandoned carts.',
    demoCta: {
      text: 'This is an interactive demo of the AI shopping + recovery system behind Loom & Luxe. Want it on your store?',
      primary: { label: 'Book a demo', href: 'https://wa.me/923132028898?text=Hi%2C%20I%20saw%20the%20E-commerce%20AI%20demo%20and%20want%20one%20for%20my%20store.' },
      secondary: { label: 'See all campaigns', href: 'campaigns.html' },
    },
    caseStudy: {
      problem:
        'Seven in ten carts are abandoned. The recovery emails go out as one generic blast, the store can\'t tell a '
        + 'price objection from a distraction, and support is buried under "where is my order?" tickets.',
      solution:
        'An AI shopping assistant helps each visitor find the right product from the live catalog and guides them to '
        + 'checkout. Abandoned carts are handed to the Cart Recovery agent, which picks the smallest effective '
        + 'incentive per objection. After purchase, the Order Status agent handles tracking and returns.',
      journey: [
        'Ad / search → storefront',
        'AI shopping assistant: who it\'s for, budget, style, category, timing',
        'Product recommendation from the real catalog + first-order offer',
        'Add to cart → checkout, or leave',
        'Abandoned cart → Recovery agent → objection-matched nudge → recovered',
        'Purchase → Order Status agent handles "where is my order?" and returns',
      ],
      impact: [
        ['Assisted → purchase', '22%'],
        ['Cart recovery rate', '31%'],
        ['Avg order value', '+18%'],
        ['"Where\'s my order" tickets', '−40%'],
      ],
    },
    agents: [
      { id: 'sales', role: 'Recommends products from the live catalog' },
      { id: 'cart', role: 'Recovers abandoned carts with the right incentive' },
      { id: 'support', role: 'Answers "where is my order?", tracking and returns' },
    ],
  },

  traffic: {
    channels: ['google', 'instagram', 'facebook', 'tiktok', 'email', 'direct', 'paid', 'youtube'],
    referrerMap: {
      'instagram.com': 'instagram', 'facebook.com': 'facebook', 'google.': 'google',
      'bing.com': 'google', 'tiktok.com': 'tiktok', 'youtube.com': 'youtube', 't.co': 'twitter',
    },
  },

  business: {
    name: 'Loom & Luxe',
    logoText: 'Loom & Luxe',
    tagline: 'Considered pieces, chosen for you.',
    description:
      'Loom & Luxe is a small premium lifestyle store — jewelry, accessories, beauty and home. Our AI shopping '
      + 'assistant helps you find the right piece and get it in time.',
    email: 'care@loomandluxe.example',
    phone: '+1 (555) 044-9130',
    whatsapp: '15550449130',
    address: 'Ships worldwide',
    hours: 'Support Mon–Fri, 9am–6pm',
  },

  branding: { primary: '#6E2C3B', secondary: '#C9A66B', buttonStyle: 'pill' },

  seo: {
    title: 'Loom & Luxe — considered jewelry, accessories & lifestyle pieces',
    description:
      'Shop Loom & Luxe with an AI assistant that recommends the right piece for your budget and style, and gets it '
      + 'to you in time. First-order offer for new customers.',
    canonical: '', ogImage: '',
  },

  landing: {
    hero: {
      eyebrow: 'AI shopping assistant',
      headline: 'Find the piece you had in mind — faster.',
      sub:
        'Tell our shopping assistant who it\'s for, your budget and your style. It recommends from the live catalog, '
        + 'applies your first-order offer, and takes you to checkout.',
      ctaPrimary: { label: 'Help me choose', action: 'lead' },
      ctaSecondary: { label: 'Browse best sellers', action: 'scroll:listings' },
      trust: ['Free shipping over $75', '30-day returns', 'Ships in 1–2 days'],
    },
    problem: {
      title: 'Too many tabs, not enough certainty.',
      points: [
        'You know roughly what you want but not which one.',
        'Gift shopping under time pressure is stressful.',
        'You add to cart, get distracted, and never come back.',
      ],
    },
    solution: {
      title: 'A shopping assistant that actually narrows it down.',
      body:
        'Loom & Luxe\'s assistant asks a few quick questions, recommends two or three pieces from the real catalog '
        + 'with the reason each fits, applies your offer, and takes you straight to checkout. Leave one behind and it '
        + 'follows up with the right nudge — not spam.',
      points: [
        'Recommends only real, in-stock products at their real prices.',
        'Explains why each pick fits your budget and style.',
        'Recovers your cart with the smallest incentive that works.',
      ],
    },
    steps: [
      { n: 1, title: 'Tell us the brief', body: 'Who it\'s for, budget, style, category, timing.' },
      { n: 2, title: 'Get 2–3 picks', body: 'Recommended from the live catalog, with the reason each fits.' },
      { n: 3, title: 'Add & checkout', body: 'Your first-order offer is applied automatically.' },
      { n: 4, title: 'Track it', body: 'Order confirmation, shipping updates and easy returns.' },
    ],
    benefits: [
      { icon: '◆', title: 'Right piece, faster', body: 'Two or three strong options instead of forty tabs.' },
      { icon: '↺', title: 'Cart recovery', body: 'Abandoned carts get an objection-matched nudge, not a blast.' },
      { icon: '✦', title: 'First-order offer', body: '10% off plus free shipping on your first purchase.' },
      { icon: '☑', title: 'Order status, answered', body: 'The AI handles "where is my order?" and returns instantly.' },
    ],
    features: [
      { title: 'Catalog-accurate', body: 'Prices, variants and stock come straight from the store — never invented.' },
      { title: 'Objection-matched recovery', body: 'Free shipping for a shipping objection, a small code for price — not always the biggest discount.' },
      { title: 'Order Status agent', body: 'Post-purchase, customers ask the AI for tracking and returns instead of opening a ticket.' },
      { title: 'Cross-sell that fits', body: 'One well-chosen complementary piece after purchase — and it knows when to stop.' },
    ],
    social: {
      note: 'Illustrative examples — synthetic, shown to demonstrate the layout.',
      testimonials: [
        { quote: 'Told it "gift, under $100, minimal" and it nailed it in one go.', name: 'Sample customer', role: 'Gift shopper', synthetic: true },
        { quote: 'I abandoned my cart, got one message about free shipping, and finished the order.', name: 'Sample customer', role: 'Returning shopper', synthetic: true },
      ],
    },
    faqEnabled: true,
    finalCta: {
      headline: 'Know roughly what you want?',
      sub: 'Let the assistant narrow it to the right piece — with your first-order offer applied.',
      label: 'Help me choose',
    },
    footerNote: 'Loom & Luxe is a fictitious business used to demonstrate the AI Sales Funnel System.',
  },

  faqs: [
    { q: 'What does shipping cost?', a: 'Standard shipping is free over $75, otherwise $6. Orders ship in 1–2 business days with tracking.' },
    { q: 'Can I return something?', a: 'Yes — unworn items within 30 days of delivery for a full refund. Start it from your order status.' },
    { q: 'Do you ship internationally?', a: 'Yes, to most countries. International delivery is typically 7–14 business days; duties are set by the destination.' },
    { q: 'Is my first-order offer automatic?', a: 'Yes — 10% off and free shipping are applied at checkout when the assistant sets up your cart.' },
    { q: 'How do I track my order?', a: 'Ask the assistant "where is my order?" with your order number and it will pull the status.' },
  ],

  listings: [
    { id: 'LL-01', title: 'Fine Gold Hoop Earrings', category: 'Jewelry', price: 68, priceLabel: '$68', features: ['14k gold vermeil', '20mm', 'Hypoallergenic'], blurb: 'Lightweight everyday hoops in gold vermeil — the pair you never take off.', tags: ['jewelry', 'gold', 'minimal', 'everyday', 'gift', 'her'], cta: { label: 'View', action: 'checkout' } },
    { id: 'LL-02', title: 'Birthstone Pendant Necklace', category: 'Jewelry', price: 96, priceLabel: '$96', features: ['Personalised stone', 'Gift-boxed', 'Adjustable chain'], blurb: 'A delicate pendant with the birthstone of your choice — arrives gift-boxed.', tags: ['jewelry', 'personalised', 'classic', 'gift', 'her', 'anniversary'], cta: { label: 'View', action: 'checkout' } },
    { id: 'LL-03', title: 'Signet Ring', category: 'Jewelry', price: 120, priceLabel: '$120', features: ['Solid sterling', 'Bold profile', 'Unisex sizing'], blurb: 'A weighty sterling signet with a bold, modern profile.', tags: ['jewelry', 'bold', 'statement', 'unisex', 'him'], cta: { label: 'View', action: 'checkout' } },
    { id: 'LL-04', title: 'Amber & Oud Eau de Parfum', category: 'Beauty', price: 92, priceLabel: '$92', features: ['50ml', 'Warm amber-oud', 'Long-wear'], blurb: 'A warm amber-oud signature scent that lasts through the evening.', tags: ['beauty', 'fragrance', 'classic', 'gift', 'evening'], cta: { label: 'View', action: 'checkout' } },
    { id: 'LL-05', title: 'Rose & Pepper Travel Spray', category: 'Beauty', price: 38, priceLabel: '$38', features: ['10ml', 'Fresh rose-pepper', 'Pocket size'], blurb: 'A lighter rose-and-pepper scent in a pocket-size travel spray.', tags: ['beauty', 'fragrance', 'minimal', 'gift', 'travel', 'under-50'], cta: { label: 'View', action: 'checkout' } },
    { id: 'LL-06', title: 'Merino Wool Blanket Scarf', category: 'Accessories', price: 68, priceLabel: '$68', features: ['100% merino', 'Oversized', 'Four colourways'], blurb: 'An oversized merino scarf that doubles as a travel blanket.', tags: ['accessories', 'wool', 'cozy', 'winter', 'gift', 'her'], cta: { label: 'View', action: 'checkout' } },
    { id: 'LL-07', title: 'Leather Card Holder', category: 'Accessories', price: 45, priceLabel: '$45', features: ['Full-grain leather', 'Four slots', 'Monogram option'], blurb: 'A slim full-grain leather card holder that ages beautifully.', tags: ['accessories', 'leather', 'minimal', 'him', 'gift', 'under-50'], cta: { label: 'View', action: 'checkout' } },
    { id: 'LL-08', title: 'Soy Candle — Fig & Cedar', category: 'Lifestyle', price: 34, priceLabel: '$34', features: ['45h burn', 'Hand-poured', 'Reusable vessel'], blurb: 'A hand-poured fig-and-cedar candle in a reusable ceramic vessel.', tags: ['lifestyle', 'home', 'cozy', 'gift', 'under-50', 'hostess'], cta: { label: 'View', action: 'checkout' } },
    { id: 'LL-09', title: 'Ceramic Pour-Over Set', category: 'Lifestyle', price: 78, priceLabel: '$78', features: ['Dripper + carafe', 'Matte glaze', 'Gift-boxed'], blurb: 'A matte ceramic pour-over set for a slower morning coffee.', tags: ['lifestyle', 'home', 'classic', 'gift', 'him', 'housewarming'], cta: { label: 'View', action: 'checkout' } },
    { id: 'LL-10', title: 'Build-Your-Own Gift Box', category: 'Lifestyle', price: 25, priceLabel: 'from $25', features: ['Pick 2–4 items', 'Ribboned box', 'Handwritten note'], blurb: 'Choose two to four small pieces and we\'ll box them with a handwritten note.', tags: ['lifestyle', 'gift', 'flexible', 'bundle', 'under-50'], cta: { label: 'View', action: 'checkout' } },
  ],

  offers: [
    { id: 'off-firstorder', name: 'First-Order Offer', kind: 'percent', value: 10, description: '10% off your first order plus free shipping — applied automatically at checkout.', urgencyText: 'For new customers until {expiry}', startsAt: iso(-5), endsAt: iso(14), cta: { label: 'Start my order', action: 'checkout' }, active: true },
    { id: 'off-giftwrap', name: 'Free Gift Wrap', kind: 'bonus', value: null, description: 'Complimentary ribboned gift wrap and a handwritten note on gift orders.', urgencyText: '', startsAt: iso(-30), endsAt: iso(60), cta: { label: 'Start my order', action: 'checkout' }, active: false },
  ],

  qualification: {
    questions: [
      {
        key: 'recipient', maps: 'need',
        label: 'Who are you shopping for?',
        options: ['Myself', 'A gift', 'Both'],
        optionScores: { 'A gift': 0.9, Both: 0.85, Myself: 0.8 },
        optionSignatures: { Myself: 'myself|for me|treat myself', 'A gift': 'gift|present|for (my|a) (wife|husband|mum|mom|friend|sister|partner|him|her|dad)', Both: 'both|me and' },
      },
      {
        key: 'budget', maps: 'budget',
        label: "What's your budget?",
        options: ['Under $50', '$50–$100', '$100–$250', '$250+'],
        optionScores: { 'Under $50': 0.4, '$50–$100': 0.7, '$100–$250': 0.9, '$250+': 1.0 },
      },
      {
        key: 'style', maps: 'fit',
        label: 'What style are you drawn to?',
        options: ['Minimal', 'Classic', 'Bold', 'Not fussy'],
        optionScores: { Minimal: 0.9, Classic: 0.9, Bold: 0.9, 'Not fussy': 0.6 },
        optionSignatures: { Minimal: 'minimal|simple|understated|dainty|delicate', Classic: 'classic|timeless|traditional|elegant', Bold: 'bold|statement|chunky|stand ?out|striking', 'Not fussy': "not fussy|don'?t mind|any|whatever|no preference" },
      },
      {
        key: 'category', maps: 'authority',
        label: 'Anything specific in mind?',
        options: ['Jewelry', 'Accessories', 'Beauty', 'Lifestyle', 'Surprise me'],
        optionScores: { Jewelry: 0.85, Accessories: 0.8, Beauty: 0.8, Lifestyle: 0.75, 'Surprise me': 0.6 },
        optionSignatures: { Jewelry: 'jewel?ler?y|necklace|earring|ring|pendant|bracelet', Accessories: 'accessor|scarf|wallet|card holder|bag', Beauty: 'beauty|perfume|fragrance|scent|candle|skincare', Lifestyle: 'lifestyle|home|candle|coffee|kitchen|house', 'Surprise me': 'surprise|not sure|you (choose|pick)|recommend' },
      },
      {
        key: 'timing', maps: 'timeline',
        label: 'When do you need it by?',
        options: ['This week', 'Within the month', 'No rush'],
        optionScores: { 'This week': 1.0, 'Within the month': 0.6, 'No rush': 0.3 },
        optionSignatures: { 'This week': 'this week|by (friday|saturday|sunday|the weekend)|asap|soon|urgent', 'Within the month': 'this month|few weeks|couple of weeks', 'No rush': 'no rush|whenever|not urgent|just browsing' },
      },
    ],
    weights: { need: 20, budget: 25, timeline: 20, authority: 15, fit: 20 },
    thresholds: { hot: 75, warm: 55, cold: 32 },
    target: { budgetValue: 100 },
    categories: {
      HOT: { label: 'HOT', action: 'Assist to checkout now; ensure the offer is applied' },
      WARM: { label: 'WARM', action: 'Send the 2–3 picks and a cart link with the offer' },
      COLD: { label: 'COLD', action: 'Add to the browse-abandon nurture; follow up in a week' },
      UNQUALIFIED: { label: 'UNQUALIFIED', action: 'Newsletter only' },
    },
  },

  ai: {
    assistantName: 'Coco',
    role: 'Personal shopping assistant at Loom & Luxe',
    tone: 'friendly, decisive and helpful — narrows choices rather than listing everything',
    instructions: [
      'Only recommend products, prices, variants and stock from the configured Loom & Luxe catalog.',
      'Never invent a product, price, feature, discount or availability.',
      'Recommend two or three options, each with the reason it fits the brief (budget + style + recipient).',
      'Once a product is chosen, guide the shopper to add it to cart and check out with the first-order offer.',
      'If the shopper leaves, the Cart Recovery agent follows up — do not chase within the chat.',
      'After purchase, point the shopper to the assistant for order tracking and returns.',
      'Never ask for card numbers, CVV or passwords — checkout is handled by the store.',
    ],
    knowledge:
      'Loom & Luxe sells jewelry, accessories, beauty and lifestyle pieces, mostly $25–$150. Free shipping over $75; '
      + '30-day returns; ships in 1–2 days with tracking. New customers get 10% off plus free shipping.',
    escalation: [
      'a product or size the catalog does not list',
      'a damaged or wrong item on a past order',
      'wholesale or bulk enquiries',
      'anything outside jewelry / accessories / beauty / lifestyle',
    ],
  },

  conversion: {
    paths: {
      checkout: { type: 'checkout', label: 'Add to cart & checkout', url: '' },
      whatsapp: { type: 'whatsapp', label: 'Ask on WhatsApp', url: '' },
      quote: { type: 'lead', label: 'Ask a question', url: '' },
    },
    whatsappTemplate: "Hi Loom & Luxe, I'm interested in {interest}. I came through your website.",
  },

  leadForm: {
    heading: 'Let\'s find your piece',
    sub: 'A few quick questions and the assistant narrows it to two or three. No account needed.',
    fields: [
      { key: 'name', label: 'Your name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone (optional)', type: 'tel', required: false },
      { key: 'interest', label: 'What are you after? (optional)', type: 'text', required: false, placeholder: 'e.g. minimal gold earrings, gift under $100' },
    ],
    consentText: 'I agree to be contacted by Loom & Luxe about my order and cart.',
    submitLabel: 'Start shopping',
  },

  followup: {
    enabled: true,
    sequence: [
      { id: 'f0', delayMinutes: 0, channel: 'email', trigger: 'lead_captured', message: 'Hi {name}, it\'s {assistant} from {business}. Your picks for {interest} are ready — your first-order offer is saved to your cart.' },
      { id: 'f1', delayMinutes: 30, channel: 'email', trigger: 'no_action', message: '{name}, your cart is saved with 10% off + free shipping. Want to finish up?' },
      { id: 'f2', delayMinutes: 1440, channel: 'whatsapp', trigger: 'no_action', message: 'Still deciding, {name}? Free shipping is on your cart — happy to swap a piece if something\'s not quite right.' },
      { id: 'f3', delayMinutes: 4320, channel: 'email', trigger: 'no_action', message: 'Last reminder, {name} — your first-order offer expires soon and a couple of your picks are low in stock.' },
    ],
    stopOn: ['booked', 'purchased', 'replied', 'opted_out', 'closed'],
  },

  recovery: {
    abandonAfterHours: 1,
    incentives: {
      'no-objection': 'Gentle reminder that the cart is saved with the first-order offer applied.',
      price: 'Confirm the 10% first-order code is on the cart before offering anything deeper.',
      shipping: 'Lead with free shipping — it removes the exact blocker and protects margin.',
      timing: 'Note that a couple of the picks are low in stock, no pressure.',
      trust: 'Offer to swap a piece or answer a sizing question before they buy.',
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

export default ECOMMERCE_CONFIG;
