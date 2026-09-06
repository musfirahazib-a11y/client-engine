/* ===========================================================
   MERIDIAN Estates — demo business data (fictional brokerage)

   Loaded when agent.html is opened with ?biz=meridian (from the
   "Viewing assistant" panel on work/real-estate.html). The
   Lead + Booking agent qualifies a buyer brief, shortlists from
   LISTINGS and books a viewing into a MERIDIAN slot.
=========================================================== */

/* PRODUCTS = property listings, shaped so productRepo.search works. */
export const PRODUCTS = [
  { id: 'dune-house', title: 'The Dune House', price: 3250000, category: 'House',
    tags: ['coastal', 'pembrey', '4 bed', 'architect', 'sea view', 'cedar', 'new'],
    recipient: ['buyer', 'family'], occasion: ['buy-to-live'], style: ['modern', 'architectural'],
    rating: 4.9, reviews: 0, stock: 1,
    blurb: 'A low, cedar-clad 4-bed house set into the dunes at Pembrey, oriented to first light across the estuary. 310 m², 0.4-acre plot.',
    related: ['cliff-studio', 'blackwood-mews'] },
  { id: 'blackwood-mews', title: 'Blackwood Mews', price: 4900000, category: 'House',
    tags: ['city', 'marylebone', '3 bed', 'mews', 'exclusive', 'private'],
    recipient: ['buyer', 'investor'], occasion: ['buy-to-live', 'pied-a-terre'], style: ['modern', 'discreet'],
    rating: 4.8, reviews: 0, stock: 1,
    blurb: 'A rebuilt 3-bed mews house behind a private gate in Marylebone. 240 m² over three floors, off-street parking.',
    related: ['ferro-tower', 'dune-house'] },
  { id: 'long-meadow', title: 'Long Meadow Barn', price: 2150000, category: 'House',
    tags: ['country', 'cotswold', '5 bed', 'barn conversion', 'land', 'family'],
    recipient: ['buyer', 'family'], occasion: ['buy-to-live'], style: ['converted', 'rural'],
    rating: 4.7, reviews: 0, stock: 1,
    blurb: 'A five-bedroom barn conversion on the Cotswold edge with 2.1 acres, a cart barn and stabling.',
    related: ['hafod-estate', 'dune-house'] },
  { id: 'ferro-tower', title: 'Ferro Tower · 21F', price: 1780000, category: 'Apartment',
    tags: ['city', 'southbank', '2 bed', 'apartment', 'river view', 'new', 'concierge'],
    recipient: ['buyer', 'investor'], occasion: ['buy-to-live', 'invest'], style: ['modern', 'tower'],
    rating: 4.5, reviews: 0, stock: 1,
    blurb: 'A 2-bed, 2-bath apartment on the 21st floor at Southbank with a river-facing balcony. 128 m², 24-hour concierge.',
    related: ['blackwood-mews', 'cliff-studio'] },
  { id: 'cliff-studio', title: 'Cliff Studio', price: 1250000, category: 'House',
    tags: ['coastal', 'st agnes', '1 bed', 'studio', 'reduced', 'small', 'sea view'],
    recipient: ['buyer', 'downsizer'], occasion: ['buy-to-live', 'second home'], style: ['modern', 'compact'],
    rating: 4.4, reviews: 0, stock: 1,
    blurb: 'A one-bed cliff-edge studio house at St Agnes, recently reduced. 84 m², full-width glazing to the water.',
    related: ['dune-house', 'ferro-tower'] },
  { id: 'hafod-estate', title: 'Hafod Estate', price: 6400000, category: 'Estate',
    tags: ['country', 'mid wales', '7 bed', 'estate', 'land', 'equestrian', 'lake'],
    recipient: ['buyer', 'family', 'investor'], occasion: ['buy-to-live', 'legacy'], style: ['period', 'rural'],
    rating: 4.9, reviews: 0, stock: 1,
    blurb: 'A seven-bedroom principal house on an 18-acre estate in Mid Wales, with a coach house, walled garden and a spring-fed lake.',
    related: ['long-meadow', 'dune-house'] },
];

