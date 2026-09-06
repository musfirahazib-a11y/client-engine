/* ===========================================================
   MusfirahLoom — AI Agent Platform
   data/abandonedCarts.js  ·  MOCK ABANDONED CARTS (Demo Mode)

   Plain ES-module data — no server, no build, no packages.
   Every name / email is synthetic. Timestamps are generated
   relative to "now" at load time so the demo never looks
   stale. Item name / price / category mirror data/products.js.
   In Phase 2 cartRecoveryRepo swaps this for a real store API.
=========================================================== */

/* hours ago -> ISO timestamp */
const H = (hours) => new Date(Date.now() - hours * 3600000).toISOString();

import { getBusinessId } from '../js/services/scope.js';
import { ABANDONED_CARTS as AERA_CARTS } from './businesses/aera.js';
import { ABANDONED_CARTS as NOCTURNE_CARTS } from './businesses/nocturne.js';

const GENERIC_CARTS = [
  {
    cartId: 'CART-10482',
    customerId: 'CUS-3201',
    customerName: 'Sarah',
    email: 'sarah@example.com',
    createdAt: H(6),
    lastActivityAt: H(5),
    items: [
      { sku: 'JWL-HOOPS-01', name: '14k Gold Vermeil Hoop Earrings', qty: 1, price: 78, category: 'Jewelry' },
      { sku: 'ACC-SCARF-01', name: 'Merino Wool Blanket Scarf', qty: 1, price: 68, category: 'Accessories' },
    ],
    subtotal: 146,
    discount: 0,
    total: 146,
    abandonmentReason: 'shipping cost',
    recoveryStatus: 'abandoned',
    customerSegment: 'returning',
    recommendedAction: 'free shipping',
  },
  {
    cartId: 'CART-10517',
    customerId: 'CUS-3288',
    customerName: 'Daniel',
    email: 'daniel@example.com',
    createdAt: H(26),
    lastActivityAt: H(25),
    items: [
      { sku: 'TEC-BUDS-01', name: 'Wireless Noise-Cancelling Earbuds', qty: 1, price: 99, category: 'Tech' },
      { sku: 'TEC-TRACKER-01', name: 'Leather Keyring Item Tracker', qty: 1, price: 39, category: 'Tech' },
    ],
    subtotal: 138,
    discount: 0,
    total: 138,
    abandonmentReason: 'comparing options',
    recoveryStatus: 'abandoned',
    customerSegment: 'new',
    recommendedAction: '10% discount',
  },
  {
    cartId: 'CART-10538',
    customerId: 'CUS-3120',
    customerName: 'Aria',
    email: 'aria@example.com',
    createdAt: H(3),
    lastActivityAt: H(2),
    items: [
      { sku: 'JWL-DIAMOND-01', name: 'Solitaire Lab-Diamond Studs', qty: 1, price: 320, category: 'Jewelry' },
    ],
    subtotal: 320,
    discount: 0,
    total: 320,
    abandonmentReason: 'price',
    recoveryStatus: 'abandoned',
    customerSegment: 'VIP',
    recommendedAction: '15% discount',
  },
  {
    cartId: 'CART-10501',
    customerId: 'CUS-3255',
    customerName: 'Marcus',
    email: 'marcus@example.com',
    createdAt: H(50),
    lastActivityAt: H(47),
    items: [
      { sku: 'HOME-THROW-01', name: 'Lambswool Herringbone Throw', qty: 1, price: 128, category: 'Home' },
      { sku: 'BTY-CANDLE-01', name: 'Fig & Cedar Soy Candle', qty: 2, price: 34, category: 'Home' },
    ],
    subtotal: 196,
    discount: 0,
    total: 196,
    abandonmentReason: 'needs more time',
    recoveryStatus: 'abandoned',
    customerSegment: 'returning',
    recommendedAction: 'gentle reminder',
  },
  {
    cartId: 'CART-10559',
    customerId: 'CUS-3302',
    customerName: 'Lena',
    email: 'lena@example.com',
    createdAt: H(9),
    lastActivityAt: H(8),
    items: [
      { sku: 'ACC-TOTE-01', name: 'Waxed Canvas Weekender Bag', qty: 1, price: 145, category: 'Accessories' },
    ],
    subtotal: 145,
    discount: 0,
    total: 145,
    abandonmentReason: 'unsure about product',
    recoveryStatus: 'abandoned',
    customerSegment: 'new',
    recommendedAction: 'product recommendation',
  },
  {
    cartId: 'CART-10473',
    customerId: 'CUS-3277',
    customerName: 'Tom',
    email: 'tom@example.com',
    createdAt: H(1),
    lastActivityAt: H(0.7),
    items: [
      { sku: 'BTY-SHAVE-01', name: 'Safety Razor Starter Kit', qty: 1, price: 62, category: 'Beauty' },
      { sku: 'GFT-BOX-01', name: 'Build-Your-Own Gift Box (Small)', qty: 1, price: 18, category: 'Accessories' },
    ],
    subtotal: 80,
    discount: 0,
    total: 80,
    abandonmentReason: 'checkout distraction',
    recoveryStatus: 'abandoned',
    customerSegment: 'one-time',
    recommendedAction: 'gentle reminder',
  },
  {
    cartId: 'CART-10490',
    customerId: 'CUS-3190',
    customerName: 'Nadia',
    email: 'nadia@example.com',
    createdAt: H(38),
    lastActivityAt: H(34),
    items: [
      { sku: 'FRG-AMBER-01', name: 'Amber & Oud Eau de Parfum', qty: 1, price: 92, category: 'Fragrance' },
      { sku: 'BTY-SET-01', name: 'Botanical Hand Care Set', qty: 1, price: 42, category: 'Beauty' },
    ],
    subtotal: 134,
    discount: 0,
    total: 134,
    abandonmentReason: 'price',
    recoveryStatus: 'contacted',
    customerSegment: 'at-risk',
    recommendedAction: '10% discount',
  },
  {
    cartId: 'CART-10444',
    customerId: 'CUS-3241',
    customerName: 'Ellis',
    email: 'ellis@example.com',
    createdAt: H(12),
    lastActivityAt: H(11),
    items: [
      { sku: 'JWL-PENDANT-01', name: 'Birthstone Pendant Necklace', qty: 1, price: 96, category: 'Jewelry' },
    ],
    subtotal: 96,
    discount: 0,
    total: 96,
    abandonmentReason: 'sizing uncertainty',
    recoveryStatus: 'abandoned',
    customerSegment: 'returning',
    recommendedAction: 'product recommendation',
  },
  {
    cartId: 'CART-10420',
    customerId: 'CUS-3315',
    customerName: 'Hana',
    email: 'hana@example.com',
    createdAt: H(5),
    lastActivityAt: H(4),
    items: [
      { sku: 'TEC-GRINDER-01', name: 'Hand Coffee Grinder — Steel Burr', qty: 1, price: 88, category: 'Tech' },
      { sku: 'HOME-MUG-01', name: 'Stoneware Pour-Over Mug Set', qty: 1, price: 46, category: 'Home' },
    ],
    subtotal: 134,
    discount: 0,
    total: 134,
    abandonmentReason: 'payment concern',
    recoveryStatus: 'abandoned',
    customerSegment: 'new',
    recommendedAction: 'no incentive',
  },
  {
    cartId: 'CART-10399',
    customerId: 'CUS-3208',
    customerName: 'Diego',
    email: 'diego@example.com',
    createdAt: H(30),
    lastActivityAt: H(28),
    items: [
      { sku: 'TEC-SPEAKER-01', name: 'Portable Linen Bluetooth Speaker', qty: 1, price: 74, category: 'Tech' },
      { sku: 'TEC-BUDS-01', name: 'Wireless Noise-Cancelling Earbuds', qty: 1, price: 99, category: 'Tech' },
    ],
    subtotal: 173,
    discount: 0,
    total: 173,
    abandonmentReason: 'price',
    recoveryStatus: 'recovered',
    customerSegment: 'returning',
    recommendedAction: '10% discount',
    recoveredRevenue: 156,
    recoveredMethod: '10% discount',
    recoveredAt: H(22),
  },
  {
    cartId: 'CART-10355',
    customerId: 'CUS-3163',
    customerName: 'Farah',
    email: 'farah@example.com',
    createdAt: H(240),
    lastActivityAt: H(236),
    items: [
      { sku: 'FRG-ROSE-01', name: 'Rose & Pepper Travel Spray', qty: 1, price: 38, category: 'Fragrance' },
      { sku: 'BTY-BALM-01', name: 'Overnight Lip Mask Duo', qty: 1, price: 24, category: 'Beauty' },
    ],
    subtotal: 62,
    discount: 0,
    total: 62,
    abandonmentReason: 'comparing options',
    recoveryStatus: 'expired',
    customerSegment: 'one-time',
    recommendedAction: 'no incentive',
  },
];

const BY_BIZ = { aera: AERA_CARTS, nocturne: NOCTURNE_CARTS };
export const ABANDONED_CARTS = BY_BIZ[getBusinessId()] || GENERIC_CARTS;

export default ABANDONED_CARTS;
