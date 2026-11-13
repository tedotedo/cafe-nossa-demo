/* ==========================================================================
   Cafe Nossa — Set A Client-Side Concept Interactions
   Mobile Nav, 1-Tap Presets, Custard Tart Box Visualizer, Lightbox & Receipt Ticket
   ========================================================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'cafeNossaQuickBuilder';
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

  function renderNataTray(widget, tartPerBox, isPlatter, boxQty) {
    if (!widget) return;
    var slotsHost = widget.querySelector('[data-tart-slots]');
    var labelEl = widget.querySelector('[data-tray-label]');
    var countEl = widget.querySelector('[data-tray-count]');
    if (!slotsHost) return;

    var qty = Math.max(1, parseInt(boxQty, 10) || 1);
    var totalSlots = 12;
    var filledCount = 0;

    if (isPlatter && tartPerBox === 0) {
      filledCount = Math.min(12, qty * 6);
      if (labelEl) labelEl.textContent = 'Artisan Iberian Grazing Board Tray';
      if (countEl) countEl.textContent = qty + (qty === 1 ? ' platter' : ' platters');
    } else {
      var totalTarts = tartPerBox * qty;
      filledCount = Math.min(12, totalTarts);
      if (labelEl) {
        labelEl.textContent = tartPerBox === 12
          ? '12-Tart High Street Office Tray'
          : '6-Tart Bakehouse Sharing Tray';
      }
      if (countEl) {
        countEl.textContent = totalTarts + ' golden tarts (' + qty + (qty === 1 ? ' box' : ' boxes') + ')';
      }
    }

    slotsHost.innerHTML = '';
    for (var i = 0; i < totalSlots; i++) {
      var slot = document.createElement('span');
      slot.className = 'nata-tart-slot';
      if (i < filledCount) {
        slot.classList.add(isPlatter && tartPerBox === 0 ? 'is-deli' : 'is-filled');
      }
      slotsHost.appendChild(slot);
    }
  }

  /* 1. Keyboard-Accessible Mobile Navigation */
  var navToggle = document.querySelector('.nav-toggle');
  var siteNav = document.getElementById('primary-nav');

  function closeMobileNav(returnFocus) {
    if (!navToggle || !siteNav) return;
    siteNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    if (returnFocus) navToggle.focus();
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      siteNav.classList.toggle('is-open', !expanded);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && siteNav.classList.contains('is-open')) {
        closeMobileNav(true);
      }
    });

    document.addEventListener('click', function (event) {
      if (
        siteNav.classList.contains('is-open') &&
        !siteNav.contains(event.target) &&
        !navToggle.contains(event.target)
      ) {
        closeMobileNav(false);
      }
    });
  }

  /* 2. Hero Azulejo Mosaic Quick Box Builder (index.html Tile D) */
  var quickBuilderForm = document.getElementById('mosaic-quick-builder');
  if (quickBuilderForm) {
    var qbQtyInput = document.getElementById('qb-qty');
    var homeTray = document.getElementById('home-nata-tray');
    var stepButtons = quickBuilderForm.querySelectorAll('[data-qty-step]');

    function syncHomeTray(announce) {
      var checked = quickBuilderForm.querySelector('input[name="preset"]:checked');
      var tarts = checked ? parseInt(checked.getAttribute('data-tarts') || '6', 10) : 6;
      var presetVal = checked ? checked.value : 'family6';
      var q = qbQtyInput ? (parseInt(qbQtyInput.value, 10) || 1) : 1;
      renderNataTray(homeTray, tarts, presetVal === 'grazing', q);
      if (announce && checked) {
        var lbl = checked.getAttribute('data-label') || checked.value;
        showMicroToast('Tray updated: ' + q + ' × ' + lbl);
      }
    }

    quickBuilderForm.querySelectorAll('input[name="preset"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        syncHomeTray(true);
      });
    });

    stepButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!qbQtyInput) return;
        var delta = parseInt(btn.getAttribute('data-qty-step'), 10) || 0;
        var current = parseInt(qbQtyInput.value, 10);
        if (isNaN(current)) current = 1;
        var next = Math.min(50, Math.max(1, current + delta));
        qbQtyInput.value = String(next);
        syncHomeTray(true);
      });
    });

    if (qbQtyInput) {
      qbQtyInput.addEventListener('input', function () {
        syncHomeTray(false);
      });
    }

    syncHomeTray(false);

    quickBuilderForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var checkedPreset = quickBuilderForm.querySelector('input[name="preset"]:checked');
      var presetVal = checkedPreset ? checkedPreset.value : 'family6';
      var qtyVal = qbQtyInput ? parseInt(qbQtyInput.value, 10) : 1;
      if (isNaN(qtyVal) || qtyVal < 1) qtyVal = 1;
      if (qtyVal > 50) qtyVal = 50;

      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ preset: presetVal, qty: qtyVal, ts: Date.now() })
        );
      } catch (e) {
        /* Ignore storage errors */
      }

      window.location.href =
        'boxes-preorder.html?preset=' +
        encodeURIComponent(presetVal) +
        '&qty=' +
        encodeURIComponent(String(qtyVal)) +
        '#preorder-form';
    });
  }

  /* 3. Menu & Deli Counter Filter Buttons (menu-deli.html) */
  var filterButtons = document.querySelectorAll('[data-counter-filter]');
  var counterBlocks = document.querySelectorAll('[data-counter-section]');

  if (filterButtons.length > 0 && counterBlocks.length > 0) {
    filterButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-counter-filter');
        filterButtons.forEach(function (other) {
          other.setAttribute('aria-pressed', String(other === btn));
        });
        counterBlocks.forEach(function (block) {
          var category = block.getAttribute('data-counter-section');
          block.hidden = !(target === 'all' || category === target);
        });
      });
    });
  }

  /* 4. Grazing Platter & Pastry Box Pre-Order Form (boxes-preorder.html) */
  var preorderForm = document.getElementById('preorder-form');
  if (preorderForm) {
    var summaryBox = document.getElementById('sum-box-type');
    var summarySize = document.getElementById('sum-box-size');
    var summaryQty = document.getElementById('sum-box-qty');
    var summaryDate = document.getElementById('sum-collection-date');
    var summaryWindow = document.getElementById('sum-collection-window');
    var feedbackBox = document.getElementById('form-feedback');
    var prefillNotice = document.getElementById('prefill-notice');
    var sizeSelect = document.getElementById('box-size');
    var qtyInput = document.getElementById('box-qty');
    var preorderTray = document.getElementById('preorder-nata-tray');
    var presetActionChips = document.querySelectorAll('[data-preorder-preset]');

    function updateSummary() {
      var selectedBox = preorderForm.querySelector('input[name="box_type"]:checked');
      var dateInput = document.getElementById('collection-date');
      var timeSelect = document.getElementById('collection-time');

      var boxVal = selectedBox ? selectedBox.value : 'Pastéis de Nata Box';
      var tierText = (sizeSelect && sizeSelect.selectedIndex >= 0)
        ? sizeSelect.options[sizeSelect.selectedIndex].text.split(' (')[0]
        : 'Box of 6 Nata / Small Sharing';
      var q = qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1;

      if (summaryBox) summaryBox.textContent = boxVal;
      if (summarySize) summarySize.textContent = tierText;
      if (summaryQty) summaryQty.textContent = q + ' box(es)';
      if (summaryDate && dateInput) {
        summaryDate.textContent = dateInput.value ? dateInput.value : 'Select date';
      }
      if (summaryWindow && timeSelect) {
        summaryWindow.textContent = timeSelect.value
          ? timeSelect.options[timeSelect.selectedIndex].text.split(' [')[0]
          : 'Select window';
      }

      var isPlatter = boxVal.indexOf('Grazing') !== -1;
      var tartsPerBox = isPlatter ? 0 : (tierText.indexOf('12') !== -1 ? 12 : 6);
      renderNataTray(preorderTray, tartsPerBox, isPlatter, q);
    }

    var presetMap = {
      nata6: {
        radioId: 'box-type-nata',
        tierValue: 'Box of 6 Nata / Small Sharing',
        toast: 'Selected Box of 6 Pastéis de Nata'
      },
      nata: {
        radioId: 'box-type-nata',
        tierValue: 'Box of 6 Nata / Small Sharing',
        toast: 'Selected Box of 6 Pastéis de Nata'
      },
      nata12: {
        radioId: 'box-type-nata',
        tierValue: 'Box of 12 Office Box / Medium Hosting',
        toast: '🥐 Selected Office Box of 12 Natas'
      },
      grazing: {
        radioId: 'box-type-grazing',
        tierValue: 'Box of 12 Office Box / Medium Hosting',
        toast: '🧀 Selected Weekend Iberian Grazing Platter'
      },
      family6: {
        radioId: 'box-type-gift',
        tierValue: 'Box of 6 Nata / Small Sharing',
        toast: '☕ Selected Family 6-Pack + Deli Selection'
      },
      gift: {
        radioId: 'box-type-gift',
        tierValue: 'Box of 6 Nata / Small Sharing',
        toast: 'Selected Family 6-Pack + Deli Selection'
      }
    };

    function applyPresetSelection(preset, qty, showBanner) {
      var applied = false;
      var cfg = preset ? presetMap[preset] : null;
      if (cfg) {
        var radioEl = document.getElementById(cfg.radioId);
        if (radioEl) {
          radioEl.checked = true;
          applied = true;
        }
        if (sizeSelect && cfg.tierValue) {
          sizeSelect.value = cfg.tierValue;
          applied = true;
        }
      }

      if (qty && qtyInput) {
        var parsedQty = parseInt(qty, 10);
        if (!isNaN(parsedQty) && parsedQty >= 1 && parsedQty <= 50) {
          qtyInput.value = String(parsedQty);
          applied = true;
        }
      }

      presetActionChips.forEach(function (chip) {
        chip.classList.toggle('is-active', chip.getAttribute('data-preorder-preset') === preset);
      });

      if (applied && showBanner && prefillNotice) {
        prefillNotice.hidden = false;
      }
      updateSummary();
    }

    presetActionChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var p = chip.getAttribute('data-preorder-preset');
        applyPresetSelection(p, qtyInput ? qtyInput.value : 1, false);
        var cfg = presetMap[p];
        showMicroToast(cfg ? cfg.toast : 'Preset applied');
      });
    });

    document.querySelectorAll('[data-form-qty-step]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!qtyInput) return;
        var delta = parseInt(btn.getAttribute('data-form-qty-step'), 10) || 0;
        var cur = parseInt(qtyInput.value, 10) || 1;
        var next = Math.min(50, Math.max(1, cur + delta));
        qtyInput.value = String(next);
        updateSummary();
        showMicroToast('Tray updated: ' + next + (next === 1 ? ' box' : ' boxes'));
      });
    });

    try {
      var params = new URLSearchParams(window.location.search);
      var urlPreset = params.get('preset') || params.get('box');
      var urlQty = params.get('qty');

      if (urlPreset || urlQty) {
        applyPresetSelection(urlPreset, urlQty, true);
        try { window.localStorage.removeItem(STORAGE_KEY); } catch (err) {}
      } else {
        var rawStored = window.localStorage.getItem(STORAGE_KEY);
        if (rawStored) {
          var parsedStored = JSON.parse(rawStored);
          if (parsedStored && parsedStored.ts && Date.now() - parsedStored.ts < 600000) {
            applyPresetSelection(parsedStored.preset, parsedStored.qty, true);
          }
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (e) {
      /* Safe fallback */
    }

    preorderForm.addEventListener('change', function (e) {
      updateSummary();
      if (e.target && e.target.name === 'box_type') {
        showMicroToast('Selected: ' + e.target.value);
      }
    });
    preorderForm.addEventListener('input', updateSummary);
    updateSummary();

    function setFieldError(input, message) {
      var errEl = document.getElementById(input.id + '-error');
      if (message) {
        input.setAttribute('aria-invalid', 'true');
        if (errEl) errEl.textContent = message;
      } else {
        input.setAttribute('aria-invalid', 'false');
        if (errEl) errEl.textContent = '';
      }
    }

    function validateField(input) {
      var val = (input.value || '').trim();
      if (input.hasAttribute('required') && !val) {
        setFieldError(input, 'Please complete this required field.');
        return false;
      }
      if (input.type === 'number') {
        var num = Number(val);
        if (!val || isNaN(num) || num < 1 || num > 50) {
          setFieldError(input, 'Please enter a quantity between 1 and 50.');
          return false;
        }
      }
      if (input.type === 'email' && val) {
        var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        if (!emailOk) {
          setFieldError(input, 'Please enter a valid email address.');
          return false;
        }
      }
      if (input.type === 'tel' && val) {
        var digits = val.replace(/\D/g, '');
        if (digits.length < 7) {
          setFieldError(input, 'Please enter a valid contact phone number.');
          return false;
        }
      }
      setFieldError(input, '');
      return true;
    }

    var requiredFields = preorderForm.querySelectorAll('[required]');
    requiredFields.forEach(function (field) {
      field.addEventListener('blur', function () { validateField(field); });
      field.addEventListener('input', function () {
        if (field.getAttribute('aria-invalid') === 'true') validateField(field);
      });
    });

    function buildSafeRow(dl, label, value) {
      var wrap = document.createElement('div');
      var dt = document.createElement('dt');
      dt.textContent = label;
      var dd = document.createElement('dd');
      dd.textContent = value;
      wrap.appendChild(dt);
      wrap.appendChild(dd);
      dl.appendChild(wrap);
    }

    preorderForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var firstInvalid = null;

      requiredFields.forEach(function (field) {
        var valid = validateField(field);
        if (!valid && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        if (feedbackBox) {
          feedbackBox.hidden = false;
          feedbackBox.className = 'form-feedback is-error';
          feedbackBox.textContent = 'Please check the highlighted fields above before submitting your pre-order enquiry.';
        }
        firstInvalid.focus();
        return;
      }

      if (feedbackBox) {
        var selectedBox = preorderForm.querySelector('input[name="box_type"]:checked');
        var boxVal = selectedBox ? selectedBox.value : 'Pastéis de Nata Box';
        var tierVal = sizeSelect && sizeSelect.selectedIndex >= 0
          ? sizeSelect.options[sizeSelect.selectedIndex].text.split(' (')[0]
          : 'Box of 6 Nata';
        var qtyVal = qtyInput ? qtyInput.value : '1';
        var wineSel = document.getElementById('wine-pairing');
        var wineVal = wineSel ? wineSel.value : 'No wine pairing needed';
        var dateVal = (document.getElementById('collection-date') || {}).value || '';
        var winSel = document.getElementById('collection-time');
        var winVal = winSel && winSel.selectedIndex >= 0
          ? winSel.options[winSel.selectedIndex].text.split(' [')[0]
          : '';
        var nameVal = ((document.getElementById('customer-name') || {}).value || '').trim();
        var phoneVal = ((document.getElementById('customer-phone') || {}).value || '').trim();
        var emailVal = ((document.getElementById('customer-email') || {}).value || '').trim();
        var notesVal = ((document.getElementById('dietary-notes') || {}).value || '').trim() || 'None specified';
        var refCode = 'CN-109-' + String(Math.floor(1000 + Math.random() * 9000));

        var plainReceipt = [
          'Cafe Nossa — Pre-Order Enquiry (' + refCode + ')',
          'Customer: ' + nameVal,
          'Contact: ' + phoneVal + ' | ' + emailVal,
          'Collection: ' + dateVal + ' (' + winVal + ') at 109 High Street, Yarm TS15 9BB',
          'Selection: ' + qtyVal + ' × ' + boxVal + ' (' + tierVal + ')',
          'Wine Pairing: ' + wineVal,
          'Notes: ' + notesVal
        ].join('\n');

        feedbackBox.hidden = false;
        feedbackBox.className = 'form-feedback is-success';
        feedbackBox.innerHTML = '';

        var noticeP = document.createElement('p');
        noticeP.className = 'demo-verbatim-banner';
        noticeP.textContent = 'Demo only – in the live site this would go straight to Cafe Nossa.';
        feedbackBox.appendChild(noticeP);

        var ticket = document.createElement('div');
        ticket.className = 'owner-receipt-ticket';

        var topBar = document.createElement('div');
        topBar.className = 'ticket-top-bar';
        var heading = document.createElement('span');
        heading.className = 'ticket-heading';
        heading.textContent = 'What Cafe Nossa Receives';
        var refSpan = document.createElement('span');
        refSpan.className = 'ticket-ref';
        refSpan.textContent = 'Ref: ' + refCode;
        topBar.appendChild(heading);
        topBar.appendChild(refSpan);
        ticket.appendChild(topBar);

        var dl = document.createElement('dl');
        dl.className = 'ticket-dl';
        buildSafeRow(dl, 'Customer', nameVal);
        buildSafeRow(dl, 'Phone / Email', phoneVal + ' · ' + emailVal);
        buildSafeRow(dl, 'Collection', dateVal + ' · ' + winVal);
        buildSafeRow(dl, 'Box Selection', qtyVal + ' × ' + boxVal + ' (' + tierVal + ')');
        buildSafeRow(dl, 'Wine Advice', wineVal);
        buildSafeRow(dl, 'Notes', notesVal);
        ticket.appendChild(dl);

        var actions = document.createElement('div');
        actions.className = 'ticket-actions';

        var copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'btn btn-azulejo btn-sm';
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
        resetBtn.className = 'btn btn-outline btn-sm';
        resetBtn.textContent = 'Reset Demo';
        resetBtn.addEventListener('click', function () {
          preorderForm.reset();
          requiredFields.forEach(function (f) { setFieldError(f, ''); });
          presetActionChips.forEach(function (c) { c.classList.remove('is-active'); });
          feedbackBox.hidden = true;
          feedbackBox.innerHTML = '';
          updateSummary();
          showMicroToast('Demo form reset');
        });

        actions.appendChild(copyBtn);
        actions.appendChild(resetBtn);
        ticket.appendChild(actions);
        feedbackBox.appendChild(ticket);

        feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  /* 5. Native <dialog> Photo Lightbox */
  var lightbox = document.getElementById('photo-lightbox');
  if (lightbox) {
    var lbImg = document.getElementById('lightbox-img');
    var lbCap = document.getElementById('lightbox-caption');
    var lbClose = lightbox.querySelector('[data-lightbox-close]');
    var lbCta = lightbox.querySelector('[data-lightbox-cta]');

    function openLightboxFromFigure(fig) {
      var img = fig.querySelector('img');
      if (!img || !lbImg) return;
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt || '';
      var capText = fig.getAttribute('data-caption') || '';
      if (!capText) {
        var fc = fig.querySelector('figcaption span');
        capText = fc ? fc.textContent : img.alt;
      }
      if (lbCap) lbCap.textContent = capText;
      if (typeof lightbox.showModal === 'function') {
        lightbox.showModal();
      } else {
        lightbox.setAttribute('open', '');
      }
    }

    function closeLightbox() {
      if (typeof lightbox.close === 'function' && lightbox.open) {
        lightbox.close();
      } else {
        lightbox.removeAttribute('open');
      }
    }

    document.querySelectorAll('[data-lightbox]').forEach(function (fig) {
      fig.addEventListener('click', function (e) {
        if (e.target && e.target.closest('a, button')) return;
        openLightboxFromFigure(fig);
      });
      fig.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightboxFromFigure(fig);
        }
      });
    });

    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    if (lbCta) lbCta.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  /* 6. Smart Mobile Dock Clearance on Form / Footer */
  var mobileBar = document.querySelector('.mobile-action-bar');
  if (mobileBar && 'IntersectionObserver' in window) {
    var watchTargets = [];
    var mainForm = document.getElementById('preorder-form');
    var mainFooter = document.querySelector('footer');
    if (mainForm) watchTargets.push(mainForm);
    if (mainFooter) watchTargets.push(mainFooter);

    if (watchTargets.length) {
      var activeSet = new Set();
      var dockObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) activeSet.add(entry.target);
          else activeSet.delete(entry.target);
        });
        mobileBar.classList.toggle('is-dock-hidden', activeSet.size > 0);
      }, { threshold: 0.06 });
      watchTargets.forEach(function (t) { dockObs.observe(t); });
    }
  }
})();

