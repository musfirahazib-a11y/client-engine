/* ===========================================================
   ATELIER NOCTURNE — demo business data (fictional fashion house)

   Loaded when agent.html is opened with ?biz=nocturne (from the
   "Atelier assistant" panel on work/fashion.html).
=========================================================== */

const D = (n) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const H = (h) => new Date(Date.now() - h * 3600000).toISOString();

export const PRODUCTS = [
  { id: 'midnight-coat', title: 'The Midnight Coat', price: 1850, category: 'Outerwear',
    tags: ['wool', 'tailored', 'evening', 'aw', 'statement', 'unlined'],
    recipient: ['me', 'him', 'her', 'partner'], occasion: ['evening', 'event', 'gift'], style: ['tailored', 'dramatic', 'classic'],
    rating: 4.9, reviews: 38, stock: 6,
    blurb: 'A long, unlined wool coat cut for movement — the anchor piece of the AW run. Sizes 1–4.',
    related: ['column-trouser', 'roll-neck', 'hook-trouser'] },
  { id: 'column-trouser', title: 'Column Trouser', price: 520, category: 'Tailoring',
    tags: ['wool', 'straight', 'high-rise', 'aw', 'core'],
    recipient: ['me', 'him', 'her'], occasion: ['evening', 'day-to-night', 'work'], style: ['tailored', 'minimal'],
    rating: 4.7, reviews: 61, stock: 14,
    blurb: 'A high-rise straight trouser in the same wool as the coat. Falls from the hip in one line. Sizes 1–4.',
    related: ['midnight-coat', 'roll-neck'] },
  { id: 'roll-neck', title: 'Static Roll-Neck', price: 390, category: 'Knitwear',
    tags: ['merino', 'fine-gauge', 'layering', 'aw', 'core'],
    recipient: ['me', 'him', 'her', 'partner'], occasion: ['evening', 'everyday', 'gift'], style: ['minimal', 'classic'],
    rating: 4.6, reviews: 44, stock: 11,
    blurb: 'A fine-gauge merino roll-neck built to layer flat under tailoring. Sizes XS–L.',
    related: ['column-trouser', 'midnight-coat'] },
  { id: 'hook-trouser', title: 'Hook-Waist Trouser', price: 560, category: 'Tailoring',
    tags: ['wool', 'wide', 'hardware', 'aw', 'statement'],
    recipient: ['me', 'him', 'her'], occasion: ['evening', 'event'], style: ['tailored', 'dramatic'],
    rating: 4.5, reviews: 22, stock: 8,
    blurb: 'A wider tailored trouser closing on an exposed hook-and-bar. The hardware piece of the run. Sizes 1–4.',
    related: ['midnight-coat', 'roll-neck'] },
  { id: 'drape-shirt', title: 'Drape Shirt', price: 340, category: 'Shirting',
    tags: ['cupro', 'fluid', 'evening', 'aw'],
    recipient: ['me', 'him', 'her'], occasion: ['evening', 'day-to-night'], style: ['minimal', 'fluid'],
    rating: 4.4, reviews: 29, stock: 17,
    blurb: 'A cupro shirt cut long and loose to move under the coat. Sizes XS–L.',
    related: ['column-trouser', 'midnight-coat'] },
  { id: 'hook-belt', title: 'Hook Belt', price: 240, category: 'Hardware',
    tags: ['leather', 'brass', 'accessory', 'aw', 'gift'],
    recipient: ['me', 'him', 'her', 'partner'], occasion: ['gift', 'everyday'], style: ['minimal', 'dramatic'],
    rating: 4.6, reviews: 51, stock: 25,
    blurb: 'A slim bridle-leather belt on the same exposed hook as the trouser. The easy entry piece.',
    related: ['hook-trouser', 'roll-neck'] },
];

