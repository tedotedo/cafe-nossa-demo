/* ==========================================================================
   Cafe Nossa — Concept C: Pastelaria Click-&-Collect Single-Page App
   Sticky Tab Spy, Deli Filter, 1-Tap Date Chips & Mobbin 3-Step Pre-Order Stepper
   ========================================================================== */

(function () {
  'use strict';

  /* 1. Sticky Pill-Tab Active Highlight */
  var pillTabs = document.querySelectorAll('[data-spy-tab]');
  pillTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      pillTabs.forEach(function (t) { t.classList.toggle('is-current', t === tab); });
    });
  });

  if ('IntersectionObserver' in window && pillTabs.length) {
    var secObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          pillTabs.forEach(function (t) {
            t.classList.toggle('is-current', t.getAttribute('data-spy-tab') === id);
          });
        }
      });
    }, { rootMargin: '-28% 0px -55% 0px' });

    ['bakery', 'deli-brunch', 'preorder-box', 'high-st'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) secObserver.observe(el);
    });
  }

  /* 2. Deli & Brunch Category Filter */
  var deliFilters = document.querySelectorAll('[data-deli-filter]');
  var deliItems = document.querySelectorAll('[data-deli-cat]');
  deliFilters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cat = btn.getAttribute('data-deli-filter');
      deliFilters.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      deliItems.forEach(function (card) {
        card.hidden = !(cat === 'all' || card.getAttribute('data-deli-cat') === cat);
      });
    });
  });

  /* 3. Mobbin 3-Step Pre-Order Stepper */
  var form = document.getElementById('c-stepper-form');
  if (!form) return;

  var panes = form.querySelectorAll('[data-step-pane]');
  var indicators = document.querySelectorAll('[data-step-indicator]');
  var qtyInput = document.getElementById('c-box-qty');
  var dateInput = document.getElementById('c-collection-date');
  var windowSelect = document.getElementById('c-collection-window');
  var sumItem = document.getElementById('c-sum-item');
  var sumWhen = document.getElementById('c-sum-when');
  var feedback = document.getElementById('c-form-feedback');
  var currentStep = 1;

  function setError(el, msg) {
    if (!el) return;
    var err = document.getElementById(el.id + '-error');
    if (msg) {
      el.setAttribute('aria-invalid', 'true');
      if (err) err.textContent = msg;
    } else {
      el.setAttribute('aria-invalid', 'false');
      if (err) err.textContent = '';
    }
  }

  function validateInput(el) {
    var val = (el.value || '').trim();
    if (el.hasAttribute('required') && !val) {
      setError(el, 'Please complete this required field.');
      return false;
    }
    if (el.type === 'number') {
      var n = parseInt(val, 10);
      if (isNaN(n) || n < 1 || n > 50) {
        setError(el, 'Enter a quantity from 1 to 50.');
        return false;
      }
    }
    if (el.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setError(el, 'Enter a valid email address.');
      return false;
    }
    if (el.type === 'tel' && val && val.replace(/\D/g, '').length < 7) {
      setError(el, 'Enter a valid telephone number.');
      return false;
    }
    setError(el, '');
    return true;
  }

  function updateReceipt() {
    var checked = form.querySelector('input[name="box_choice"]:checked');
    var boxName = checked ? checked.value : 'Box of 6 Pastéis de Nata';
    var q = qtyInput ? (qtyInput.value || '1') : '1';
    if (sumItem) sumItem.textContent = q + ' × ' + boxName;

    var d = dateInput && dateInput.value ? dateInput.value : 'Date to confirm';
    var w = windowSelect && windowSelect.value ? windowSelect.value : 'Window to confirm';
    if (sumWhen) sumWhen.textContent = d + ' · ' + w;
  }

  function validateStep(stepNum) {
    if (stepNum === 1) {
      return validateInput(qtyInput);
    }
    if (stepNum === 2) {
      var okDate = validateInput(dateInput);
      var okWin = validateInput(windowSelect);
      return okDate && okWin;
    }
    return true;
  }

  function showStep(targetStep) {
    currentStep = targetStep;
    panes.forEach(function (pane) {
      var n = parseInt(pane.getAttribute('data-step-pane'), 10);
      pane.hidden = n !== targetStep;
    });
    indicators.forEach(function (ind) {
      var n = parseInt(ind.getAttribute('data-step-indicator'), 10);
      ind.classList.toggle('is-active', n === targetStep);
      ind.classList.toggle('is-done', n < targetStep);
      var btn = ind.querySelector('.step-node-btn');
      if (btn) {
        if (n === targetStep) btn.setAttribute('aria-current', 'step');
        else btn.removeAttribute('aria-current');
      }
    });
    updateReceipt();
  }

  document.querySelectorAll('[data-next-step]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = parseInt(btn.getAttribute('data-next-step'), 10);
      if (validateStep(currentStep)) {
        showStep(next);
      }
    });
  });

  document.querySelectorAll('[data-prev-step]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var prev = parseInt(btn.getAttribute('data-prev-step'), 10);
      showStep(prev);
    });
  });

  document.querySelectorAll('[data-jump-step]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dest = parseInt(btn.getAttribute('data-jump-step'), 10);
      if (dest <= currentStep || validateStep(currentStep)) {
        if (dest === 3 && currentStep === 1 && !validateStep(2)) {
          showStep(2);
          return;
        }
        showStep(dest);
      }
    });
  });

  /* Quantity +/- buttons */
  document.querySelectorAll('[data-c-qty]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!qtyInput) return;
      var delta = parseInt(btn.getAttribute('data-c-qty'), 10) || 0;
      var cur = parseInt(qtyInput.value, 10) || 1;
      qtyInput.value = String(Math.min(50, Math.max(1, cur + delta)));
      validateInput(qtyInput);
      updateReceipt();
    });
  });

  /* Quick Select Preset buttons from Bakery/Deli list */
  document.querySelectorAll('[data-select-preset]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetVal = btn.getAttribute('data-select-preset');
      var radio = form.querySelector('input[name="box_choice"][value="' + targetVal + '"]');
      if (radio) radio.checked = true;
      showStep(1);
      var stepperEl = document.getElementById('preorder-box');
      if (stepperEl) stepperEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* 4. 1-Tap Collection Date Chips */
  function toIso(d) {
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function nextDow(base, dow) {
    var diff = (dow - base.getDay() + 7) % 7;
    if (diff === 0) diff = 7;
    return new Date(base.getFullYear(), base.getMonth(), base.getDate() + diff);
  }

  var today = new Date();
  var chipWrap = document.getElementById('c-date-chips');
  if (dateInput) {
    dateInput.min = toIso(today);
    if (chipWrap) {
      var tmrw = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      var fri = today.getDay() === 5 ? today : nextDow(today, 5);
      var sat = today.getDay() === 6 ? today : nextDow(today, 6);
      [
        { label: 'Tomorrow', iso: toIso(tmrw) },
        { label: today.getDay() === 5 ? 'Today (Fri)' : 'This Friday', iso: toIso(fri) },
        { label: today.getDay() === 6 ? 'Today (Sat)' : 'This Saturday', iso: toIso(sat) }
      ].forEach(function (p) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'date-pill-btn';
        b.textContent = p.label;
        b.addEventListener('click', function () {
          dateInput.value = p.iso;
          chipWrap.querySelectorAll('.date-pill-btn').forEach(function (c) { c.classList.remove('is-selected'); });
          b.classList.add('is-selected');
          validateInput(dateInput);
          updateReceipt();
        });
        chipWrap.appendChild(b);
      });
    }
  }

  form.addEventListener('change', updateReceipt);
  form.addEventListener('input', updateReceipt);

  /* 5. Final Step Validation & Exact Demo Submission Message */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateStep(1)) { showStep(1); return; }
    if (!validateStep(2)) { showStep(2); return; }

    var step3Fields = [
      document.getElementById('c-name'),
      document.getElementById('c-phone'),
      document.getElementById('c-email')
    ];
    var firstInvalid = null;
    step3Fields.forEach(function (el) {
      if (el && !validateInput(el) && !firstInvalid) firstInvalid = el;
    });

    if (firstInvalid) {
      if (feedback) {
        feedback.hidden = false;
        feedback.className = 'form-feedback is-error';
        feedback.textContent = 'Please complete your contact details above before submitting.';
      }
      firstInvalid.focus();
      return;
    }

    if (feedback) {
      feedback.hidden = false;
      feedback.className = 'form-feedback is-success';
      feedback.textContent = 'Demo only – in the live site this would go straight to Cafe Nossa.';
      feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
})();

