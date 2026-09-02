/* ===========================================================
   MusfirahLoom — AI Agent Platform
   agents.config.js  ·  THE AGENT REGISTRY

   Single source of truth for the 5 commercial agents. The hub
   grid, the agent shell, routing, the mock transport and the
   activity log all read from here. Add / reorder agents by
   editing this array only.

   status:
     'ready'       — fully interactive in Demo Mode
     'coming-soon' — shell + info work; chat shows a Demo-Mode
                     placeholder until its workflow is scripted
=========================================================== */
export const AGENTS = [
  {
    id: 'sales',
    slug: 'sales-product-recommendation',
    name: 'AI Sales & Product Recommendation Agent',
    short: 'Sales & Recommendations',
    benefit: 'Turns browsers into buyers with guided, personalised product recommendations — right product, right budget, right reason.',
    icon: '◆',
    accent: '--agent-sales',
    category: 'Revenue',
    capabilities: [
      'Needs discovery',
      'Budget-aware search',
      'Product comparison',
      'Cheaper alternatives',
      'Add-to-cart',
    ],
    sampleQuestions: [
      'I need a gift under $100',
      'Recommend something for my wife',
      'Show me a cheaper option',
      'Compare these products',
    ],
    demoScriptId: 'sales',
    transport: { demo: 'mock', live: 'serverless' },
    webhook: null,
    tools: ['product.search', 'product.get', 'product.related', 'cart.add'],
    successEvents: ['product_card_clicked', 'add_to_cart'],
    status: 'ready',
  },

  {
    id: 'support',
    slug: 'customer-support-orders-returns',
    name: 'AI Customer Support + Order/Returns Agent',
    short: 'Support & Returns',
    benefit: 'Answers customer questions, checks order status, handles returns, and knows when to escalate to a human.',
    icon: '✦',
    accent: '--agent-support',
    category: 'Customer Support',
    capabilities: [
      'Order status',
      'Returns & exchanges',
      'FAQs',
      'Shipping',
      'Product questions',
      'Human handoff',
    ],
    sampleQuestions: [
      'Where is my order ML-10482?',
      'Can I return ML-10482?',
      'How long does shipping take?',
    ],
    demoScriptId: 'support',
    transport: { demo: 'mock', live: 'serverless' },
    webhook: null,
    tools: ['order.get', 'order.track', 'return.eligibility', 'return.create', 'kb.search'],
    successEvents: ['return_created', 'human_handoff', 'issue_resolved'],
    status: 'ready',
  },

  {
    id: 'cart',
    slug: 'abandoned-cart-recovery',
    name: 'AI Abandoned Cart Recovery Agent',
    short: 'Cart Recovery',
    benefit: 'Recovers abandoned carts by understanding objections, recommending products or incentives, and guiding customers back to checkout.',
    icon: '◈',
    accent: '--agent-cart',
    category: 'Revenue Recovery',
    capabilities: [
      'Abandoned cart detection',
      'Cart analysis',
      'Objection handling',
      'Smart recommendations',
      'Incentive offers',
      'Cart recovery',
    ],
    sampleQuestions: [
      'Show abandoned carts',
      'How much revenue can we recover?',
      'Which cart should I recover first?',
    ],
    demoScriptId: 'cart',
    transport: { demo: 'mock', live: 'serverless' },
    webhook: null,
    tools: ['abandonedCarts.list', 'cartAnalysis.run', 'incentive.select', 'recovery.simulate'],
    successEvents: ['recovery_started', 'cart_recovered', 'incentive_recommended'],
    status: 'ready',
  },

  {
    id: 'lead',
    slug: 'lead-qualification-appointment-booking',
    name: 'AI Lead Qualification + Appointment Booking Agent',
    short: 'Leads & Booking',
    benefit: 'Qualifies inbound leads, scores buying intent, captures key details, and books appointments automatically.',
    icon: '❖',
    accent: '--agent-lead',
    category: 'Lead Generation',
    capabilities: [
      'Lead capture',
      'Lead qualification',
      'Lead scoring',
      'Intent detection',
      'Appointment booking',
      'Human handoff',
    ],
    sampleQuestions: [
      'I need a website for my salon',
      'Show hot leads',
      'Show available appointments',
    ],
    demoScriptId: 'lead',
    transport: { demo: 'mock', live: 'serverless' },
    webhook: null,
    tools: ['lead.capture', 'lead.score', 'appointment.list', 'appointment.book'],
    successEvents: ['lead_qualified', 'appointment_booked', 'human_handoff_confirmed'],
    status: 'ready',
  },

  {
    id: 'funnel',
    slug: 'ai-sales-funnel-system',
    name: 'AI Sales Funnel System',
    short: 'Sales Funnel',
    benefit:
      'The flagship. A complete AI funnel — landing page, AI sales assistant, qualification, recommendations, offers, '
      + 'booking / checkout, follow-up, recovery, CRM and analytics — shown as three interactive industry demos: '
      + 'Salon & Spa, Real Estate and E-commerce.',
    icon: '⟠',
    accent: '--agent-funnel',
    category: 'Flagship · Demo Campaigns',
    capabilities: [
      'Salon & Spa demo',
      'Real Estate demo',
      'E-commerce demo',
      'AI lead qualification',
      'AI sales assistant',
      'Recommendations & offers',
      'Booking / checkout',
      'Abandoned-cart recovery',
      'CRM & cross-campaign analytics',
    ],
    sampleQuestions: [
      'Book a bridal appointment',
      'Find me a 2-bed near the marina',
      'A gift under $100',
    ],
    demoScriptId: null,
    transport: { demo: 'mock', live: 'serverless' },
    webhook: null,
    tools: ['funnel.capture', 'funnel.qualify', 'funnel.recommend', 'funnel.book', 'funnel.checkout', 'funnel.followup'],
    successEvents: ['lead_captured', 'lead_qualified', 'recommendation_shown', 'booking_made', 'purchase'],
    status: 'ready',
    /* a full system with its own pages — the hub links to the
       Demo Campaigns selector */
    href: 'campaigns.html',
    consoleHref: 'campaigns.html#performance',
  },
];

export const AGENT_IDS = AGENTS.map((a) => a.id);

export function getAgent(id) {
  if (!id) return null;
  const key = String(id).trim().toLowerCase();
  return AGENTS.find((a) => a.id === key) || null;
}
