/* ===========================================================
   MusfirahLoom — AI Agent Platform
   components/ChatWindow.js

   ONE reusable chat interface, shared by every agent. It owns
   only presentation + input state. It never decides what the
   agent says — that comes back through the onSend() callback.

   mountChatWindow(container, {
     agent,                     // registry entry (for title / samples)
     onSend(text): Promise,     // caller resolves after pushing reply
     onReset(): void,           // caller clears demo state
     maxChars,                  // composer hard limit
   }) -> {
     addMessage(msg) -> node,
     setStatus('idle' | 'thinking'),
     setQuickReplies([...]),
     showError(text),
     clearTranscript(),
     focusInput(),
   }
=========================================================== */
import { el, clear } from '../core/dom.js';
import { renderMessage } from './MessageBubble.js';

export function mountChatWindow(container, opts = {}) {
  const {
    agent,
    onSend,
    onReset,
    maxChars = 800,
  } = opts;

  let messageCount = 0;
  let busy = false;

  /* ---------- structure ---------- */
  const log = el('div', {
    class: 'ml-chat__log',
    id: 'mlChatLog',
    role: 'log',
    'aria-live': 'polite',
    'aria-relevant': 'additions text',
    'aria-label': `Conversation with the ${agent?.short || 'demo'} agent`,
  });

  const typing = el('div', {
    class: 'ml-chat__typing',
    hidden: true,
    'aria-live': 'polite',
  },
    el('span', { class: 'ml-chat__dots', 'aria-hidden': 'true' },
      el('i', {}), el('i', {}), el('i', {})),
    el('span', {}, 'Agent is typing…'),
  );

  const quick = el('div', { class: 'ml-chat__quick', 'aria-label': 'Suggested replies' });

  const input = el('textarea', {
    class: 'ml-chat__input',
    id: 'mlChatInput',
    rows: 1,
    placeholder: 'Type a message…',
    maxlength: String(maxChars),
    'aria-describedby': 'mlChatCount',
  });

  const count = el('span', { class: 'ml-chat__count', id: 'mlChatCount' }, `0 / ${maxChars}`);

  const sendBtn = el('button', {
    type: 'submit',
    class: 'btn btn-solid ml-chat__send',
    disabled: true,
  }, 'Send');

  const form = el('form', { class: 'ml-chat__form' },
    el('label', { class: 'ml-visually-hidden', for: 'mlChatInput' }, 'Message the agent'),
    input,
    el('div', { class: 'ml-chat__formfoot' }, count, sendBtn),
  );

  const resetBtn = el('button', {
    type: 'button',
    class: 'ml-chat__reset',
    onClick: () => doReset(),
  }, '↺ Reset demo');

  const head = el('div', { class: 'ml-chat__head' },
    el('span', { class: 'ml-chat__title' }, agent?.short || 'Demo agent'),
    el('span', { class: 'ml-chat__head-right' },
      el('span', { class: 'ml-badge' }, 'Demo Mode'),
      resetBtn,
    ),
  );

  const shell = el('section', { class: 'ml-chat', 'aria-label': 'Agent demo chat' },
    head, log, typing, quick, form);

  clear(container).append(shell);

  /* ---------- empty state ---------- */
  function renderEmptyState() {
    const chips = el('div', { class: 'ml-chat__samples' });
    (agent?.sampleQuestions || []).forEach((q) => {
      chips.append(el('button', {
        type: 'button',
        class: 'ml-chat__chip',
        onClick: () => submitText(q),
      }, q));
    });

    log.append(el('div', { class: 'ml-chat__empty' },
      el('span', { class: 'ml-chat__empty-icon', 'aria-hidden': 'true' }, agent?.icon || '◆'),
      el('p', { class: 'ml-chat__empty-title' }, `Start the conversation`),
      el('p', { class: 'ml-chat__empty-sub' },
        `This is a simulated demo — try one of these, or type your own.`),
      chips,
    ));
  }
  renderEmptyState();

  /* ---------- helpers ---------- */
  function scrollToEnd() {
    log.scrollTop = log.scrollHeight;
  }

  function clearEmptyState() {
    const empty = log.querySelector('.ml-chat__empty');
    if (empty) empty.remove();
  }

  function setQuickReplies(replies = []) {
    clear(quick);
    (replies || []).forEach((label) => {
      quick.append(el('button', {
        type: 'button',
        class: 'ml-chat__chip',
        onClick: () => submitText(label),
      }, label));
    });
  }

  function addMessage(msg) {
    clearEmptyState();
    const node = renderMessage(msg);
    log.append(node);
    messageCount += 1;
    if (msg.role === 'agent' && Array.isArray(msg.quickReplies)) {
      setQuickReplies(msg.quickReplies);
    } else if (msg.role === 'user') {
      setQuickReplies([]);
    }
    scrollToEnd();
    return node;
  }

  function setStatus(status) {
    busy = status === 'thinking';
    typing.hidden = !busy;
    input.disabled = busy;
    updateSendState();
    if (busy) scrollToEnd();
  }

  function showError(text) {
    clearEmptyState();
    const box = el('div', { class: 'ml-chat__error', role: 'alert' },
      el('span', {}, text || 'Something went wrong in the demo.'),
      el('button', {
        type: 'button',
        class: 'btn btn-outline',
        onClick: () => { box.remove(); focusInput(); },
      }, 'Dismiss'),
    );
    log.append(box);
    setStatus('idle');
    scrollToEnd();
  }

  function clearTranscript() {
    clear(log);
    clear(quick);
    messageCount = 0;
    renderEmptyState();
  }

  function focusInput() {
    input.focus();
  }

  async function submitText(raw) {
    const text = String(raw || '').trim();
    if (!text || busy) return;
    if (text.length > maxChars) return;

    input.value = '';
    autoGrow();
    updateCount();
    addMessage({ role: 'user', text, ts: Date.now() });

    setStatus('thinking');
    try {
      await onSend?.(text);
    } catch (err) {
      console.error('[ChatWindow] onSend failed', err);
      showError('The demo agent hit an unexpected snag. Try again.');
      return;
    }
    setStatus('idle');
    focusInput();
  }

  function doReset() {
    onReset?.();
    clearTranscript();
    focusInput();
  }

  /* ---------- composer wiring ---------- */
  function updateCount() {
    const n = input.value.length;
    count.textContent = `${n} / ${maxChars}`;
    count.classList.toggle('is-over', n >= maxChars);
  }
  function updateSendState() {
    const n = input.value.trim().length;
    sendBtn.disabled = busy || n === 0 || n > maxChars;
  }
  function autoGrow() {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 140)}px`;
  }

  input.addEventListener('input', () => {
    updateCount();
    updateSendState();
    autoGrow();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitText(input.value);
    }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitText(input.value);
  });

  return {
    addMessage,
    setStatus,
    setQuickReplies,
    showError,
    clearTranscript,
    focusInput,
    /* drive the chat exactly as if the user typed `text`
       (used by in-message card buttons) */
    send: submitText,
  };
}
