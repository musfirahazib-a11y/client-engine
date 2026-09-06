/* ===========================================================
   MusfirahLoom — AI Agent Platform
   data/faqs.js  ·  MOCK KNOWLEDGE BASE (Demo Mode only)

   Concise, generic ecommerce answers in the MusfirahLoom store
   voice. Keyword lists drive kbRepo's lightweight matching —
   no vector database. Phase 2 can point kbRepo at a real KB.
=========================================================== */
import { getBusinessId } from '../js/services/scope.js';
import { FAQS as AERA_FAQS } from './businesses/aera.js';
import { FAQS as NOCTURNE_FAQS } from './businesses/nocturne.js';
import { FAQS as MERIDIAN_FAQS } from './businesses/meridian.js';

const GENERIC_FAQS = [
  /* ---------------- SHIPPING ---------------- */
  {
    id: 'ship-times',
    category: 'Shipping',
    question: 'How long does shipping take?',
    keywords: ['shipping', 'how long', 'delivery time', 'take', 'arrive', 'dispatch', 'processing time', 'when'],
    answer:
      'Orders are processed in 1–2 business days. Standard delivery is 3–5 business days after dispatch; express is 1–2. You get a tracking link by email as soon as it ships.',
  },
  {
    id: 'ship-international',
    category: 'Shipping',
    question: 'Do you ship internationally?',
    keywords: ['international', 'worldwide', 'overseas', 'outside', 'country', 'abroad', 'customs', 'duties'],
    answer:
      'Yes — we ship to most countries. International delivery is typically 7–14 business days. Any import duties or taxes are set by the destination country and paid by the recipient.',
  },
  {
    id: 'ship-cost',
    category: 'Shipping',
    question: 'How much is shipping?',
    keywords: ['shipping cost', 'shipping price', 'how much', 'delivery fee', 'free shipping', 'postage'],
    answer:
      'Standard shipping is a flat $5 and free on orders over $75. Express is $12. International rates are calculated at checkout by weight and destination.',
  },
  {
    id: 'ship-tracking',
    category: 'Shipping',
    question: 'How can I track my package?',
    keywords: ['track', 'tracking', 'where is my package', 'tracking number', 'tracking link', 'follow'],
    answer:
      'When your order ships we email a tracking number and a link to the carrier. You can also ask me here with your order number (it looks like ML-10482) and I will pull the latest status.',
  },
  {
    id: 'ship-delayed',
    category: 'Shipping',
    question: 'My package is delayed — what should I do?',
    keywords: ['delayed', 'late', 'stuck', 'not moving', 'hasnt arrived', 'has not arrived', 'overdue', 'slow'],
    answer:
      'Carriers occasionally hold a parcel for a day or two, especially around peak periods. If tracking has not updated in 3+ business days past the estimate, tell me your order number and I can flag it or bring in a human.',
  },

  /* ---------------- RETURNS ---------------- */
  {
    id: 'ret-window',
    category: 'Returns',
    question: 'What is your return window?',
    keywords: ['return window', 'return policy', 'how long', 'return period', '30 days', 'time limit', 'return by'],
    answer:
      'Unworn, undamaged items can be returned within 30 days of delivery in their original packaging. Start it here with your order number and I will check eligibility.',
  },
  {
    id: 'ret-exchange',
    category: 'Returns',
    question: 'Can I exchange an item?',
    keywords: ['exchange', 'swap', 'different size', 'different colour', 'different color', 'wrong size'],
    answer:
      'Yes. Exchanges follow the same 30-day window as returns. The quickest route is to return the original for a refund and place a new order; I can start the return for you.',
  },
  {
    id: 'ret-refund-timing',
    category: 'Returns',
    question: 'How long do refunds take?',
    keywords: ['refund', 'how long', 'refund timing', 'when refund', 'money back', 'refund time', 'get my money'],
    answer:
      'Once we receive and check a returned item, the refund is issued to your original payment method within 3–5 business days. It can take a further 5–10 business days to appear on your statement.',
  },
  {
    id: 'ret-damaged',
    category: 'Returns',
    question: 'My item arrived damaged.',
    keywords: ['damaged', 'broken', 'cracked', 'faulty', 'defective', 'smashed', 'arrived broken'],
    answer:
      'Sorry about that. Send me your order number and I can arrange a free replacement or a full refund — no need to ship the damaged item back first. A photo helps but is not required in this demo.',
  },
  {
    id: 'ret-wrong-item',
    category: 'Returns',
    question: 'I received the wrong item.',
    keywords: ['wrong item', 'wrong order', 'not what i ordered', 'incorrect item', 'different item', 'mix up', 'mixup'],
    answer:
      'That is on us. Give me the order number and I will send the correct item right away with a prepaid label for the incorrect one, or issue a refund if you prefer.',
  },
  {
    id: 'ret-sale-items',
    category: 'Returns',
    question: 'Can I return sale or final-sale items?',
    keywords: ['sale items', 'final sale', 'clearance', 'discounted', 'sale item return', 'marked down'],
    answer:
      'Items marked "final sale" cannot be returned or exchanged unless they arrive faulty. Regular sale items follow the standard 30-day return policy.',
  },

  /* ---------------- PAYMENTS ---------------- */
  {
    id: 'pay-methods',
    category: 'Payments',
    question: 'What payment methods do you accept?',
    keywords: ['payment methods', 'pay', 'accept', 'card', 'visa', 'mastercard', 'paypal', 'apple pay', 'google pay'],
    answer:
      'We accept Visa, Mastercard, American Express, PayPal, Apple Pay and Google Pay. All payments are processed securely; we never store full card numbers.',
  },
  {
    id: 'pay-failed',
    category: 'Payments',
    question: 'My payment failed.',
    keywords: ['payment failed', 'declined', 'card declined', 'wont go through', 'will not go through', 'charge failed', 'cant pay'],
    answer:
      'A failed payment is usually a bank authorisation issue. Check the card details and billing address, try another method, or contact your bank. Your order is held for 24 hours so nothing is lost while you sort it out.',
  },
  {
    id: 'pay-refund-method',
    category: 'Payments',
    question: 'How are refunds paid?',
    keywords: ['refund method', 'refund to card', 'how are refunds paid', 'original payment', 'store credit'],
    answer:
      'Refunds always go back to the original payment method used at checkout. If that card is no longer active, contact us and we will arrange store credit instead.',
  },

  /* ---------------- PRODUCTS ---------------- */
  {
    id: 'prod-materials',
    category: 'Products',
    question: 'What are your products made of?',
    keywords: ['material', 'materials', 'made of', 'made from', 'metal', 'gold', 'silver', 'is it gold', 'solid gold', 'plated', 'vermeil', 'leather', 'wool', 'ceramic'],
    answer:
      'Materials are listed on every product page. Jewellery is 14k gold vermeil or recycled sterling silver; leather goods use full-grain leather; textiles are merino or lambswool. Nothing uses nickel, so pieces are suitable for sensitive skin.',
  },
  {
    id: 'prod-sizing',
    category: 'Products',
    question: 'How do I find the right size?',
    keywords: ['size', 'sizing', 'what size', 'fit', 'size guide', 'measurements', 'too big', 'too small'],
    answer:
      'Each product page has a size guide with measurements. If you are between sizes we generally suggest sizing up. Not sure? Tell me the item and I will point you to the guide.',
  },
  {
    id: 'prod-care',
    category: 'Products',
    question: 'How do I care for my item?',
    keywords: ['care', 'clean', 'cleaning', 'care instructions', 'look after', 'maintenance', 'tarnish', 'wash', 'polish'],
    answer:
      'Keep jewellery dry and store it in the pouch provided; polish gently with a soft cloth. Leather: wipe with a dry cloth and condition occasionally. Textiles: cool hand-wash or dry clean. Full care notes are on each product page.',
  },
  {
    id: 'prod-custom',
    category: 'Products',
    question: 'Can items be customised or engraved?',
    keywords: ['customis', 'customiz', 'engrav', 'personalis', 'personaliz', 'monogram', 'initials', 'bespoke'],
    answer:
      'Selected pieces can be engraved with up to 12 characters — look for the "Add engraving" option on the product page. Engraved items are made to order and are not eligible for return unless faulty.',
  },

  /* ---------------- GENERAL ---------------- */
  {
    id: 'gen-contact',
    category: 'General',
    question: 'How do I contact support?',
    keywords: ['contact', 'support', 'email', 'phone', 'reach you', 'get in touch', 'help desk', 'customer service'],
    answer:
      'You can reach a human at support@musfirahloom.example by email, or ask me here to hand the conversation over. Support hours are Monday–Friday, 9am–6pm.',
  },
  {
    id: 'gen-cancel',
    category: 'General',
    question: 'Can I cancel or change my order?',
    keywords: ['cancel', 'cancel order', 'change order', 'change address', 'edit order', 'stop order', 'amend'],
    answer:
      'Orders can be changed or cancelled while they are still "Processing". Once an order is Shipped it cannot be cancelled, but you can refuse delivery or return it. Give me your order number and I will check.',
  },
  {
    id: 'gen-gift',
    category: 'General',
    question: 'Do you offer gift orders?',
    keywords: ['gift', 'gift order', 'gift receipt', 'gift wrap', 'gift message', 'present', 'hide price'],
    answer:
      'Yes — at checkout you can add gift wrap, include a handwritten note, and we always leave prices off the packing slip for gift orders.',
  },
];

const BY_BIZ = { aera: AERA_FAQS, nocturne: NOCTURNE_FAQS, meridian: MERIDIAN_FAQS };
export const FAQS = BY_BIZ[getBusinessId()] || GENERIC_FAQS;

export default FAQS;
