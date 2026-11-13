/* ==========================================================================
   Cafe Nossa — Client-Side Concept Interactions
   Mobile Navigation, Mosaic Quick Box Builder, Counter Filter & Pre-Order Form
   ========================================================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'cafeNossaQuickBuilder';

  /* 1. Keyboard-Accessible Mobile Navigation */
  var navToggle = document.querySelector('.nav-toggle');
  var siteNav = document.getElementById('primary-nav');

  function closeMobileNav(returnFocus) {
    if (!navToggle || !siteNav) return;
    siteNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    if (returnFocus) {
      navToggle.focus();
    }
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
    var stepButtons = quickBuilderForm.querySelectorAll('[data-qty-step]');

    stepButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!qbQtyInput) return;
        var delta = parseInt(btn.getAttribute('data-qty-step'), 10) || 0;
        var current = parseInt(qbQtyInput.value, 10);
        if (isNaN(current)) current = 1;
        var next = Math.min(50, Math.max(1, current + delta));
        qbQtyInput.value = String(next);
      });
    });

    quickBuilderForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var checkedPreset = quickBuilderForm.querySelector('input[name="preset"]:checked');
      var presetVal = checkedPreset ? checkedPreset.value : 'nata6';
      var qtyVal = qbQtyInput ? parseInt(qbQtyInput.value, 10) : 1;
      if (isNaN(qtyVal) || qtyVal < 1) qtyVal = 1;
      if (qtyVal > 50) qtyVal = 50;

      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ preset: presetVal, qty: qtyVal, ts: Date.now() })
        );
      } catch (e) {
        /* Ignore storage errors in private browsing */
      }

      var targetUrl =
        'boxes-preorder.html?preset=' +
        encodeURIComponent(presetVal) +
        '&qty=' +
        encodeURIComponent(String(qtyVal)) +
        '#preorder-form';
      window.location.href = targetUrl;
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

    function updateSummary() {
      var selectedBox = preorderForm.querySelector('input[name="box_type"]:checked');
      var dateInput = document.getElementById('collection-date');
      var timeSelect = document.getElementById('collection-time');

      if (summaryBox && selectedBox) {
        summaryBox.textContent = selectedBox.value;
      }
      if (summarySize && sizeSelect && sizeSelect.selectedIndex >= 0) {
        summarySize.textContent = sizeSelect.options[sizeSelect.selectedIndex].text.split(' (')[0];
      }
      if (summaryQty && qtyInput) {
        summaryQty.textContent = (qtyInput.value || '1') + ' box(es)';
      }
      if (summaryDate && dateInput) {
        summaryDate.textContent = dateInput.value ? dateInput.value : 'Select date';
      }
      if (summaryWindow && timeSelect) {
        summaryWindow.textContent = timeSelect.value
          ? timeSelect.options[timeSelect.selectedIndex].text.split(' [')[0]
          : 'Select window';
      }
    }

    function applyPresetSelection(preset, qty) {
      var applied = false;
      var presetMap = {
        nata6: {
          radioId: 'box-type-nata',
          tierValue: 'Box of 6 Nata / Small Sharing'
        },
        nata: {
          radioId: 'box-type-nata',
          tierValue: 'Box of 6 Nata / Small Sharing'
        },
        nata12: {
          radioId: 'box-type-nata',
          tierValue: 'Box of 12 Office Box / Medium Hosting'
        },
        grazing: {
          radioId: 'box-type-grazing',
          tierValue: 'Box of 12 Office Box / Medium Hosting'
        },
        gift: {
          radioId: 'box-type-gift',
          tierValue: 'Box of 6 Nata / Small Sharing'
        }
      };

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

      if (applied && prefillNotice) {
        prefillNotice.hidden = false;
      }
    }

    /* Pre-populate from URL params (?preset=nata6|nata12|grazing&qty=2) or localStorage */
    try {
      var params = new URLSearchParams(window.location.search);
      var urlPreset = params.get('preset') || params.get('box');
      var urlQty = params.get('qty');

      if (urlPreset || urlQty) {
        applyPresetSelection(urlPreset, urlQty);
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch (err) {
          /* Ignore */
        }
      } else {
        var rawStored = window.localStorage.getItem(STORAGE_KEY);
        if (rawStored) {
          var parsedStored = JSON.parse(rawStored);
          if (parsedStored && parsedStored.ts && Date.now() - parsedStored.ts < 600000) {
            applyPresetSelection(parsedStored.preset, parsedStored.qty);
          }
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (e) {
      /* Safe fallback */
    }

    preorderForm.addEventListener('change', updateSummary);
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
      field.addEventListener('blur', function () {
        validateField(field);
      });
      field.addEventListener('input', function () {
        if (field.getAttribute('aria-invalid') === 'true') {
          validateField(field);
        }
      });
    });

    preorderForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var firstInvalid = null;

      requiredFields.forEach(function (field) {
        var valid = validateField(field);
        if (!valid && !firstInvalid) {
          firstInvalid = field;
        }
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
        feedbackBox.hidden = false;
        feedbackBox.className = 'form-feedback is-success';
        feedbackBox.textContent = 'Demo only – in the live site this would go straight to Cafe Nossa.';
        feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
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
      if (cs.position === 'static') {
        hdr.style.position = 'relative';
      }
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

    // 2. Choreographed Below-the-Fold Scroll Reveals (Godly / SiteInspire)
    if (!reduced && 'IntersectionObserver' in window) {
      var targets = document.querySelectorAll('.mosaic-tile, .menu-tile-card, .box-tier-card, .iberian-card, .visit-tile');
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });

      var vh = window.innerHeight || 800;
      var staggerIdx = 0;
      targets.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top > vh * 0.94) {
          el.style.setProperty('--reveal-delay', ((staggerIdx % 3) * 55) + 'ms');
          staggerIdx++;
          el.classList.add('reveal-ready');
          obs.observe(el);
        }
      });

      // Safety fallback on hash jump so targeted sections reveal immediately
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
      if (!input.min) {
        input.min = todayIso;
      }
      var fieldWrap = input.parentElement;
      if (!fieldWrap || fieldWrap.querySelector('[data-friday-chips]') || fieldWrap.querySelector('.quick-date-chips')) {
        return;
      }
      var isReturn = input.id === 'return-date';
      var chipRow = document.createElement('div');
      chipRow.className = 'quick-date-chips';
      chipRow.setAttribute('aria-label', 'Quick date options');

      var presets = [];
      if (isReturn) {
        presets = [
          { label: 'Same Day', calc: function () { var o = document.getElementById('outbound-date'); return (o && o.value) ? o.value : todayIso; } },
          { label: '+2 Days', calc: function () {
            var o = document.getElementById('outbound-date');
            var base = (o && o.value) ? new Date(o.value + 'T12:00:00') : today;
            return toIso(new Date(base.getFullYear(), base.getMonth(), base.getDate() + 2));
          } }
        ];
      } else {
        var tmrw = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        var fri = today.getDay() === 5 ? today : nextWeekday(today, 5);
        var sat = today.getDay() === 6 ? today : nextWeekday(today, 6);
        presets = [
          { label: 'Tomorrow', iso: toIso(tmrw) },
          { label: (today.getDay() === 5 ? 'Tonight (Fri)' : 'This Friday'), iso: toIso(fri) },
          { label: (today.getDay() === 6 ? 'Today (Sat)' : 'This Saturday'), iso: toIso(sat) }
        ];
      }

      presets.forEach(function (p) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quick-date-chip';
        btn.textContent = p.label;
        btn.addEventListener('click', function () {
          var val = p.calc ? p.calc() : p.iso;
          input.value = val;
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