// === Gallery Inspiration Polish (Awwwards / Godly / Mobbin) ===
(function () {
  'use strict';

  function initGalleryPolish() {
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Subtle Top Header Reading-Progress Hairline
    var hdr = document.querySelector('header');
    if (hdr && !hdr.querySelector('.scroll-progress-rail')) {
      var cs = window.getComputedStyle(hdr);
      if (cs.position === 'static') hdr.style.position = 'relative';
      var rail = document.createElement('div');
      rail.className = 'scroll-progress-rail';
      rail.setAttribute('aria-hidden', 'true');
      hdr.appendChild(rail);
      var ticking = false;
      var updateRail = function () {
        var docH = document.documentElement.scrollHeight - window.innerHeight;
        var ratio = docH > 40 ? Math.min(1, Math.max(0, window.scrollY / docH)) : 0;
        rail.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
        ticking = false;
      };
      window.addEventListener('scroll', function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(updateRail);
        }
      }, { passive: true });
      updateRail();
    }

    // 2. Choreographed Below-the-Fold Scroll Reveals (never hiding above-the-fold)
    if (!reduced && 'IntersectionObserver' in window) {
      var targets = document.querySelectorAll('.counter-panel, .menu-board, .split-callout, .porcelain-ledger, .directions-plaque');
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });

      var vh = window.innerHeight || 844;
      var staggerIdx = 0;
      targets.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top > vh * 0.96) {
          el.style.setProperty('--reveal-delay', ((staggerIdx % 3) * 55) + 'ms');
          staggerIdx++;
          el.classList.add('reveal-ready');
          obs.observe(el);
        }
      });

      window.addEventListener('hashchange', function () {
        document.querySelectorAll('.reveal-ready:not(.is-revealed)').forEach(function (el) {
          if (el.getBoundingClientRect().top < window.innerHeight * 1.1) {
            el.classList.add('is-revealed');
          }
        });
      });
    }

    // 3. Mobbin Smart Date Defaults + 1-Tap Quick Date Chips
    function toIso(d) {
      var m = String(d.getMonth() + 1).padStart(2, '0');
      var day = String(d.getDate()).padStart(2, '0');
      return d.getFullYear() + '-' + m + '-' + day;
    }
    function nextWeekday(base, targetDow) {
      var diff = (targetDow - base.getDay() + 7) % 7;
      if (diff === 0) diff = 7;
      return new Date(base.getFullYear(), base.getMonth(), base.getDate() + diff);
    }

    var today = new Date();
    var todayIso = toIso(today);
    document.querySelectorAll('input[type="date"]').forEach(function (input) {
      if (!input.min) input.min = todayIso;
      var fieldWrap = input.parentElement;
      if (!fieldWrap || fieldWrap.querySelector('.quick-date-chips')) return;

      var chipRow = document.createElement('div');
      chipRow.className = 'quick-date-chips';
      chipRow.setAttribute('aria-label', 'Quick date options');

      var tmrw = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      var fri = today.getDay() === 5 ? today : nextWeekday(today, 5);
      var sat = today.getDay() === 6 ? today : nextWeekday(today, 6);
      var presets = [
        { label: 'Tomorrow', iso: toIso(tmrw) },
        { label: today.getDay() === 5 ? 'Today (Fri)' : 'This Friday', iso: toIso(fri) },
        { label: today.getDay() === 6 ? 'Today (Sat)' : 'This Saturday', iso: toIso(sat) }
      ];

      presets.forEach(function (p) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quick-date-chip';
        btn.textContent = p.label;
        btn.addEventListener('click', function () {
          input.value = p.iso;
          chipRow.querySelectorAll('.quick-date-chip').forEach(function (c) { c.classList.remove('is-selected'); });
          btn.classList.add('is-selected');
          input.dispatchEvent(new Event('change', { bubbles: true }));
          input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        chipRow.appendChild(btn);
      });

      input.insertAdjacentElement('afterend', chipRow);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGalleryPolish);
  } else {
    initGalleryPolish();
  }
})();