export const ORDERS = [
  { orderId: 'ML-50117', customerName: 'Isabelle Corriveau', email: 'i.corriveau@example.com',
    status: 'Delivered', orderDate: D(-14), estimatedDelivery: D(-6),
    trackingNumber: 'TRK-AN-2231-7788', shippingCarrier: 'Nocturne Freight',
    items: [{ sku: 'ROLL-NECK', name: 'Static Roll-Neck', qty: 1, price: 390, size: 'M' }],
    subtotal: 390, shipping: 0, total: 390, paymentStatus: 'Paid', fulfillmentStatus: 'Fulfilled' },
  { orderId: 'ML-50142', customerName: 'David Renner', email: 'd.renner@example.com',
    status: 'In Transit', orderDate: D(-4), estimatedDelivery: D(3),
    trackingNumber: 'TRK-AN-3390-1120', shippingCarrier: 'Nocturne Freight',
    items: [{ sku: 'MIDNIGHT-COAT', name: 'The Midnight Coat', qty: 1, price: 1850, size: '2' }],
    subtotal: 1850, shipping: 0, total: 1850, paymentStatus: 'Paid', fulfillmentStatus: 'Shipped' },
  { orderId: 'ML-50168', customerName: 'Isabelle Corriveau', email: 'i.corriveau@example.com',
    status: 'Processing', orderDate: D(-1), estimatedDelivery: D(9),
    trackingNumber: '', shippingCarrier: 'Nocturne Freight',
    items: [{ sku: 'COLUMN-TROUSER', name: 'Column Trouser', qty: 1, price: 520, size: '2' },
            { sku: 'HOOK-BELT', name: 'Hook Belt', qty: 1, price: 240 }],
    subtotal: 760, shipping: 0, total: 760, paymentStatus: 'Paid', fulfillmentStatus: 'Unfulfilled' },
];

export const FAQS = [
  { id: 'noc-sizing', category: 'Product', question: 'How does the sizing run?',
    keywords: ['size', 'sizing', 'fit', 'measurements', 'runs small', 'true to size', 'size guide'],
    answer: 'Tailoring is a numeric run, sizes 1–4 (roughly UK 6–8 / 8–10 / 10–12 / 12–14). Knitwear is XS–L. Cut is close through the shoulder and long in the leg. Full garment measurements are on each product page; if you are between sizes the atelier will advise on a fitting.' },
  { id: 'noc-appointments', category: 'Appointments', question: 'Can I try pieces before buying?',
    keywords: ['appointment', 'try on', 'fitting', 'showroom', 'private', 'visit', 'in person'],
    answer: 'Yes — the studio holds private appointments on weekday evenings. Tell the assistant which pieces and your rough timing and it will hold a slot; you will get a confirmation and a reminder.' },
  { id: 'noc-alterations', category: 'Service', question: 'Do you alter garments?',
    keywords: ['alteration', 'alter', 'hem', 'tailor', 'take in', 'adjust', 'length'],
    answer: 'Trousers and the coat include one round of hem and sleeve alterations within 30 days of delivery, done in-house. Send the order number and what you need and the assistant will arrange collection.' },
  { id: 'noc-shipping', category: 'Shipping', question: 'How long does delivery take?',
    keywords: ['shipping', 'delivery', 'how long', 'dispatch', 'arrive', 'when', 'ship'],
    answer: 'In-stock pieces ship in 2–3 working days. UK next-day is available; EU is 3–5 days, rest of world 5–10, duties on the recipient. Made-to-order pieces are quoted at 3–4 weeks.' },
  { id: 'noc-returns', category: 'Returns', question: 'What is the returns policy?',
    keywords: ['return', 'refund', 'exchange', 'send back', 'policy', 'money back'],
    answer: 'Unworn pieces with tags can be returned within 21 days for a refund or size exchange. Altered garments and made-to-order pieces are final. The studio pays return shipping on faulty items.' },
  { id: 'noc-restock', category: 'Product', question: 'Will sold-out pieces come back?',
    keywords: ['restock', 'sold out', 'back in stock', 'waitlist', 'availability', 'out of stock'],
    answer: 'Three drops a year, nothing carried over — so a sold-out size usually will not return. The assistant can add you to a waitlist for any cancellations or a made-to-order slot.' },
];

export const ABANDONED_CARTS = [
  { cartId: 'CART-50117', customerId: 'CUS-AN-01', customerName: 'Elif', email: 'elif@example.com',
    createdAt: H(9), lastActivityAt: H(8),
    items: [{ sku: 'MIDNIGHT-COAT', name: 'The Midnight Coat', qty: 1, price: 1850, category: 'Outerwear' }],
    subtotal: 1850, discount: 0, total: 1850,
    abandonmentReason: 'sizing uncertainty', recoveryStatus: 'abandoned', customerSegment: 'VIP', recommendedAction: 'offer a fitting, no discount' },
  { cartId: 'CART-50145', customerId: 'CUS-AN-02', customerName: 'Rowan', email: 'rowan@example.com',
    createdAt: H(34), lastActivityAt: H(31),
    items: [{ sku: 'COLUMN-TROUSER', name: 'Column Trouser', qty: 1, price: 520, category: 'Tailoring' },
            { sku: 'DRAPE-SHIRT', name: 'Drape Shirt', qty: 1, price: 340, category: 'Shirting' }],
    subtotal: 860, discount: 0, total: 860,
    abandonmentReason: 'comparing options', recoveryStatus: 'abandoned', customerSegment: 'returning', recommendedAction: '10% discount, time-boxed' },
];
