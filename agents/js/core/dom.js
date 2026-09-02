/* ===========================================================
   MusfirahLoom — AI Agent Platform
   core/dom.js  ·  tiny render helpers (no framework)
=========================================================== */

/**
 * el('button', { class:'x', onClick:fn, disabled:true }, 'Label', childNode)
 * - class            -> className
 * - dataset:{k:v}    -> data-* attributes
 * - style:{k:v}      -> inline styles
 * - onEvent:fn       -> addEventListener('event', fn)
 * - html:'<b>x</b>'  -> innerHTML (use only with trusted strings)
 * - anything else    -> property if it exists, else setAttribute
 */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs || {})) {
    if (value == null || value === false) continue;

    if (key === 'class') {
      node.className = value;
    } else if (key === 'dataset' && typeof value === 'object') {
      Object.assign(node.dataset, value);
    } else if (key === 'style' && typeof value === 'object') {
      for (const [prop, v] of Object.entries(value)) {
        if (v == null) continue;
        // CSS custom properties need setProperty(); plain props take assignment
        if (prop.startsWith('--')) node.style.setProperty(prop, v);
        else node.style[prop] = v;
      }
    } else if (key === 'html') {
      node.innerHTML = value;
    } else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key in node) {
      try { node[key] = value; } catch { node.setAttribute(key, value); }
    } else {
      node.setAttribute(key, value === true ? '' : String(value));
    }
  }

  for (const child of children.flat()) {
    if (child == null || child === false) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
}

export function mount(parent, child) {
  if (parent && child) parent.append(child);
  return child;
}

export function clear(node) {
  if (node) while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function qsa(selector, root = document) {
  return [...root.querySelectorAll(selector)];
}

/** Format a number as USD, e.g. 49 -> "$49.00" */
export function money(amount) {
  const n = Number(amount) || 0;
  return `$${n.toFixed(2)}`;
}
