/* ===========================================================
   Misbah Azib — Website
   site/js/start.entry.js  ·  bootstraps start.html

   The Start-a-Project lead-qualification page. Builds the form
   from one field model, validates inline, and — since no form
   backend is connected yet — turns a completed brief into a
   ready-to-send WhatsApp / email / copyable summary. Nothing is
   stored or transmitted automatically.

   track() calls are the dormant analytics seam (site/js/track.js)
   and do nothing until a provider is wired in.
=========================================================== */
import { NAV, PROCESS } from '../data/site.content.js';
import { renderSiteHeader, renderSiteFooter, renderSkipLink, el } from './components.js';
import { track } from './track.js';
import { scoreLead, triageText } from './leadScore.js';
import { buildPayload, postLead, resolveFormConfig } from './submitLead.js';

const WHATSAPP = '923132028898';
const EMAIL = 'musfirahazib@gmail.com';
const wa = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
const mailto = (subject, body) =>
  `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

/* ---------- the field model (drives render, validation, brief) ---------- */
const GROUPS = [
  {
    legend: 'Basic information',
    fields: [
      { key: 'name', label: 'Full name', type: 'text', required: true, autocomplete: 'name' },
      { key: 'email', label: 'Email address', type: 'email', required: true, autocomplete: 'email' },
      { key: 'business', label: 'Business name', type: 'text', required: true, autocomplete: 'organization' },
      {
        key: 'link', label: 'Website or social link', type: 'text', required: false,
        placeholder: 'https://…  or  @handle',
        hint: 'Optional — whatever best shows your current presence.',
      },
    ],
  },
  {
    legend: 'Your business',
    fields: [
      {
        key: 'industry', label: 'Industry', control: 'select', required: true,
        options: ['Local & service business', 'E-commerce / product brand', 'Real estate', 'Fashion & beauty', 'Other'],
      },
      {
        key: 'bizType', label: 'Type of business', type: 'text', required: true,
        placeholder: 'e.g. dental clinic, skincare brand, buyer’s agent',
      },
      {
        key: 'challenge', label: 'Main business challenge', control: 'textarea', required: true,
        placeholder: 'What’s not working right now? What made you look for help?',
      },
    ],
  },
  {
    legend: 'What you need',
    fields: [
      {
        key: 'need', label: 'What do you need help with?', control: 'select', required: true,
        options: [
          'Business website', 'Website redesign', 'E-commerce website', 'Real estate website',
          'AI website assistant', 'Lead generation system', 'Other / not sure',
        ],
      },
    ],
  },
  {
    legend: 'Project details',
    fields: [
      {
        key: 'budget', label: 'Budget range', control: 'select', required: true,
        options: ['Under $500', '$500 – $1,500', '$1,500 – $5,000', '$5,000 – $15,000', '$15,000+'],
      },
      {
        key: 'timeline', label: 'Desired timeline', control: 'select', required: true,
        options: ['As soon as possible', '2–4 weeks', '1–3 months', 'Just exploring for now'],
      },
      {
        key: 'goal', label: 'Main business goal', control: 'textarea', required: true,
        placeholder: 'What should this project achieve? e.g. more booked calls, higher online sales.',
      },
    ],
  },
  {
    legend: 'How should Misbah reply?',
    fields: [
      {
        key: 'contact', label: 'Preferred contact', control: 'radio', required: true,
        options: ['Email', 'WhatsApp', 'Discovery call'],
      },
    ],
  },
];

const ALL_FIELDS = GROUPS.flatMap((g) => g.fields);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ---------- render one field, return { node, read, setErr, clearErr, focus } ---------- */
function buildField(f) {
  const id = `st_${f.key}`;
  const errId = `${id}_err`;
  const errEl = el('span', { class: 'st-field__err', id: errId, role: 'alert', hidden: true });

  const labelText = [
    el('span', {}, f.label),
    f.required ? el('span', { class: 'req' }, ' *') : null,
  ];

  let control;
  let read;
  let focus;

  if (f.control === 'select') {
    control = el('select', { id, name: f.key, required: f.required, 'aria-describedby': errId },
      el('option', { value: '', disabled: true, selected: true }, 'Select…'),
      ...f.options.map((o) => el('option', { value: o }, o)));
    read = () => control.value;
    focus = () => control.focus();
  } else if (f.control === 'textarea') {
    control = el('textarea', {
      id, name: f.key, required: f.required, rows: 3,
      placeholder: f.placeholder || '', 'aria-describedby': errId,
    });
    read = () => control.value.trim();
    focus = () => control.focus();
  } else if (f.control === 'radio') {
    const inputs = f.options.map((o) => el('input', {
      type: 'radio', name: f.key, value: o, required: f.required,
      onChange: () => { errEl.hidden = true; group.classList.remove('is-invalid'); },
    }));
    const group = el('div', { class: 'st-radios', role: 'radiogroup', 'aria-describedby': errId },
      ...f.options.map((o, i) => el('label', { class: 'st-radio' }, inputs[i], el('span', {}, o))));
    control = group;
    read = () => (inputs.find((x) => x.checked) || {}).value || '';
    focus = () => inputs[0].focus();
  } else {
    control = el('input', {
      id, name: f.key, type: f.type || 'text', required: f.required,
      placeholder: f.placeholder || '', autocomplete: f.autocomplete || 'off',
      'aria-describedby': errId,
    });
    read = () => control.value.trim();
    focus = () => control.focus();
  }

  if (control.addEventListener && f.control !== 'radio') {
    control.addEventListener('input', () => { errEl.hidden = true; control.classList.remove('is-invalid'); });
  }

  const node = el('div', { class: 'st-field' },
    el('label', { class: 'st-field__label', for: id }, ...labelText),
    f.hint ? el('span', { class: 'st-field__hint' }, f.hint) : null,
    control,
    errEl);

  const setErr = (msg) => {
    errEl.textContent = msg;
    errEl.hidden = false;
    if (f.control === 'radio') control.classList.add('is-invalid');
    else control.classList.add('is-invalid');
  };
  const clearErr = () => { errEl.hidden = true; control.classList.remove('is-invalid'); };

  return { node, read, setErr, clearErr, focus };
}

/* ---------- build the whole form ---------- */
function buildForm(onDone) {
  const reg = {};
  const groupNodes = GROUPS.map((g) => {
    const fieldNodes = g.fields.map((f) => {
      const built = buildField(f);
      reg[f.key] = built;
      return built.node;
    });
    return el('fieldset', { class: 'st-group' },
      el('legend', { class: 'st-group__legend' }, g.legend),
      ...fieldNodes);
  });

  const consent = el('input', { type: 'checkbox', id: 'st_consent', required: true });
  const consentRow = el('label', { class: 'st-consent', for: 'st_consent' },
    consent,
    el('span', {}, 'I agree to be contacted about this enquiry. Your details are only used to reply — no list, no spam.'));

  const formErr = el('p', { class: 'st-form__err', role: 'alert', hidden: true });
  const submit = el('button', { type: 'submit', class: 'btn btn-solid st-form__submit' }, 'Review my brief');

  const form = el('form', { class: 'st-form', novalidate: true, id: 'startForm' },
    ...groupNodes,
    el('div', { class: 'st-group' }, consentRow),
    formErr,
    submit,
    el('p', { class: 'st-form__fine' },
      'Your details are used only to reply to this enquiry — no list, no spam. '
      + 'On the next screen you can also send the brief through WhatsApp or email.'));

  let started = false;
  let busy = false;
  form.addEventListener('input', () => {
    if (!started) { started = true; track('form_start', {}); }
  }, { once: false });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;
    formErr.hidden = true;
    let firstBad = null;

    ALL_FIELDS.forEach((f) => {
      const r = reg[f.key];
      r.clearErr();
      const val = r.read();
      let msg = '';
      if (f.required && !val) msg = f.control === 'radio' ? 'Pick one' : 'Required';
      else if (f.key === 'email' && val && !EMAIL_RE.test(val)) msg = 'Enter a valid email address';
      if (msg) { r.setErr(msg); firstBad = firstBad || r; }
    });

    if (!consent.checked) {
      formErr.textContent = 'Please tick the consent box so I can reply to you.';
      formErr.hidden = false;
      firstBad = firstBad || { focus: () => consent.focus() };
    }

    if (firstBad) { firstBad.focus(); return; }

    const values = {};
    ALL_FIELDS.forEach((f) => { values[f.key] = reg[f.key].read(); });

    // Transparent lead triage (site/js/leadScore.js). Internal only:
    // never shown to the visitor and never added to the brief they
    // send by hand. It travels in the webhook payload (below) and,
    // until a webhook is configured, prints to the console.
    const triage = scoreLead(values);
    if (typeof console !== 'undefined' && console.info) {
      console.info(`[start] lead triage — ${triage.bandEmoji} ${triage.bandLabel}\n${triageText(triage)}`);
    }

    // Submit to the n8n webhook if one is configured in site/js/site.config.js.
    // No URL -> { status: 'disabled' } and we fall back to the WhatsApp /
    // email / copy handoff below (which is always offered regardless).
    busy = true;
    submit.disabled = true;
    submit.textContent = 'Sending…';

    const formCfg = resolveFormConfig();
    const payload = buildPayload(values, triage, {
      now: new Date().toISOString(),
      page: (typeof location !== 'undefined' && location.href) || null,
    });
    const sendResult = await postLead(payload, {
      url: formCfg.WEBHOOK_URL || '',
      timeoutMs: formCfg.TIMEOUT_MS || 8000,
    });

    track('form_submit', {
      industry: values.industry, need: values.need,
      budget: values.budget, timeline: values.timeline, contact: values.contact,
      band: triage.band, score: triage.score, sent: sendResult.status,
    });

    onDone(values, sendResult);
  });

  return form;
}

/* ---------- the completed brief ---------- */
function briefText(v) {
  const row = (k, val) => `${(k + ':').padEnd(12)} ${val || '—'}`;
  return [
    'PROJECT BRIEF — via musfirahloom.com',
    '',
    row('Name', v.name),
    row('Email', v.email),
    row('Business', v.business),
    row('Link', v.link),
    '',
    row('Industry', v.industry),
    row('Type', v.bizType),
    row('Challenge', v.challenge),
    '',
    row('Need', v.need),
    row('Budget', v.budget),
    row('Timeline', v.timeline),
    row('Goal', v.goal),
    '',
    row('Reply via', v.contact),
  ].join('\n');
}

function renderDone(v, sendResult = {}) {
  const brief = briefText(v);
  const firstName = (v.name || '').trim().split(/\s+/)[0] || 'there';
  const subject = `Project brief — ${v.business || 'new enquiry'}`;
  const wasSent = sendResult.status === 'sent';
  const sendFailed = sendResult.status === 'failed';

  const waLink = el('a', {
    class: 'btn btn-solid', href: wa(brief), target: '_blank', rel: 'noopener',
    onClick: () => track('whatsapp_click', { from: 'confirm' }),
  }, 'Send on WhatsApp →');
  const mailLink = el('a', {
    class: 'btn btn-outline', href: mailto(subject, brief),
    onClick: () => track('email_click', { from: 'confirm' }),
  }, 'Send by email');
  const bookLink = el('a', {
    class: 'btn btn-solid', href: `tel:+${WHATSAPP}`, 'data-book': 'pending-scheduler',
    onClick: () => track('book_click', { from: 'confirm' }),
  }, 'Call to book a time');

  const copyBtn = el('button', { type: 'button', class: 'btn btn-outline' }, 'Copy the brief');
  const copyNote = el('span', { class: 'st-copy-note', hidden: true }, 'Copied ✓');
  copyBtn.addEventListener('click', async () => {
    track('copy_click', {});
    try {
      await navigator.clipboard.writeText(brief);
      copyNote.hidden = false;
      copyBtn.textContent = 'Copied';
    } catch {
      copyNote.textContent = 'Select the text above and copy it (Ctrl/Cmd + C).';
      copyNote.hidden = false;
    }
  });

  let actions;
  if (v.contact === 'WhatsApp') actions = [waLink, mailLink, copyBtn];
  else if (v.contact === 'Discovery call') actions = [bookLink, waLink, mailLink, copyBtn];
  else actions = [mailLink, waLink, copyBtn];

  const heading = el('h2', { tabindex: '-1' },
    wasSent
      ? `Thanks, ${firstName} — your brief is on its way.`
      : `Thanks, ${firstName} — your brief is ready.`);

  let note;
  if (wasSent) {
    note = v.contact === 'Discovery call'
      ? 'Your brief has been sent to Misbah — he’ll reply within one business day to set up the call. You can also reach him directly below.'
      : 'Your brief has been sent to Misbah — he’ll reply within one business day. Prefer to reach him directly? Use a button below.';
  } else if (v.contact === 'Discovery call') {
    note = 'You picked a discovery call. The button below dials Misbah directly for now — a self-scheduling link will replace it shortly. Send the brief first so he has context.';
  } else {
    note = 'Send the brief below through your preferred channel and Misbah will reply within one business day.';
  }
  if (sendFailed) {
    note += ' (The site couldn’t send it automatically just now — please use a button below.)';
  }

  const panel = el('div', { class: 'st-done' },
    el('span', { class: 'eyebrow' }, 'Brief ready'),
    heading,
    el('p', {}, note),
    el('div', { class: 'st-brief' }, brief),
    el('div', { class: 'st-done__actions' }, ...actions),
    copyNote,
    el('p', { class: 'st-form__fine' },
      'Changed your mind about something? ',
      el('a', { href: 'start.html', style: { color: 'var(--accent)', fontWeight: '600' } }, 'Start over'),
      '.'));

  requestAnimationFrame(() => heading.focus());
  return panel;
}

/* ---------- page assembly ---------- */
const root = document.getElementById('siteRoot');
root.replaceChildren();
root.append(renderSkipLink());
root.append(renderSiteHeader(NAV('', '')));

const main = el('main', { id: 'main', tabindex: '-1' });

const rail = el('aside', { class: 'st-rail' });
if (Array.isArray(PROCESS) && PROCESS.length) {
  rail.append(
    el('h2', {}, 'How it works'),
    el('ol', { class: 'st-steps' },
      ...PROCESS.map((s) => el('li', { class: 'st-step' },
        el('span', { class: 'st-step__no' }, s.no),
        el('div', { class: 'st-step__body' },
          el('strong', {}, s.name),
          el('span', {}, s.blurb))))),
  );
}
rail.append(
  el('h2', {}, 'Good to know'),
  el('ul', { class: 'st-assure' },
    el('li', {}, 'A fixed quote after one short call — no surprise invoices.'),
    el('li', {}, 'You own the site, the code and the accounts at the end.'),
    el('li', {}, 'The portfolio pieces are concept demos, shown as demos — never passed off as client work.'),
    el('li', {}, 'Your details are only used to reply to this enquiry.')),
  el('p', { class: 'st-alt' },
    'Prefer to just message? ',
    el('a', {
      href: wa('Hi Misbah, I have a project in mind.'), target: '_blank', rel: 'noopener',
      onClick: () => track('whatsapp_click', { from: 'rail' }),
    }, 'WhatsApp'),
    ' or ',
    el('a', { href: `mailto:${EMAIL}`, onClick: () => track('email_click', { from: 'rail' }) }, 'email'),
    '.'),
);

const formHost = el('div', { class: 'st-formhost' });
formHost.append(buildForm((values, sendResult) => {
  formHost.replaceChildren(renderDone(values, sendResult));
}));

main.append(el('div', { class: 'site-wrap st-page' },
  el('div', { class: 'st-head' },
    el('span', { class: 'eyebrow' }, 'Start a project'),
    el('h1', {}, 'Tell me about your project. ', el('em', {}, 'Get a fixed quote.')),
    el('p', {},
      'A few focused questions so the first call is useful. It takes about two minutes, '
      + 'and there is no obligation — you get a clear scope and price, then decide.')),
  el('div', { class: 'st-layout' }, rail, formHost)));

root.append(main);
root.append(renderSiteFooter(''));

track('start_view', {});
