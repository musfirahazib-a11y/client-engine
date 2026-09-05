/* ===========================================================
   MusfirahLoom — Client Document System
   doc.js  ·  shared behaviour for every document

   - Fills "Page X / Y" on every .doc-page (from the page count)
   - "Print / Save as PDF" button  -> window.print()
   - Keeps single-line editable fields single-line (blocks Enter)
   - Invoice only: live line-item + tax + total maths
   No framework, no build.
=========================================================== */
(function () {
  'use strict';

  /* ---------- page numbering ---------- */
  function renumber(doc) {
    var pages = doc.querySelectorAll('.doc-page');
    for (var i = 0; i < pages.length; i++) {
      var n = i + 1;
      pages[i].querySelectorAll('.pg-num').forEach(function (e) { e.textContent = n; });
      pages[i].querySelectorAll('.pg-total').forEach(function (e) { e.textContent = pages.length; });
    }
  }
  document.querySelectorAll('.doc').forEach(renumber);
  // expose for when you add/remove .doc-page blocks while editing
  window.renumberPages = function () { document.querySelectorAll('.doc').forEach(renumber); };

  /* ---------- print / save as PDF ---------- */
  document.querySelectorAll('[data-print]').forEach(function (btn) {
    btn.addEventListener('click', function (e) { e.preventDefault(); window.print(); });
  });

  /* ---------- keep single-line fields single-line ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var el = e.target;
    if (el && el.classList && el.classList.contains('fld') && !el.classList.contains('fld--multi')) {
      e.preventDefault();
      el.blur();
    }
  });

  /* ---------- invoice maths (no-ops on other documents) ---------- */
  var invoice = document.querySelector('[data-invoice]');
  if (invoice) {
    var num = function (s) { return parseFloat(String(s == null ? '' : s).replace(/[^0-9.\-]/g, '')) || 0; };
    var money = function (n) {
      return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };
    var text = function (sel) { var e = invoice.querySelector(sel); return e ? e.textContent : ''; };
    var set = function (sel, v) {
      invoice.querySelectorAll(sel).forEach(function (e) { e.textContent = v; });
    };

    function recalc() {
      var cur = text('[data-currency]').trim();
      var sub = 0;
      invoice.querySelectorAll('[data-line]').forEach(function (row) {
        var q = num(row.querySelector('[data-qty]') && row.querySelector('[data-qty]').textContent);
        var rate = num(row.querySelector('[data-rate]') && row.querySelector('[data-rate]').textContent);
        var amt = q * rate;
        sub += amt;
        var cell = row.querySelector('[data-amount]');
        if (cell) cell.textContent = cur + money(amt);
      });
      var taxRate = num(text('[data-taxrate]'));
      var tax = sub * taxRate / 100;
      var paid = num(text('[data-paid]'));
      set('[data-subtotal]', cur + money(sub));
      set('[data-tax]', cur + money(tax));
      set('[data-total]', cur + money(sub + tax));
      set('[data-due]', cur + money(Math.max(0, sub + tax - paid)));
    }

    invoice.addEventListener('input', function (e) {
      if (e.target.closest('[data-line]') ||
          e.target.matches('[data-taxrate],[data-currency],[data-paid]')) recalc();
    });
    recalc();
  }
})();
