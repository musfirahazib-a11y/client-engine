/* ===========================================================
   MusfirahLoom — AI Sales Funnel System
   components/console/config.js  ·  STEP 16 — configuration panel

   Edits the live funnel configuration. Simple scalar fields get
   proper inputs; the structured collections (listings, offers,
   qualification questions, follow-up sequence, AI instructions)
   are edited as validated JSON so the full schema stays
   editable without a hundred bespoke widgets.

   Save persists via funnelConfig.setConfig() (only the diff
   against the shipped defaults is stored). Reset restores
   defaults.
=========================================================== */
import { el, clear } from '../../../../agents/js/core/dom.js';
import { getConfig, setConfig, resetConfig } from '../../services/funnelConfig.js';
import { head, empty } from './ui.js';

export function render(mount) {
  let draft = clone(getConfig());
  const status = el('p', { class: 'fc-note', 'aria-live': 'polite' }, '');

  mount.append(head(
    'Configuration',
    'Retarget the funnel for any niche — business, branding, catalog, offers, AI rules, qualification and follow-up.',
    el('button', { type: 'button', class: 'btn btn-solid', onClick: save }, 'Save changes'),
    el('button', {
      type: 'button', class: 'btn btn-outline',
      onClick: () => { if (confirm('Restore the shipped default configuration?')) { resetConfig(); draft = clone(getConfig()); paint(); flash('Defaults restored.'); } },
    }, 'Reset to defaults'),
  ));
  mount.append(status);

  const body = el('div', { class: 'fc-config' });
  mount.append(body);
  paint();

  function paint() {
    clear(body);

    body.append(group('Business', [
      text('business.name', 'Business name'),
      text('business.logoText', 'Short logo text'),
      text('business.tagline', 'Tagline'),
      text('business.email', 'Email'),
      text('business.phone', 'Phone'),
      text('business.whatsapp', 'WhatsApp number (digits only)'),
      text('business.address', 'Address'),
      area('business.description', 'Description', 2),
    ]));

    body.append(group('Branding & SEO', [
      color('branding.primary', 'Primary colour'),
      color('branding.secondary', 'Secondary colour'),
      text('seo.title', 'SEO title'),
      area('seo.description', 'Meta description', 2),
    ]));

    body.append(group('Niche', [
      text('meta.niche', 'Niche label'),
      bool('meta.demo', 'Demo data available in the console'),
    ]));

    body.append(jsonGroup('Landing page copy', 'landing'));
    body.append(jsonGroup('FAQs', 'faqs'));
    body.append(jsonGroup('Listings / products', 'listings'));
    body.append(jsonGroup('Offers', 'offers'));
    body.append(jsonGroup('Qualification (questions, weights, thresholds)', 'qualification'));
    body.append(jsonGroup('AI sales assistant (name, role, tone, instructions)', 'ai'));
    body.append(jsonGroup('Conversion paths', 'conversion'));
    body.append(jsonGroup('Lead capture form', 'leadForm'));
    body.append(jsonGroup('Follow-up sequence', 'followup'));
    body.append(jsonGroup('Integrations (existing agent ids)', 'integrations'));
  }

  /* ---------- field builders ---------- */
  function fieldRow(label, control) {
    return el('label', { class: 'fc-field' }, el('span', {}, label), control);
  }
  function text(path, label) {
    const i = el('input', { class: 'fc-input', type: 'text', value: get(draft, path) ?? '' });
    i.addEventListener('input', () => set(draft, path, i.value));
    return fieldRow(label, i);
  }
  function area(path, label, rows) {
    const t = el('textarea', { class: 'fc-input', rows: String(rows || 3) }, get(draft, path) ?? '');
    t.addEventListener('input', () => set(draft, path, t.value));
    return fieldRow(label, t);
  }
  function color(path, label) {
    const val = get(draft, path) || '#2F5D62';
    const i = el('input', { class: 'fc-input fc-input--color', type: 'color', value: val });
    const hex = el('input', { class: 'fc-input', type: 'text', value: val });
    const sync = (v) => { set(draft, path, v); i.value = v; hex.value = v; };
    i.addEventListener('input', () => sync(i.value));
    hex.addEventListener('input', () => { if (/^#[0-9a-f]{6}$/i.test(hex.value)) sync(hex.value); });
    return fieldRow(label, el('span', { class: 'fc-colorpair' }, i, hex));
  }
  function bool(path, label) {
    const i = el('input', { type: 'checkbox', class: 'fc-check' });
    i.checked = Boolean(get(draft, path));
    i.addEventListener('change', () => set(draft, path, i.checked));
    return el('label', { class: 'fc-field fc-field--inline' }, i, el('span', {}, label));
  }
  function group(title, fields) {
    return el('section', { class: 'fc-config__group' }, el('h3', {}, title), ...fields);
  }
  function jsonGroup(title, key) {
    const ta = el('textarea', { class: 'fc-input fc-json', rows: '8', spellcheck: 'false' }, JSON.stringify(get(draft, key), null, 2));
    const err = el('span', { class: 'fc-field__err', hidden: true });
    ta.addEventListener('input', () => {
      try { set(draft, key, JSON.parse(ta.value)); err.hidden = true; ta.classList.remove('is-invalid'); }
      catch { err.textContent = 'Invalid JSON — not applied'; err.hidden = false; ta.classList.add('is-invalid'); }
    });
    return el('section', { class: 'fc-config__group' },
      el('h3', {}, title),
      el('label', { class: 'fc-field' }, el('span', {}, 'Edit as JSON'), ta, err));
  }

  function save() {
    // re-validate all JSON textareas by attempting a full serialise
    try {
      setConfig(clone(draft));
      flash('Saved. The public funnel and this console now use the new configuration.');
    } catch (e) {
      flash('Could not save — check the JSON blocks for errors.');
    }
  }
  function flash(msg) { status.textContent = msg; }
}

/* ---------- nested path helpers ---------- */
function get(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}
function set(obj, path, val) {
  const keys = path.split('.');
  const last = keys.pop();
  const target = keys.reduce((o, k) => (o[k] = o[k] || {}), obj);
  target[last] = val;
}
function clone(o) { return JSON.parse(JSON.stringify(o)); }
