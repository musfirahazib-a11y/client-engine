# Client Document System — MusfirahLoom

Five print-ready client documents on one shared design system, built from the
musfirahloom.com brand (Bricolage Grotesque / Inter / IBM Plex Mono, muted-purple
accent). Plain HTML/CSS/JS — no build, no dependencies.

| File | Document | Pages | Purpose |
|---|---|---|---|
| `brochure.html` | **Service Brochure** | 4 | Send to a prospect. What you build, how an engagement works, engagement models. |
| `questionnaire.html` | **Discovery Questionnaire** | 3 | Send before scoping. Client fills the answer boxes on screen or on paper. |
| `proposal.html` | **Project Proposal** | 4 | One per opportunity. Scope, deliverables, timeline, fee, sign-off. |
| `agreement.html` | **Service Agreement** | 4 | Legal terms accompanying a proposal. **Template — have a lawyer review it.** |
| `invoice.html` | **Invoice** | 1 | One per invoice. Line items + tax + paid → totals calculate automatically. |

Shared: `doc-system.css` (design system + A4 print) · `doc.js` (page numbers, print button, invoice maths).

## How to use one

1. **Duplicate** the file, named for the client:
   `proposal.html` → `proposal-acme-2026-06.html` (keep it in this folder so
   `doc-system.css` / `doc.js` still resolve).
2. **Open it in a browser** (double-click, or serve the folder). A dark control bar
   appears at the top — it never prints.
3. **Edit the highlighted fields.** Every lavender-highlighted span or box is
   editable in place. Empty fields show a `[ prompt ]`; unfilled ones stay visible in
   the PDF so nothing is missed. Single-line fields end on Enter; boxes marked as
   multi-line accept paragraphs.
4. **Print → Save as PDF.** Click *Print / Save as PDF* (or Ctrl/Cmd + P). In the
   print dialog:
   - **Destination:** Save as PDF
   - **Paper size:** A4
   - **Margins:** None (the document sets its own 17 × 19 mm margin)
   - **Headers and footers:** Off (so only the document's own footer shows)
   - **Background graphics:** On (keeps the lavender callout boxes and tags)
5. Send the **PDF**, not the HTML.

## Notes

- **Page numbering** is filled from the number of page blocks (`doc.js`). Each grey
  page on screen = one A4 page in the PDF.
- **If content overflows a page** (you'll see it cross the page edge on screen),
  either trim it or copy a `<section class="doc-page">…</section>` block to add a
  page — numbers renumber automatically on reload, or call `renumberPages()` in the
  console.
- **Invoice maths:** edit *Qty*, *Rate*, *Tax %*, *Currency* and *Amount paid* — the
  amount, subtotal, tax, total and balance update live. Delete `<tr data-line>` rows
  you don't need.
- **Currency:** type the symbol into the *Currency* field with a trailing space where
  you want one (`$`, `£`, `PKR `).

## Evidence-based content

The brochure describes capabilities and process only. It states plainly that no
specific business outcome (revenue, conversion, traffic, ranking) is guaranteed. The
proposal records client figures as *targets*. The agreement contains an explicit
**no-outcome-guarantee** warranty clause and an "as is" disclaimer for AI/third-party
behaviour. No clients, revenue, certifications, awards, employment history or
performance metrics are asserted anywhere — keep it that way when you customise.

## Legal

`agreement.html` is a **starting template, not legal advice.** Have it reviewed and
adapted for your jurisdiction before use. Fill the governing-law, notice-period and
liability-cap fields.
