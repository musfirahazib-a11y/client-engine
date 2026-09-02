/* ===========================================================
   MusfirahLoom — AI Agent Platform
   repositories/cartRepo.js

   Simulated cart, persisted to localStorage so a demo visibly
   accumulates items and survives a page reload. Emits
   'cart:change' on the shared bus after every mutation.

   Phase 2: swap the read/write bodies for calls to the real
   store's cart/checkout API.
=========================================================== */
import { bus } from '../core/events.js';

const KEY = 'ml.agents.cart';

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function write(items) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* private mode / quota — ignore, in-memory result still returned */
  }
  bus.emit('cart:change', summary(items));
  return items;
}

function summary(items = read()) {
  const count = items.reduce((n, i) => n + (i.qty || 0), 0);
  const total = items.reduce((s, i) => s + (i.price || 0) * (i.qty || 0), 0);
  return { items, count, total };
}

export function getCart() {
  return read();
}

export function getSummary() {
  return summary();
}

export function addToCart(product, qty = 1) {
  if (!product || !product.id) return summary();
  const items = read();
  const existing = items.find((i) => i.id === product.id);
  if (existing) {
    existing.qty += qty;
  } else {
    items.push({
      id: product.id,
      title: product.title,
      price: product.price,
      category: product.category,
      qty,
    });
  }
  write(items);
  return summary(items);
}

export function removeFromCart(id) {
  const items = read().filter((i) => i.id !== id);
  write(items);
  return summary(items);
}

export function clearCart() {
  write([]);
  return summary([]);
}
