/* ===========================================================
   MusfirahLoom — AI Sales Funnel System
   components/LeadForm.js  ·  STEP 5 — lead capture

   Config-driven form. Fields, labels, required flags, consent
   text and submit label all come from config.leadForm. Handles
   inline validation, a loading state on submit, and an error
   state if capture fails. On success it calls onSubmit(values).
=========================================================== */
import { el } from '../../../agents/js/core/dom.js';

export function renderLeadForm(cfg, { onSubmit } = {}) {
  const lf = cfg.leadForm;
  const fields = lf.fields || [];
  const inputs = {};
  let busy = false;

  const errBox = el('p', { class: 'fn-form__err', role: 'alert', hidden: true });

  const fieldEls = fields.map((f) => {
    const id = `lf_${f.key}`;
    const input = el('input', {
      id, name: f.key, type: f.type || 'text',
      class: 'fn-form__input',
      placeholder: f.placeholder || '',
      required: Boolean(f.required),
      autocomplete: f.key === 'name' ? 'name' : f.key === 'email' ? 'email' : f.key === 'phone' ? 'tel' : 'off',
    });
    inputs[f.key] = input;
    const fieldErr = el('span', { class: 'fn-form__fielderr', hidden: true });
    input.addEventListener('input', () => { fieldErr.hidden = true; input.classList.remove('is-invalid'); });
    return el('label', { class: 'fn-form__field', for: id },
      el('span', { class: 'fn-form__label' }, f.label + (f.required ? ' *' : '')),
      input, fieldErr);
  });

  const consent = el('input', { id: 'lf_consent', type: 'checkbox', class: 'fn-form__check', required: true });
  const consentRow = el('label', { class: 'fn-form__consent', for: 'lf_consent' },
    consent, el('span', {}, lf.consentText || 'I agree to be contacted about my enquiry.'));

  const submit = el('button', { type: 'submit', class: 'btn btn-solid fn-form__submit' }, lf.submitLabel || 'Submit');

  const form = el('form', { class: 'fn-form', novalidate: true },
    el('div', { class: 'fn-form__head' },
      el('h3', {}, lf.heading || 'Get started'),
      lf.sub ? el('p', {}, lf.sub) : null),
    ...fieldEls,
    consentRow,
    errBox,
    submit,
    el('p', { class: 'fn-form__fine' }, 'Demo Mode — submissions are stored locally in your browser only.'));

  function setBusy(v) {
    busy = v;
    submit.disabled = v;
    submit.textContent = v ? 'Matching…' : (lf.submitLabel || 'Submit');
  }

  function validate() {
    let ok = true;
    fields.forEach((f) => {
      const input = inputs[f.key];
      const val = input.value.trim();
      const errSpan = input.nextElementSibling;
      let msg = '';
      if (f.required && !val) msg = 'Required';
      else if (f.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) msg = 'Enter a valid email';
      else if (f.type === 'tel' && val && val.replace(/\D/g, '').length < 6) msg = 'Enter a valid number';
      if (msg) {
        ok = false;
        errSpan.textContent = msg;
        errSpan.hidden = false;
        input.classList.add('is-invalid');
      }
    });
    if (!consent.checked) { ok = false; errBox.textContent = 'Please tick the consent box to continue.'; errBox.hidden = false; }
    return ok;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;
    errBox.hidden = true;
    if (!validate()) return;
    setBusy(true);
    const values = {};
    fields.forEach((f) => { values[f.key] = inputs[f.key].value.trim(); });
    try {
      await onSubmit?.(values);
    } catch (err) {
      console.error('[LeadForm] submit failed', err);
      errBox.textContent = 'Something went wrong saving that. Please try again.';
      errBox.hidden = false;
      setBusy(false);
    }
  });

  return { el: form, focus: () => inputs[fields[0]?.key]?.focus(), setBusy };
}
