# Misbah Azib — Portfolio Site

Plain HTML/CSS/JS, no framework, no build step. Works on any standard shared hosting — just upload the whole folder.

## Files

```
index.html          Portfolio home page
style.css            Portfolio styles (shared design tokens + .btn)
script.js            Scroll reveal + sticky nav + mobile menu
assets/images/       Portrait cutout + all project screenshots

agents.html          AI Agent Platform hub  (see agents/README.md)
agent.html           Shared agent shell — agent.html?id=<id>
agents/              5 commercial AI agents (Demo Mode, no build)

funnel.html          AI Sales Funnel System — public funnel  (see funnel/README.md)
funnel-admin.html    AI Sales Funnel System — business console (CRM / analytics / config)
funnel/              The funnel module (config-driven, niche-independent)
```

The `agents/` and `funnel/` pages use `<script type="module">`, so preview them
over HTTP (`node .claude/devserver.js`, then `http://localhost:8000/…`). The
portfolio `index.html` still opens fine from `file://`.

## To preview locally

Just open `index.html` directly in a browser — no server needed.
(If images don't load due to browser file:// restrictions, run `python3 -m http.server` from this folder and visit `http://localhost:8000`.)

## To edit content

- **Hero tagline / bio**: edit the text inside `.hero-foot` in `index.html`.
- **Stats / traits**: edit `.stat-card` and `.trait-card` blocks in the hero.
- **Project case studies**: each project is a `<section class="project">` block — swap images in `assets/images/`, update the label/title/description text.
- **Services & pricing**: `.service-grid` in the Services section. No prices are shown currently — add a price line inside `.s-card` if you want to display one.
- **Contact links**: WhatsApp/email/Instagram links are in the Services CTAs and the final `#contact` section — update the phone number / email if they change.

## Notes

- 9 selected project screenshots (3 per project, the strongest from each) were re-cropped from your original browser screenshots — browser chrome, the Windows taskbar, the "Activate Windows" watermark, and the floating extension icon are fully cropped out (not blurred), so there are no visible editing artifacts.
- Projects are labeled honestly as "Concept Website" — no fake client names or stats are used anywhere.
- No pricing is shown for services since real numbers weren't provided — swap in real prices any time.
- A floating "Book a Call" note is fixed to the bottom-right corner of every page and links to `tel:+923132028898`. To change the number, edit the `.sticky-call` block near the top of `index.html`.
- Your LinkedIn (`linkedin.com/in/misbahazib`) is now included alongside email/Instagram in the final Contact section.
