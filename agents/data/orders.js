/* ===========================================================
   MusfirahLoom — AI Agent Platform
   data/orders.js  ·  MOCK ORDERS (Demo Mode only)

   Plain ES-module data — no server, no build, no packages.
   Every name / email / address here is synthetic. Dates are
   generated relative to "today" at load time so the demo never
   looks stale. In Phase 2 orderRepo swaps this for a real
   store API; nothing else changes.
=========================================================== */

/* days from today -> YYYY-MM-DD */
const D = (n) => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

import { getBusinessId } from '../js/services/scope.js';
import { ORDERS as AERA_ORDERS } from './businesses/aera.js';
import { ORDERS as NOCTURNE_ORDERS } from './businesses/nocturne.js';

const GENERIC_ORDERS = [
  {
    orderId: 'ML-10482',
    customerName: 'Jordan Avery',
    email: 'jordan.avery@example.com',
    status: 'Delivered',
    orderDate: D(-9),
    estimatedDelivery: D(-3),
    trackingNumber: 'TRK-7788-4412-9083',
    shippingCarrier: 'Meridian Post',
    items: [
      { sku: 'JWL-HOOPS-01', name: '14k Gold Vermeil Hoop Earrings', qty: 1, price: 78 },
    ],
    subtotal: 78,
    shipping: 0,
    total: 78,
    paymentStatus: 'Paid',
    fulfillmentStatus: 'Fulfilled',
  },
  {
    orderId: 'ML-10517',
    customerName: 'Priya Nair',
    email: 'priya.nair@example.com',
    status: 'In Transit',
    orderDate: D(-4),
    estimatedDelivery: D(2),
    trackingNumber: 'TRK-2231-9087-1140',
    shippingCarrier: 'BlueDart Express',
    items: [
      { sku: 'HOME-THROW-01', name: 'Lambswool Herringbone Throw', qty: 1, price: 128 },
      { sku: 'BTY-CANDLE-01', name: 'Fig & Cedar Soy Candle', qty: 2, price: 34 },
    ],
    subtotal: 196,
    shipping: 6,
    total: 202,
    paymentStatus: 'Paid',
    fulfillmentStatus: 'Fulfilled',
  },
  {
    orderId: 'ML-10460',
    customerName: 'Sam Whitlock',
    email: 'sam.whitlock@example.com',
    status: 'Delivered',
    orderDate: D(-17),
    estimatedDelivery: D(-10),
    trackingNumber: 'TRK-5540-3312-7789',
    shippingCarrier: 'CityLink Courier',
    items: [
      { sku: 'ACC-WALLET-01', name: 'Slim Bifold RFID Wallet', qty: 1, price: 44 },
    ],
    subtotal: 44,
    shipping: 5,
    total: 49,
    paymentStatus: 'Paid',
    fulfillmentStatus: 'Fulfilled',
  },
  {
    orderId: 'ML-10603',
    customerName: 'Lena Ortiz',
    email: 'lena.ortiz@example.com',
    status: 'Processing',
    orderDate: D(-1),
    estimatedDelivery: D(6),
    trackingNumber: null,
    shippingCarrier: null,
    items: [
      { sku: 'FRG-AMBER-01', name: 'Amber & Oud Eau de Parfum', qty: 1, price: 92 },
    ],
    subtotal: 92,
    shipping: 0,
    total: 92,
    paymentStatus: 'Paid',
    fulfillmentStatus: 'Unfulfilled',
  },
  {
    orderId: 'ML-10391',
    customerName: 'Marcus Bell',
    email: 'marcus.bell@example.com',
    status: 'Delivered',
    orderDate: D(-47),
    estimatedDelivery: D(-40),
    trackingNumber: 'TRK-1180-6642-2093',
    shippingCarrier: 'Meridian Post',
    items: [
      { sku: 'HOME-MUG-01', name: 'Stoneware Pour-Over Mug Set', qty: 1, price: 46 },
    ],
    subtotal: 46,
    shipping: 5,
    total: 51,
    paymentStatus: 'Paid',
    fulfillmentStatus: 'Fulfilled',
  },
  {
    orderId: 'ML-10574',
    customerName: 'Aisha Rahman',
    email: 'aisha.rahman@example.com',
    status: 'Out for Delivery',
    orderDate: D(-5),
    estimatedDelivery: D(0),
    trackingNumber: 'TRK-9902-4471-5561',
    shippingCarrier: 'BlueDart Express',
    items: [
      { sku: 'ACC-SCARF-01', name: 'Merino Wool Blanket Scarf', qty: 1, price: 68 },
    ],
    subtotal: 68,
    shipping: 0,
    total: 68,
    paymentStatus: 'Paid',
    fulfillmentStatus: 'Fulfilled',
  },
  {
    orderId: 'ML-10428',
    customerName: 'Tom Frost',
    email: 'tom.frost@example.com',
    status: 'Delayed',
    orderDate: D(-12),
    estimatedDelivery: D(9),
    trackingNumber: 'TRK-3345-8890-1207',
    shippingCarrier: 'CityLink Courier',
    items: [
      { sku: 'TEC-BUDS-01', name: 'Wireless Noise-Cancelling Earbuds', qty: 1, price: 99 },
    ],
    subtotal: 99,
    shipping: 0,
    total: 99,
    paymentStatus: 'Paid',
    fulfillmentStatus: 'Fulfilled',
  },
  {
    orderId: 'ML-10336',
    customerName: 'Nadia Costa',
    email: 'nadia.costa@example.com',
    status: 'Cancelled',
    orderDate: D(-22),
    estimatedDelivery: D(-15),
    trackingNumber: null,
    shippingCarrier: null,
    items: [
      { sku: 'JWL-PENDANT-01', name: 'Birthstone Pendant Necklace', qty: 1, price: 96 },
    ],
    subtotal: 96,
    shipping: 0,
    total: 96,
    paymentStatus: 'Refunded',
    fulfillmentStatus: 'Cancelled',
  },
  {
    orderId: 'ML-10611',
    customerName: 'Ellis Park',
    email: 'ellis.park@example.com',
    status: 'Shipped',
    orderDate: D(-3),
    estimatedDelivery: D(3),
    trackingNumber: 'TRK-6690-2214-8875',
    shippingCarrier: 'Meridian Post',
    items: [
      { sku: 'BTY-SHAVE-01', name: 'Safety Razor Starter Kit', qty: 1, price: 62 },
      { sku: 'GFT-BOX-01', name: 'Build-Your-Own Gift Box (Small)', qty: 1, price: 18 },
    ],
    subtotal: 80,
    shipping: 0,
    total: 80,
    paymentStatus: 'Paid',
    fulfillmentStatus: 'Fulfilled',
  },
  {
    orderId: 'ML-10502',
    customerName: 'Hana Meyer',
    email: 'hana.meyer@example.com',
    status: 'Delivered',
    orderDate: D(-12),
    estimatedDelivery: D(-5),
    trackingNumber: 'TRK-4417-9980-3352',
    shippingCarrier: 'CityLink Courier',
    items: [
      { sku: 'JWL-DIAMOND-01', name: 'Solitaire Lab-Diamond Studs', qty: 1, price: 320, finalSale: true },
    ],
    subtotal: 320,
    shipping: 0,
    total: 320,
    paymentStatus: 'Paid',
    fulfillmentStatus: 'Fulfilled',
  },
  {
    orderId: 'ML-10555',
    customerName: 'Diego Salas',
    email: 'diego.salas@example.com',
    status: 'Delivered',
    orderDate: D(-8),
    estimatedDelivery: D(-1),
    trackingNumber: 'TRK-7723-1145-6690',
    shippingCarrier: 'BlueDart Express',
    items: [
      { sku: 'TEC-SPEAKER-01', name: 'Portable Linen Bluetooth Speaker', qty: 1, price: 74 },
      { sku: 'TEC-TRACKER-01', name: 'Leather Keyring Item Tracker', qty: 2, price: 39 },
    ],
    subtotal: 152,
    shipping: 0,
    total: 152,
    paymentStatus: 'Paid',
    fulfillmentStatus: 'Fulfilled',
  },
  {
    orderId: 'ML-10480',
    customerName: 'Farah Idris',
    email: 'farah.idris@example.com',
    status: 'Processing',
    orderDate: D(-1),
    estimatedDelivery: D(7),
    trackingNumber: null,
    shippingCarrier: null,
    items: [
      { sku: 'BTY-SET-01', name: 'Botanical Hand Care Set', qty: 1, price: 42 },
    ],
    subtotal: 42,
    shipping: 5,
    total: 47,
    paymentStatus: 'Payment Failed',
    fulfillmentStatus: 'Unfulfilled',
  },
];

const BY_BIZ = { aera: AERA_ORDERS, nocturne: NOCTURNE_ORDERS };
export const ORDERS = BY_BIZ[getBusinessId()] || GENERIC_ORDERS;

export default ORDERS;
