/* ===========================================================
   Misbah Azib — AI Agent Platform
   services/scope.js  ·  demo-business scoping

   agent.html can be opened plain (agent.html?id=sales) or
   scoped to one of the three portfolio demo businesses
   (agent.html?id=sales&biz=aera). When a ?biz= is present the
   data repositories load that business's catalogue / orders /
   FAQs instead of the generic gift-shop set, so every agent
   reply refers to real demo products, orders and listings.

   ?embed=1 renders the chat on its own (no top bar) so it can
   sit inside an <iframe> panel on the demo site itself.

   Everything here is read synchronously from the URL, so the
   data modules can resolve their business at import time.
=========================================================== */

function param(name) {
  try {
    return new URLSearchParams(window.location.search).get(name);
  } catch {
    return null;
  }
}

const VALID = ['aera', 'nocturne', 'meridian'];

export function getBusinessId() {
  const raw = String(param('biz') || '').trim().toLowerCase();
  return VALID.includes(raw) ? raw : null;
}

/* All three demo brands price in GBP; the generic hub is USD. */
export function getCurrency() {
  return getBusinessId() ? '£' : '$';
}

export function isEmbed() {
  return ['1', 'true', 'yes'].includes(String(param('embed') || '').toLowerCase());
}

/* Per-business presentation + which agents it uses, and what
   each agent is doing *for that business*. Used by the context
   strip above the chat and by the demo-site panels. */
export const BUSINESSES = {
  aera: {
    id: 'aera',
    name: 'AÉRA',
    kind: 'Premium skincare · e-commerce',
    site: 'work/ecommerce.html',
    siteLabel: 'aera.example',
    accent: '#B4623D',
    agents: {
      sales: {
        label: 'AÉRA Product Advisor',
        purpose: 'Recommends from the real AÉRA range, compares formulas and builds a routine to budget.',
        samples: ['Build a routine for dry, sensitive skin', 'What works under £120?', 'Compare the Barrier Serum and Weightless Cream', 'A gift set for someone new to skincare'],
      },
      support: {
        label: 'AÉRA Customer Care',
        purpose: 'Order status, returns and formula questions from the AÉRA knowledge base.',
        samples: ['Where is my order ML-40318?', 'Can I return ML-40231?', 'Are the formulas fragrance-free?', 'How do the refills work?'],
      },
      cart: {
        label: 'AÉRA Cart Recovery',
        purpose: 'Works AÉRA carts left at checkout — reads the objection, picks the smallest incentive that fixes it.',
        samples: ['Show abandoned carts', 'Which cart should I recover first?', 'How much revenue can we recover?'],
      },
    },
  },
  nocturne: {
    id: 'nocturne',
    name: 'ATELIER NOCTURNE',
    kind: 'Luxury fashion house',
    site: 'work/fashion.html',
    siteLabel: 'ateliernocturne.example',
    accent: '#C6A15B',
    agents: {
      sales: {
        label: 'NOCTURNE Atelier Concierge',
        purpose: 'Recommends pieces from the AW run, checks the short size range and routes private-appointment requests.',
        samples: ['Style the Midnight Coat for an evening', 'What tailoring is under £600?', 'Compare the Column and Hook-Waist trousers', 'I am between sizes 2 and 3'],
      },
      support: {
        label: 'NOCTURNE Client Service',
        purpose: 'Order status, alterations, shipping and appointment questions for Atelier Nocturne clients.',
        samples: ['Where is my order ML-50142?', 'Can I get the trousers hemmed?', 'How does the sizing run?', 'Book a private appointment'],
      },
    },
  },
  meridian: {
    id: 'meridian',
    name: 'MERIDIAN Estates',
    kind: 'Architectural property brokerage',
    site: 'work/real-estate.html',
    siteLabel: 'meridianestates.example',
    accent: '#2E4739',
    agents: {
      lead: {
        label: 'MERIDIAN Viewing Assistant',
        purpose: 'Qualifies a buyer brief on budget, timeline and intent, shortlists residences and books a viewing.',
        samples: ['I want a coastal 4-bed, budget around £3.5M', 'Book a viewing for The Dune House', 'Show available viewing slots', 'Show hot leads'],
      },
      support: {
        label: 'MERIDIAN Client Desk',
        purpose: 'Post-viewing questions, valuation requests and reschedules for MERIDIAN clients.',
        samples: ['How do viewings work?', 'Can you value my property?', 'Which areas do you cover?', 'What happens after I offer?'],
      },
    },
  },
};

export function getBusiness() {
  const id = getBusinessId();
  return id ? BUSINESSES[id] : null;
}

/** Pick the business-scoped slice of a keyed data map, else null. */
export function forBusiness(map) {
  const id = getBusinessId();
  return id && map && map[id] ? map[id] : null;
}
