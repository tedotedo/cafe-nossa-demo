/* ==========================================================================
   Cafe Nossa — Concept B Interactions
   Horizontal Showcase Rail, Menu Filter, Tap-Counter Box Composer & Pre-Order Form
   ========================================================================== */

(function () {
  'use strict';

  /* 1. Horizontal Touch-Snap Showcase Controls */
  var snapRail = document.getElementById('showcase-rail');
  var snapBtns = document.querySelectorAll('[data-snap-dir]');
  if (snapRail && snapBtns.length) {
    snapBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var dir = parseInt(btn.getAttribute('data-snap-dir'), 10) || 1;
        var card = snapRail.querySelector('.snap-card');
        var step = card ? card.getBoundingClientRect().width + 16 : 300;
        snapRail.scrollBy({ left: dir * step, behavior: 'smooth' });
      });
    });
  }

  /* 2. Sunlit Cream Menu Category Filter */
  var filterChips = document.querySelectorAll('[data-filter]');
  var ledgerCards = document.querySelectorAll('[data-category]');
  filterChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var target = chip.getAttribute('data-filter');
      filterChips.forEach(function (other) {
        var active = other === chip;
        other.classList.toggle('is-active', active);
        other.setAttribute('aria-pressed', String(active));
      });
      ledgerCards.forEach(function (card) {
        var cat = card.getAttribute('data-category');
        card.hidden = !(target === 'all' || cat === target);
      });
    });
  });

  /* 3. Tap-Counter Nata Box & Grazing Platter Composer */
  var catalog = {
    nata6: { label: 'Box of 6 Pastéis de Nata', qty: 1 },
    nata12: { label: 'Box of 12 Office Nata Box', qty: 0 },
    platter: { label: 'Iberian Cheese & Charcuterie Platter', qty: 0 },
    hamper: { label: 'Portuguese Deli & Wine Gift Hamper', qty: 0 }
  };

  var trayBreakdown = document.getElementById('tray-breakdown');
  var summaryInput = document.getElementById('b-composed-summary');
  var countBadges = document.querySelectorAll('[data-total-count]');

  function syncComposerUI() {
    var parts = [];
    var total = 0;

    Object.keys(catalog).forEach(function (key) {
      var item = catalog[key];
      total += item.qty;
      if (item.qty > 0) {
        parts.push(item.qty + ' × ' + item.label);
      }
      var out = document.querySelector('[data-item-output="' + key + '"]');
      if (out) out.textContent = String(item.qty);
      var row = document.querySelector('[data-item-row="' + key + '"]');
      if (row) row.classList.toggle('has-qty', item.qty > 0);
    });

    var summaryText = parts.length ? parts.join(' · ') : 'Custom 109 High Street Pre-Order (select items or enter below)';
    if (trayBreakdown) trayBreakdown.textContent = summaryText;
    if (summaryInput) summaryInput.value = parts.length ? parts.join(', ') : '';

    countBadges.forEach(function (badge) {
      badge.textContent = String(total);
    });
  }

  document.querySelectorAll('[data-step-item]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-step-item');
      var delta = parseInt(btn.getAttribute('data-delta'), 10) || 0;
      if (!catalog[key]) return;
      catalog[key].qty = Math.min(30, Math.max(0, catalog[key].qty + delta));
      syncComposerUI();
    });
  });

  document.querySelectorAll('[data-quick-add]').forEach(function (link) {
    link.addEventListener('click', function () {
      var key = link.getAttribute('data-quick-add');
      if (catalog[key]) {
        catalog[key].qty = Math.min(30, catalog[key].qty + 1);
        syncComposerUI();
      }
    });
  });

  document.querySelectorAll('[data-open-drawer]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var drawer = document.getElementById('preorder-drawer');
      if (drawer) {
        drawer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  syncComposerUI();

  /* 4. Smart 1-Tap Collection Date Chips */
  function toIso(d) {
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function nextWeekday(base, dow) {
    var diff = (dow - base.getDay() + 7) % 7;
    if (diff === 0) diff = 7;
    return new Date(base.getFullYear(), base.getMonth(), base.getDate() + diff);
  }

  var today = new Date();
  var dateInput = document.getElementById('b-collection-date');
  var chipHost = document.querySelector('[data-date-chips-for="b-collection-date"]');
  if (dateInput) {
    dateInput.min = toIso(today);
    if (chipHost) {
      var tmrw = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      var fri = today.getDay() === 5 ? today : nextWeekday(today, 5);
      var sat = today.getDay() === 6 ? today : nextWeekday(today, 6);
      var presets = [
        { label: 'Tomorrow', iso: toIso(tmrw) },
        { label: today.getDay() === 5 ? 'Today (Fri)' : 'This Friday', iso: toIso(fri) },
        { label: today.getDay() === 6 ? 'Today (Sat)' : 'This Saturday', iso: toIso(sat) }
      ];
      presets.forEach(function (preset) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'quick-chip';
        chip.textContent = preset.label;
        chip.addEventListener('click', function () {
          dateInput.value = preset.iso;
          chipHost.querySelectorAll('.quick-chip').forEach(function (c) {
            c.classList.remove('is-selected');
          });
          chip.classList.add('is-selected');
          dateInput.dispatchEvent(new Event('input', { bubbles: true }));
        });
        chipHost.appendChild(chip);
      });
    }
  }

  /* 5. Client-Side Pre-Order Form Validation & Exact Demo Submission Message */
  var form = document.getElementById('b-preorder-form');
  var feedback = document.getElementById('b-form-feedback');

  function setError(el, msg) {
    var err = document.getElementById(el.id + '-error');
    if (msg) {
      el.setAttribute('aria-invalid', 'true');
      if (err) err.textContent = msg;
    } else {
      el.setAttribute('aria-invalid', 'false');
      if (err) err.textContent = '';
    }
  }

  function validateField(el) {
    var val = (el.value || '').trim();
    if (el.hasAttribute('required') && !val) {
      setError(el, 'Please complete this required field.');
      return false;
    }
    if (el.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setError(el, 'Please enter a valid email address.');
      return false;
    }
    if (el.type === 'tel' && val && val.replace(/\D/g, '').length < 7) {
      setError(el, 'Please enter a valid telephone number.');
      return false;
    }
    setError(el, '');
    return true;
  }

  if (form) {
    var requiredEls = form.querySelectorAll('[required]');
    requiredEls.forEach(function (el) {
      el.addEventListener('blur', function () { validateField(el); });
      el.addEventListener('input', function () {
        if (el.getAttribute('aria-invalid') === 'true') validateField(el);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      requiredEls.forEach(function (el) {
        if (!validateField(el) && !firstBad) firstBad = el;
      });

      if (firstBad) {
        if (feedback) {
          feedback.hidden = false;
          feedback.className = 'form-feedback is-error';
          feedback.textContent = 'Please check the highlighted collection fields above.';
        }
        firstBad.focus();
        return;
      }

      if (feedback) {
        feedback.hidden = false;
        feedback.className = 'form-feedback is-success';
        feedback.textContent = 'Demo only – in the live site this would go straight to Cafe Nossa.';
        feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }
})();

