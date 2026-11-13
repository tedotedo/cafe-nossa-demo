/* ==========================================================================
   Cafe Nossa — Concept C: Pastelaria Click-&-Collect Single-Page App
   Scroll Progress, 1-Tap Presets, Tart Tray, Lightbox, Auto-Dock & Receipt Ticket
   ========================================================================== */

(function () {
  'use strict';

  var toastTimer = null;
  function showMicroToast(msg) {
    var toast = document.getElementById('micro-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.hidden = false;
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.hidden = true;
    }, 2600);
  }

  /* 0. Sticky Header Scroll-Progress Hairline */
  var appHeader = document.querySelector('.app-header');
  if (appHeader && !appHeader.querySelector('.scroll-progress-rail')) {
    var rail = document.createElement('div');
    rail.className = 'scroll-progress-rail';
    rail.setAttribute('aria-hidden', 'true');
    appHeader.appendChild(rail);
    var ticking = false;
    var updateProgress = function () {
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = docH > 40 ? Math.min(1, Math.max(0, window.scrollY / docH)) : 0;
      rail.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateProgress);
      }
    }, { passive: true });
    updateProgress();
  }

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

  /* 3. Native <dialog> Photo Lightbox */
  var lightbox = document.getElementById('photo-lightbox');
  if (lightbox) {
    var lbImg = document.getElementById('lightbox-img');
    var lbCap = document.getElementById('lightbox-caption');
    var lbClose = lightbox.querySelector('[data-lightbox-close]');
    var lbCta = lightbox.querySelector('[data-lightbox-cta]');

    function openLightbox(fig) {
      var img = fig.querySelector('img');
      if (!img || !lbImg) return;
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt || '';
      var cap = fig.getAttribute('data-caption') || img.alt;
      if (lbCap) lbCap.textContent = cap;
      if (typeof lightbox.showModal === 'function') lightbox.showModal();
      else lightbox.setAttribute('open', '');
    }

    function closeLightbox() {
      if (typeof lightbox.close === 'function' && lightbox.open) lightbox.close();
      else lightbox.removeAttribute('open');
    }

    document.querySelectorAll('[data-lightbox]').forEach(function (fig) {
      fig.addEventListener('click', function (e) {
        if (e.target && e.target.closest('a, button')) return;
        openLightbox(fig);
      });
      fig.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(fig);
        }
      });
    });

    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    if (lbCta) lbCta.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  /* 4. Frosted Floating Dock Auto-Clearance on Form & Footer */
  var form = document.getElementById('c-stepper-form');
  var dock = document.querySelector('.mobile-bottom-dock');
  if (dock && 'IntersectionObserver' in window) {
    var watchTargets = [];
    if (form) watchTargets.push(form);
    var footerEl = document.querySelector('footer');
    if (footerEl) watchTargets.push(footerEl);

    if (watchTargets.length) {
      var activeTargets = new Set();
      var dockObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) activeTargets.add(entry.target);
          else activeTargets.delete(entry.target);
        });
        dock.classList.toggle('is-dock-hidden', activeTargets.size > 0);
      }, { threshold: 0.06 });

      watchTargets.forEach(function (t) { dockObs.observe(t); });
    }
  }

  /* 5. Mobbin 3-Step Pre-Order Stepper + 1-Tap Presets + Tart Visualizer */
  if (!form) return;

  var panes = form.querySelectorAll('[data-step-pane]');
  var indicators = document.querySelectorAll('[data-step-indicator]');
  var qtyInput = document.getElementById('c-box-qty');
  var dateInput = document.getElementById('c-collection-date');
  var windowSelect = document.getElementById('c-collection-window');
  var sumItem = document.getElementById('c-sum-item');
  var sumWhen = document.getElementById('c-sum-when');
  var feedback = document.getElementById('c-form-feedback');
  var nataTray = document.getElementById('c-nata-tray');
  var cPresetChips = document.querySelectorAll('[data-c-preset]');
  var currentStep = 1;

  function renderNataTray() {
    if (!nataTray) return;
    var slotsHost = nataTray.querySelector('[data-tart-slots]');
    var titleEl = nataTray.querySelector('[data-tray-label]');
    var badgeEl = nataTray.querySelector('[data-tray-count]');
    if (!slotsHost) return;

    var checked = form.querySelector('input[name="box_choice"]:checked');
    var boxName = checked ? checked.value : 'Box of 6 Pastéis de Nata';
    var q = Math.max(1, parseInt(qtyInput ? qtyInput.value : '1', 10) || 1);
    var isPlatter = boxName.indexOf('Grazing') !== -1;
    var tartsPerBox = isPlatter ? 0 : (boxName.indexOf('12') !== -1 ? 12 : 6);
    var totalTarts = tartsPerBox * q;
    var filled = isPlatter ? Math.min(12, q * 6) : Math.min(12, totalTarts);

    if (isPlatter) {
      if (titleEl) titleEl.textContent = 'Artisan Iberian Grazing Board Tray';
      if (badgeEl) badgeEl.textContent = q + (q === 1 ? ' platter' : ' platters');
    } else {
      if (titleEl) {
        titleEl.textContent = tartsPerBox === 12
          ? '12-Tart High Street Office Box Tray'
          : (boxName.indexOf('Deli') !== -1 ? '6-Tart Family Box + Deli Selection' : '6-Tart Bakehouse Sharing Tray');
      }
      if (badgeEl) {
        badgeEl.textContent = totalTarts + ' golden tarts (' + q + (q === 1 ? ' box' : ' boxes') + ')';
      }
    }

    slotsHost.innerHTML = '';
    for (var i = 0; i < 12; i++) {
      var s = document.createElement('span');
      s.className = 'c-tart-slot';
      if (i < filled) {
        s.classList.add(isPlatter ? 'is-deli' : 'is-filled');
      }
      slotsHost.appendChild(s);
    }
  }

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
    renderNataTray();
  }

  function validateStep(stepNum) {
    if (stepNum === 1) return validateInput(qtyInput);
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

  cPresetChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var p = chip.getAttribute('data-c-preset');
      cPresetChips.forEach(function (c) { c.classList.toggle('is-active', c === chip); });
      var targetId = 'c-box-6';
      var toastMsg = '';
      if (p === 'office12') {
        targetId = 'c-box-office';
        toastMsg = '🥐 Preset selected: Office Box of 12 Natas';
      } else if (p === 'grazing') {
        targetId = 'c-box-platter';
        toastMsg = '🧀 Preset selected: Weekend Iberian Grazing Platter';
      } else if (p === 'family6') {
        targetId = 'c-box-gift';
        toastMsg = '☕ Preset selected: Family 6-Pack + Deli Selection';
      }
      var radio = document.getElementById(targetId);
      if (radio) radio.checked = true;
      if (qtyInput) qtyInput.value = '1';
      showStep(1);
      showMicroToast(toastMsg);
    });
  });

  document.querySelectorAll('[data-next-step]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = parseInt(btn.getAttribute('data-next-step'), 10);
      if (validateStep(currentStep)) showStep(next);
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

  document.querySelectorAll('[data-c-qty]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!qtyInput) return;
      var delta = parseInt(btn.getAttribute('data-c-qty'), 10) || 0;
      var cur = parseInt(qtyInput.value, 10) || 1;
      var next = Math.min(50, Math.max(1, cur + delta));
      qtyInput.value = String(next);
      validateInput(qtyInput);
      updateReceipt();
      showMicroToast('Tray updated: ' + next + (next === 1 ? ' box' : ' boxes'));
    });
  });

  document.querySelectorAll('[data-select-preset]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetVal = btn.getAttribute('data-select-preset');
      var radio = form.querySelector('input[name="box_choice"][value="' + targetVal + '"]');
      if (!radio && targetVal.indexOf('Gift') !== -1) {
        radio = document.getElementById('c-box-gift');
      }
      if (radio) radio.checked = true;
      showStep(1);
      updateReceipt();
      showMicroToast('Selected: ' + (radio ? radio.value : targetVal));
      var stepperEl = document.getElementById('preorder-box');
      if (stepperEl) stepperEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* 6. 1-Tap Collection Date Chips */
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
          showMicroToast('Collection date set: ' + p.label);
        });
        chipWrap.appendChild(b);
      });
    }
  }

  form.addEventListener('change', function (e) {
    updateReceipt();
    if (e.target && e.target.name === 'box_choice') {
      cPresetChips.forEach(function (c) { c.classList.remove('is-active'); });
      showMicroToast('Selected: ' + e.target.value);
    }
  });
  form.addEventListener('input', updateReceipt);
  updateReceipt();

  function addTicketRow(dl, label, value) {
    var row = document.createElement('div');
    var dt = document.createElement('dt');
    dt.textContent = label;
    var dd = document.createElement('dd');
    dd.textContent = value;
    row.appendChild(dt);
    row.appendChild(dd);
    dl.appendChild(row);
  }

  /* 7. Final Step Validation & Live Digital Enquiry Ticket */
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
      var checked = form.querySelector('input[name="box_choice"]:checked');
      var boxName = checked ? checked.value : 'Box of 6 Pastéis de Nata';
      var q = qtyInput ? qtyInput.value : '1';
      var colDate = dateInput ? dateInput.value : '';
      var colWin = windowSelect ? windowSelect.value : '';
      var wineNote = ((document.getElementById('c-wine-note') || {}).value) || 'No wine addition';
      var notesVal = ((document.getElementById('c-notes') || {}).value || '').trim() || 'None specified';
      var nameVal = ((document.getElementById('c-name') || {}).value || '').trim();
      var phoneVal = ((document.getElementById('c-phone') || {}).value || '').trim();
      var emailVal = ((document.getElementById('c-email') || {}).value || '').trim();
      var refCode = 'CN-C-' + String(Math.floor(1000 + Math.random() * 9000));

      var plainReceipt = [
        'Cafe Nossa — Pre-Order Enquiry (' + refCode + ')',
        'Customer: ' + nameVal,
        'Contact: ' + phoneVal + ' | ' + emailVal,
        'Collection: ' + colDate + ' (' + colWin + ') at 109 High Street, Yarm TS15 9BB',
        'Selection: ' + q + ' × ' + boxName,
        'Wine Note: ' + wineNote,
        'Notes: ' + notesVal
      ].join('\n');

      feedback.hidden = false;
      feedback.className = 'form-feedback is-success';
      feedback.innerHTML = '';

      var bannerP = document.createElement('p');
      bannerP.className = 'demo-verbatim-banner';
      bannerP.textContent = 'Demo only – in the live site this would go straight to Cafe Nossa.';
      feedback.appendChild(bannerP);

      var ticket = document.createElement('div');
      ticket.className = 'owner-receipt-ticket';

      var topBar = document.createElement('div');
      topBar.className = 'ticket-top-bar';
      var hSpan = document.createElement('span');
      hSpan.className = 'ticket-heading';
      hSpan.textContent = 'What Cafe Nossa Receives';
      var rSpan = document.createElement('span');
      rSpan.className = 'ticket-ref';
      rSpan.textContent = 'Ref: ' + refCode;
      topBar.appendChild(hSpan);
      topBar.appendChild(rSpan);
      ticket.appendChild(topBar);

      var dl = document.createElement('dl');
      dl.className = 'ticket-dl';
      addTicketRow(dl, 'Customer', nameVal);
      addTicketRow(dl, 'Phone / Email', phoneVal + ' · ' + emailVal);
      addTicketRow(dl, 'Collection', colDate + ' · ' + colWin);
      addTicketRow(dl, 'Box Selection', q + ' × ' + boxName);
      addTicketRow(dl, 'Wine Advice', wineNote);
      addTicketRow(dl, 'Notes', notesVal);
      ticket.appendChild(dl);

      var actions = document.createElement('div');
      actions.className = 'ticket-actions';

      var copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'btn btn-cobalt btn-sm';
      copyBtn.textContent = 'Copy Summary';
      copyBtn.addEventListener('click', function () {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(plainReceipt).then(function () {
            copyBtn.textContent = 'Copied ✓';
            showMicroToast('Enquiry summary copied to clipboard');
          }).catch(function () {
            showMicroToast('Summary ready above');
          });
        } else {
          copyBtn.textContent = 'Copied ✓';
          showMicroToast('Enquiry summary copied');
        }
      });

      var resetBtn = document.createElement('button');
      resetBtn.type = 'button';
      resetBtn.className = 'btn btn-outline-cobalt btn-sm';
      resetBtn.textContent = 'Reset Demo';
      resetBtn.addEventListener('click', function () {
        form.reset();
        cPresetChips.forEach(function (c) { c.classList.remove('is-active'); });
        if (chipWrap) {
          chipWrap.querySelectorAll('.date-pill-btn').forEach(function (c) { c.classList.remove('is-selected'); });
        }
        [qtyInput, dateInput, windowSelect, document.getElementById('c-name'), document.getElementById('c-phone'), document.getElementById('c-email')].forEach(function (f) {
          setError(f, '');
        });
        feedback.hidden = true;
        feedback.innerHTML = '';
        showStep(1);
        showMicroToast('Demo form reset');
      });

      actions.appendChild(copyBtn);
      actions.appendChild(resetBtn);
      ticket.appendChild(actions);
      feedback.appendChild(ticket);

      feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
})();