/* Pre-seeded buyer leads for "show hot leads" style prompts. */
export const LEADS = [
  { leadId: 'LEAD-60112', name: 'Amara Osei', email: 'amara.osei@example.com', phone: '+44 7700 900112',
    business: 'Private buyer', businessType: 'buyer', service: 'Coastal 4-bed, buy-to-live',
    budget: 3500000, timeline: 'this month', source: 'Referral', authority: 'owner',
    needStrength: 'clear', intent: 'ready to buy', qualificationStatus: 'Hot', score: 90,
    notes: 'Relocating for work, chain-free, cash buyer. Shortlisted The Dune House and Cliff Studio.', appointmentStatus: 'none' },
  { leadId: 'LEAD-60138', name: 'Henry Calder', email: 'h.calder@example.com', phone: '+44 7700 900138',
    business: 'Private buyer', businessType: 'buyer', service: 'City pied-à-terre',
    budget: 2000000, timeline: '1-3 months', source: 'Website', authority: 'joint',
    needStrength: 'good', intent: 'evaluating', qualificationStatus: 'Warm', score: 68,
    notes: 'Deciding with partner between Ferro Tower and a Marylebone mews. Mortgage in principle in place.', appointmentStatus: 'none' },
  { leadId: 'LEAD-60155', name: 'Rebecca Lin', email: 'rebecca.lin@example.com', phone: '+44 7700 900155',
    business: 'Private buyer', businessType: 'buyer', service: 'Country family home',
    budget: 'flexible', timeline: 'researching', source: 'Instagram', authority: 'gatekeeper',
    needStrength: 'vague', intent: 'researching', qualificationStatus: 'Cold', score: 34,
    notes: 'Early browsing, no finance arranged, no fixed area. Nurture.', appointmentStatus: 'none' },
];

/* Slot config picked up by data/slots.js when biz=meridian. */
export const SLOT_CONFIG = {
  services: ['Private Viewing', 'Second Viewing', 'Valuation Appointment', 'Buyer Consultation'],
  staff: ['Marcus Idowu', 'Elena Fournier', 'Daniel Roche'],
};

export const FAQS = [
  { id: 'mer-viewings', category: 'Viewings', question: 'How do viewings work?',
    keywords: ['viewing', 'view', 'see the house', 'appointment', 'visit', 'tour', 'book'],
    answer: 'Every MERIDIAN viewing is accompanied by the advisor for that region. Tell the assistant which residences and your rough availability and it will hold a slot; you get a confirmation, the address and a reminder. Second viewings and a surveyor visit are arranged the same way.' },
  { id: 'mer-process', category: 'Process', question: 'What happens after I offer?',
    keywords: ['offer', 'process', 'next steps', 'buying', 'conveyancing', 'exchange', 'completion'],
    answer: 'Offers go through your advisor, who puts them to the vendor with proof of funds. On acceptance we issue a memorandum of sale to both solicitors; typical timeline to exchange is 8–12 weeks. The advisor stays on the file from offer to keys.' },
  { id: 'mer-valuation', category: 'Selling', question: 'Can you value my property?',
    keywords: ['valuation', 'value', 'sell', 'selling', 'market appraisal', 'worth', 'list my'],
    answer: 'Yes — MERIDIAN takes on design-led homes across coast, city and country. Book a valuation appointment through the assistant; the regional advisor visits, measures and photographs, and comes back within two working days with a figure and a marketing plan.' },
  { id: 'mer-regions', category: 'Coverage', question: 'Which areas do you cover?',
    keywords: ['area', 'areas', 'region', 'where', 'coverage', 'location', 'cover'],
    answer: 'Three regions today: Coast (South-West and West Wales), City (central London), and Country (the Cotswolds and Mid Wales). An Alpine region opens in 2027. We take architectural and design-led homes; if a property is outside that brief we will say so.' },
  { id: 'mer-fees', category: 'Selling', question: 'What are your fees?',
    keywords: ['fee', 'fees', 'commission', 'cost', 'charge', 'percentage'],
    answer: 'Sole-agency fee is 1.5% + VAT of the achieved price, payable on completion, and includes the full photography and floor-plan package. There is no upfront cost and no charge if the property does not sell.' },
  { id: 'mer-chain', category: 'Buying', question: 'Do you check that buyers are qualified?',
    keywords: ['qualified', 'proof of funds', 'mortgage', 'chain', 'finance', 'serious buyer'],
    answer: 'Before a viewing the assistant confirms budget, whether finance is arranged and your timeline, and flags chain position. It means vendors only meet buyers who can actually proceed — and you only spend evenings on homes within reach.' },
];
