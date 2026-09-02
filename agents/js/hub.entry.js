/* ===========================================================
   MusfirahLoom — AI Agent Platform
   hub.entry.js  ·  bootstraps agents.html
=========================================================== */
import { AGENTS } from './config/agents.config.js';
import { RUNTIME } from './config/runtime.config.js';
import { renderAgentGrid } from './components/AgentGrid.js';

/* ---- render the agent grid from the registry ---- */
const grid = document.getElementById('agentGrid');
renderAgentGrid(grid, AGENTS);

/* ---- stamp build version anywhere it's requested ---- */
document.querySelectorAll('[data-runtime-version]').forEach((el) => {
  el.textContent = RUNTIME.VERSION;
});

/* ---- reveal-on-scroll (self-contained; does not touch the
       portfolio's own .reveal / script.js) ---- */
const revealEls = document.querySelectorAll('.ml-reveal');
if ('IntersectionObserver' in window && revealEls.length) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-in'));
}
