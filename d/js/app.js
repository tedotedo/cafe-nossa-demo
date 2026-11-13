/* Cafe Nossa — Concept D: Fresh from the oven (demo only) */
(function () {
  'use strict';

  /* Illustrative "baked today" count that grows through the day */
  var now = new Date();
  var hours = Math.min(Math.max(now.getHours() + now.getMinutes() / 60 - 7, 0), 9);
  document.querySelector('[data-baked]').textContent = Math.round(hours * 24);

  /* Box size → tray of natas */
  var tray = document.querySelector('[data-tray]');
  var size = 12;
  function fill() {
    tray.textContent = '';
    tray.style.setProperty('--cols', size === 6 ? 3 : size === 12 ? 4 : 6);
    for (var i = 0; i < size; i++) {
      var n = document.createElement('i');
      n.className = 'nata';
      n.style.animationDelay = (i * 25) + 'ms';
      n.style.transform = 'rotate(' + (i * 47 % 360) + 'deg)';
      tray.appendChild(n);
    }
  }
  var sizes = document.querySelectorAll('[data-size]');
  Array.prototype.forEach.call(sizes, function (b) {
    b.addEventListener('click', function () {
      size = parseInt(b.getAttribute('data-size'), 10);
      Array.prototype.forEach.call(sizes, function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      fill();
    });
  });
  fill();

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  document.getElementById('o-date').min = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());

  var form = document.querySelector('[data-order]');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements, err = document.querySelector('[data-order-error]'), done = document.querySelector('[data-order-done]');
    if (!f.date.value || !f.name.value.trim() || !f.phone.value.trim()) { err.hidden = false; done.hidden = true; return; }
    err.hidden = true; done.hidden = false;
    var d = new Date(f.date.value + 'T12:00:00');
    done.textContent = 'Box of ' + size + ' for ' + d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) +
      (f.weekly.checked ? ', then every Friday' : '') + '. Demo only, nothing has been sent.';
  });

  /* Stamp card (kept in this browser only, when storage is available) */
  var KEY = 'nossa-stamps-d', stamps = 0;
  try { stamps = parseInt(localStorage.getItem(KEY) || '0', 10) || 0; } catch (e) { stamps = 0; }
  var grid = document.querySelector('[data-stamps]');
  function drawStamps() {
    grid.textContent = '';
    for (var i = 1; i <= 9; i++) {
      var li = document.createElement('li');
      if (i === 9) { li.className = 'is-free'; li.textContent = 'Free'; }
      else if (i <= stamps) { li.className = 'is-on'; li.innerHTML = '<i class="nata"></i>'; }
      else li.textContent = i;
      grid.appendChild(li);
    }
    document.querySelector('[data-stamp-count]').textContent = Math.min(stamps, 8) + ' / 8';
    document.querySelector('[data-stamp-msg]').textContent =
      stamps >= 8 ? 'Card full. The next one is on the house.' : (8 - stamps) + ' to go, then one on the house.';
    try { localStorage.setItem(KEY, String(stamps)); } catch (e) { /* private mode */ }
  }
  document.querySelector('[data-stamp-add]').addEventListener('click', function () { if (stamps < 8) stamps++; drawStamps(); });
  document.querySelector('[data-stamp-reset]').addEventListener('click', function () { stamps = 0; drawStamps(); });
  drawStamps();
})();
