/* ==========================================================================
   Cafe Nossa — Concept B Interactions
   Snap Counter & Dots, Scroll Progress, 1-Tap Presets, Tart Tray, Lightbox & Ticket
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
  var header = document.querySelector('.editorial-header');
  if (header && !header.querySelector('.scroll-progress-rail')) {
    var rail = document.createElement('div');
    rail.className = 'scroll-progress-rail';
    rail.setAttribute('aria-hidden', 'true');
    header.appendChild(rail);
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

  /* 1. Horizontal Touch-Snap Showcase Controls + Live Counter + Dots */
  var snapRail = document.getElementById('showcase-rail');
  var snapBtns = document.querySelectorAll('[data-snap-dir]');
  var snapCounter = document.getElementById('showcase-counter');
  var snapDotsHost = document.getElementById('showcase-dots');

  if (snapRail) {
    var cards = Array.prototype.slice.call(snapRail.querySelectorAll('.snap-card'));
    var totalCards = cards.length;
    var dotBtns = [];

    function pad2(n) {
      return n < 10 ? '0' + n : String(n);
    }

    if (snapDotsHost && totalCards > 0) {
      cards.forEach(function (_, idx) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'snap-dot' + (idx === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', 'Go to showcase card ' + (idx + 1) + ' of ' + totalCards);
        dot.addEventListener('click', function () {
          var targetCard = cards[idx];
          if (targetCard) {
            snapRail.scrollTo({ left: targetCard.offsetLeft - snapRail.offsetLeft, behavior: 'smooth' });
          }
        });
        snapDotsHost.appendChild(dot);
        dotBtns.push(dot);
      });
    }

    function syncSnapState() {
      if (!totalCards) return;
      var scrollLeft = snapRail.scrollLeft;
      var maxScroll = snapRail.scrollWidth - snapRail.clientWidth;
      var activeIdx = 0;

      if (maxScroll > 10 && scrollLeft >= maxScroll - 12) {
        activeIdx = totalCards - 1;
      } else {
        var bestDist = Infinity;
        cards.forEach(function (card, idx) {
          var dist = Math.abs((card.offsetLeft - snapRail.offsetLeft) - scrollLeft);
          if (dist < bestDist) {
            bestDist = dist;
            activeIdx = idx;
          }
        });
      }

      if (snapCounter) {
        snapCounter.textContent = pad2(activeIdx + 1) + ' / ' + pad2(totalCards);
      }
      dotBtns.forEach(function (d, i) {
        d.classList.toggle('is-active', i === activeIdx);
      });
    }

    snapBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var dir = parseInt(btn.getAttribute('data-snap-dir'), 10) || 1;
        var card = cards[0];
        var step = card ? card.getBoundingClientRect().width + 16 : 300;
        snapRail.scrollBy({ left: dir * step, behavior: 'smooth' });
      });
    });

    var snapTick = false;
    snapRail.addEventListener('scroll', function () {
      if (!snapTick) {
        snapTick = true;
        window.requestAnimationFrame(function () {
          syncSnapState();
          snapTick = false;
        });
      }
    }, { passive: true });
    syncSnapState();
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

  /* 3. Tap-Counter Nata Box & Grazing Platter Composer + 1-Tap Presets + Tart Visualizer */
  var catalog = {
    nata6: { label: 'Box of 6 Pastéis de Nata', qty: 1 },
    nata12: { label: 'Box of 12 Office Nata Box', qty: 0 },
    platter: { label: 'Iberian Cheese & Charcuterie Platter', qty: 0 },
    hamper: { label: 'Portuguese Deli & Wine Gift Hamper', qty: 0 }
  };

  var trayBreakdown = document.getElementById('tray-breakdown');
  var summaryInput = document.getElementById('b-composed-summary');
  var countBadges = document.querySelectorAll('[data-total-count]');
  var nataTrayCard = document.getElementById('b-nata-tray');
  var presetChips = document.querySelectorAll('[data-b-preset]');

  function renderCustardTray() {
    if (!nataTrayCard) return;
    var slotsHost = nataTrayCard.querySelector('[data-tart-slots]');
    var titleEl = nataTrayCard.querySelector('[data-tray-label]');
    var badgeEl = nataTrayCard.querySelector('[data-tray-count]');
    if (!slotsHost) return;

    var totalTarts = catalog.nata6.qty * 6 + catalog.nata12.qty * 12;
    var deliBoards = catalog.platter.qty + catalog.hamper.qty;
    var filledTarts = Math.min(12, totalTarts);
    var filledDeli = totalTarts === 0 ? Math.min(12, deliBoards * 6) : 0;

    if (totalTarts > 0) {
      if (titleEl) {
        titleEl.textContent = deliBoards > 0
          ? 'Bakehouse Tart Tray + Iberian Deli Selection'
          : 'Bakehouse Custard Tart Box Tray';
      }
      if (badgeEl) {
        badgeEl.textContent = totalTarts + ' golden tarts' + (deliBoards > 0 ? ' + ' + deliBoards + ' deli' : '');
      }
    } else if (deliBoards > 0) {
      if (titleEl) titleEl.textContent = 'Artisan Iberian Deli & Grazing Tray';
      if (badgeEl) badgeEl.textContent = deliBoards + (deliBoards === 1 ? ' platter / hamper' : ' platters / hampers');
    } else {
      if (titleEl) titleEl.textContent = 'Tap + or a preset above to fill your tray';
      if (badgeEl) badgeEl.textContent = '0 items';
    }

    slotsHost.innerHTML = '';
    for (var i = 0; i < 12; i++) {
      var s = document.createElement('span');
      s.className = 'b-tart-slot';
      if (i < filledTarts) {
        s.classList.add('is-filled');
      } else if (i < filledDeli) {
        s.classList.add('is-deli');
      }
      slotsHost.appendChild(s);
    }
  }

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

    renderCustardTray();
  }

  presetChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var preset = chip.getAttribute('data-b-preset');
      presetChips.forEach(function (c) { c.classList.toggle('is-active', c === chip); });
      if (preset === 'office12') {
        catalog.nata6.qty = 0;
        catalog.nata12.qty = 1;
        catalog.platter.qty = 0;
        catalog.hamper.qty = 0;
        showMicroToast('🥐 Preset loaded: Office Box of 12 Natas');
      } else if (preset === 'grazing') {
        catalog.nata6.qty = 0;
        catalog.nata12.qty = 0;
        catalog.platter.qty = 1;
        catalog.hamper.qty = 0;
        showMicroToast('🧀 Preset loaded: Weekend Iberian Grazing Platter');
      } else if (preset === 'family6') {
        catalog.nata6.qty = 1;
        catalog.nata12.qty = 0;
        catalog.platter.qty = 0;
        catalog.hamper.qty = 1;
        showMicroToast('☕ Preset loaded: Family 6-Pack + Deli Selection');
      }
      syncComposerUI();
    });
  });

  document.querySelectorAll('[data-step-item]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-step-item');
      var delta = parseInt(btn.getAttribute('data-delta'), 10) || 0;
      if (!catalog[key]) return;
      catalog[key].qty = Math.min(30, Math.max(0, catalog[key].qty + delta));
      presetChips.forEach(function (c) { c.classList.remove('is-active'); });
      syncComposerUI();
      showMicroToast(catalog[key].qty + ' × ' + catalog[key].label);
    });
  });

  document.querySelectorAll('[data-quick-add]').forEach(function (link) {
    link.addEventListener('click', function () {
      var key = link.getAttribute('data-quick-add');
      if (catalog[key]) {
        catalog[key].qty = Math.min(30, catalog[key].qty + 1);
        syncComposerUI();
        showMicroToast('Added ' + catalog[key].label + ' to tray');
      }
    });
  });

  document.querySelectorAll('[data-open-drawer]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var drawer = document.getElementById('preorder-drawer');
      if (drawer) drawer.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
          showMicroToast('Collection date set: ' + preset.label);
        });
        chipHost.appendChild(chip);
      });
    }
  }

  /* 5. Client-Side Pre-Order Form Validation & Live Digital Enquiry Ticket */
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
        var composedVal = (summaryInput ? summaryInput.value : '').trim();
        var colDate = (dateInput ? dateInput.value : '').trim();
        var winEl = document.getElementById('b-collection-window');
        var colWin = winEl && winEl.value ? winEl.value : '';
        var wineEl = document.getElementById('b-wine-pairing');
        var wineVal = wineEl ? wineEl.value : 'None';
        var notesVal = ((document.getElementById('b-notes') || {}).value || '').trim() || 'None specified';
        var nameVal = ((document.getElementById('b-name') || {}).value || '').trim();
        var phoneVal = ((document.getElementById('b-phone') || {}).value || '').trim();
        var emailVal = ((document.getElementById('b-email') || {}).value || '').trim();
        var refCode = 'CN-B-' + String(Math.floor(1000 + Math.random() * 9000));

        var plainSummary = [
          'Cafe Nossa — Pre-Order Enquiry (' + refCode + ')',
          'Customer: ' + nameVal,
          'Contact: ' + phoneVal + ' | ' + emailVal,
          'Collection: ' + colDate + ' (' + colWin + ') at 109 High Street, Yarm TS15 9BB',
          'Tray Selection: ' + composedVal,
          'Wine Pairing: ' + wineVal,
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
        addTicketRow(dl, 'Composed Tray', composedVal);
        addTicketRow(dl, 'Wine Advice', wineVal);
        addTicketRow(dl, 'Notes', notesVal);
        ticket.appendChild(dl);

        var actions = document.createElement('div');
        actions.className = 'ticket-actions';

        var copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'btn btn-ochre';
        copyBtn.textContent = 'Copy Summary';
        copyBtn.addEventListener('click', function () {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(plainSummary).then(function () {
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
        resetBtn.className = 'btn btn-cream-ghost';
        resetBtn.textContent = 'Reset Demo';
        resetBtn.addEventListener('click', function () {
          form.reset();
          catalog.nata6.qty = 1;
          catalog.nata12.qty = 0;
          catalog.platter.qty = 0;
          catalog.hamper.qty = 0;
          presetChips.forEach(function (c) { c.classList.remove('is-active'); });
          if (chipHost) {
            chipHost.querySelectorAll('.quick-chip').forEach(function (c) { c.classList.remove('is-selected'); });
          }
          requiredEls.forEach(function (el) { setError(el, ''); });
          feedback.hidden = true;
          feedback.innerHTML = '';
          syncComposerUI();
          showMicroToast('Demo form reset');
        });

        actions.appendChild(copyBtn);
        actions.appendChild(resetBtn);
        ticket.appendChild(actions);
        feedback.appendChild(ticket);

        feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  /* 6. Native <dialog> Photo Lightbox */
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

  /* 7. Frosted Floating Dock Auto-Clearance on Form & Footer */
  var dock = document.querySelector('.floating-pill-dock');
  if (dock && 'IntersectionObserver' in window) {
    var targets = [];
    if (form) targets.push(form);
    var footerEl = document.querySelector('footer');
    if (footerEl) targets.push(footerEl);

    if (targets.length) {
      var visibleSet = new Set();
      var dockObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) visibleSet.add(entry.target);
          else visibleSet.delete(entry.target);
        });
        dock.classList.toggle('is-dock-hidden', visibleSet.size > 0);
      }, { threshold: 0.06 });

      targets.forEach(function (t) { dockObserver.observe(t); });
    }
  }
})();
