/* ==========================================================================
   Cafe Nossa — Client-Side Concept Interactions
   Mobile Navigation, Counter Filter & Accessible Pre-Order Demo Form
   ========================================================================== */

(function () {
  'use strict';

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

  /* 2. Menu & Deli Counter Filter Buttons (menu-deli.html) */
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
          if (target === 'all' || category === target) {
            block.hidden = false;
          } else {
            block.hidden = true;
          }
        });
      });
    });
  }

  /* 3. Grazing Platter & Pastry Box Pre-Order Form (boxes-preorder.html) */
  var preorderForm = document.getElementById('preorder-form');
  if (preorderForm) {
    var summaryBox = document.getElementById('sum-box-type');
    var summarySize = document.getElementById('sum-box-size');
    var summaryQty = document.getElementById('sum-box-qty');
    var summaryDate = document.getElementById('sum-collection-date');
    var summaryWindow = document.getElementById('sum-collection-window');
    var feedbackBox = document.getElementById('form-feedback');

    function updateSummary() {
      var selectedBox = preorderForm.querySelector('input[name="box_type"]:checked');
      var sizeSelect = document.getElementById('box-size');
      var qtyInput = document.getElementById('box-qty');
      var dateInput = document.getElementById('collection-date');
      var timeSelect = document.getElementById('collection-time');

      if (summaryBox && selectedBox) {
        summaryBox.textContent = selectedBox.value;
      }
      if (summarySize && sizeSelect) {
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

    preorderForm.addEventListener('change', updateSummary);
    preorderForm.addEventListener('input', updateSummary);
    updateSummary();

    /* Pre-select box type from URL param if linked from cards (?box=nata|grazing|gift) */
    try {
      var params = new URLSearchParams(window.location.search);
      var boxParam = params.get('box');
      if (boxParam) {
        var map = {
          nata: 'box-type-nata',
          grazing: 'box-type-grazing',
          gift: 'box-type-gift'
        };
        var radioId = map[boxParam];
        var radioEl = radioId ? document.getElementById(radioId) : null;
        if (radioEl) {
          radioEl.checked = true;
          updateSummary();
        }
      }
    } catch (e) {
      /* Ignore URL parsing issues in older browsers */
    }

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
