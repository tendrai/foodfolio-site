// The walk: a looping, seekable timeline. Data lives in walk-data.js; styles in css/the-walk.css.
(function () {
  'use strict';
  var D = window.WALK_DATA;
  if (!D) { document.getElementById('walk').textContent = 'walkData missing: rebuild preview.html with gen_data.py'; return; }
  var T = D.timing;
  var N = D.points.length;

  // ---------- Timeline (same rule as the React component) ----------
  function buildSteps() {
    var steps = [];
    steps.push({ at: T.rest, type: 'light', n: 1 });
    var r = T.firstReading;
    steps.push({ at: r, type: 'show', n: 1 });
    for (var k = 2; k <= N; k++) {
      var prevRed = D.points[k - 2].state === 'today';
      var b = r + T.beat - T.draw - T.settle + (prevRed ? T.redHold : 0);
      steps.push({ at: b, type: 'draw', seg: k - 1 });
      steps.push({ at: b + T.draw, type: 'light', n: k });
      r = b + T.draw + T.settle;
      steps.push({ at: r, type: 'show', n: k });
    }
    steps.push({ at: T.done, type: 'done' });
    steps.push({ at: T.resetStart, type: 'fade' });
    steps.sort(function (a, b) { return a.at - b.at; });
    return steps;
  }
  function initialState() {
    return { phase: 'rest', lit: {}, shown: {}, drawn: {}, ring: 0, pulse: 0 };
  }
  function reduce(s, step) {
    var n = { phase: s.phase, lit: Object.assign({}, s.lit), shown: Object.assign({}, s.shown), drawn: Object.assign({}, s.drawn), ring: s.ring, pulse: 0 };
    if (step.type === 'light') { n.lit[step.n] = true; n.ring = step.n; n.phase = 'walk'; }
    else if (step.type === 'show') { n.shown[step.n] = true; if (D.points[step.n - 1].state === 'today') n.pulse = step.n; }
    else if (step.type === 'draw') { n.drawn[step.seg] = true; }
    else if (step.type === 'done') { n.phase = 'done'; n.ring = 0; }
    else if (step.type === 'fade') { n.phase = 'fade'; }
    return n;
  }
  function countLine() {
    var c = { points: N, pass: 0, week: 0, today: 0 };
    D.points.forEach(function (p) { c[p.state]++; });
    return D.countFormat.replace(/\{(\w+)\}/g, function (_, k) { return c[k]; });
  }

  // ---------- DOM ----------
  var root = document.getElementById('walk');
  root.className = 'walk';
  root.setAttribute('role', 'img');
  root.setAttribute('aria-label', D.ariaLabel);
  root.setAttribute('data-mode', 'row');
  root.setAttribute('data-phase', 'rest');

  var html = '';
  html += '<div class="walk-scaler"><div class="walk-frame">';
  html += '<div class="walk-head"><div class="walk-titles"><h3 class="walk-title"></h3><div class="walk-sub"><span class="walk-sub-rest"></span><span class="walk-sub-count"></span></div></div>';
  html += '<div class="walk-key">' + D.key.map(function (k) { return '<span><i class="walk-dot" data-state="' + k.state + '"></i>' + esc(k.label) + '</span>'; }).join('') + '</div></div>';
  html += '<div class="walk-route"><svg class="walk-path" aria-hidden="true"></svg><div class="walk-points">';
  D.points.forEach(function (p) {
    html += '<div class="walk-point" data-n="' + p.n + '" data-state="' + p.state + '">';
    html += '<svg class="walk-icon" viewBox="0 0 40 28" aria-hidden="true">' + D.icons[p.icon] + '</svg>';
    html += '<div class="walk-node">' + p.n + '</div>';
    html += '<div class="walk-label"></div>';
    html += '<div class="walk-reading"><i class="walk-dot" data-state="' + p.state + '"></i><span></span></div>';
    html += '</div>';
  });
  html += '</div></div></div></div>';
  html += '<div class="walk-control"><button type="button" class="walk-pause" aria-pressed="false">Pause</button></div>';
  root.innerHTML = html;
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  root.querySelector('.walk-title').textContent = D.title;
  root.querySelector('.walk-sub-rest').textContent = D.subtitle;
  root.querySelector('.walk-sub-count').textContent = countLine();
  var pointEls = Array.prototype.slice.call(root.querySelectorAll('.walk-point'));
  pointEls.forEach(function (el, i) {
    el.querySelector('.walk-label').textContent = D.points[i].label;
    el.querySelector('.walk-reading span').textContent = D.points[i].reading.replace(/-/g, '\u2011');
  });
  var svg = root.querySelector('.walk-path');
  var route = root.querySelector('.walk-route');
  var pointsEl = root.querySelector('.walk-points');
  var segRest = [], segLit = [];
  var NS = 'http://www.w3.org/2000/svg';
  for (var i = 1; i < N; i++) {
    var a = document.createElementNS(NS, 'path'); a.setAttribute('class', 'walk-seg-rest'); svg.appendChild(a); segRest.push(a);
    var b = document.createElementNS(NS, 'path'); b.setAttribute('class', 'walk-seg-lit'); b.setAttribute('pathLength', '1'); b.setAttribute('data-seg', String(i)); svg.appendChild(b); segLit.push(b);
  }

  // ---------- Layout: mode, scale, path geometry ----------
  var mode = 'row';
  function centre(el) {
    var point = el.parentNode;
    return { x: pointsEl.offsetLeft + point.offsetLeft + el.offsetLeft + el.offsetWidth / 2,
             y: pointsEl.offsetTop + point.offsetTop + el.offsetTop + el.offsetHeight / 2 };
  }
  function layout() {
    var w = root.clientWidth;
    var m = w > 900 ? 'row' : (w >= 600 ? 'grid' : 'list');
    if (m !== mode) { mode = m; root.setAttribute('data-mode', m); }
    if (m === 'row') root.style.setProperty('--walk-scale', String(w / 1200)); else root.style.removeProperty('--walk-scale');
    var W = route.clientWidth, H = route.clientHeight;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var c = pointEls.map(function (el) { return centre(el.querySelector('.walk-node')); });
    for (var i = 0; i < N - 1; i++) {
      var p = c[i], q = c[i + 1], d;
      if (m === 'grid' && i === 3) {
        // Return route between the rows, hugging the frame padding so it crosses no text or icon
        var rowOneBottom = 0, rowTwoTop = Infinity;
        pointEls.forEach(function (el, j) {
          var top = pointsEl.offsetTop + el.offsetTop, bottom = top + el.offsetHeight;
          if (j < 4) rowOneBottom = Math.max(rowOneBottom, bottom); else rowTwoTop = Math.min(rowTwoTop, top);
        });
        var ym = (rowOneBottom + rowTwoTop) / 2, xR = W + 14, xL = -14;
        d = 'M' + p.x + ' ' + p.y + ' L' + xR + ' ' + p.y + ' L' + xR + ' ' + ym + ' L' + xL + ' ' + ym + ' L' + xL + ' ' + q.y + ' L' + q.x + ' ' + q.y;
      } else {
        d = 'M' + p.x + ' ' + p.y + ' L' + q.x + ' ' + q.y;
      }
      segRest[i].setAttribute('d', d);
      segLit[i].setAttribute('d', d);
    }
  }

  // ---------- Render ----------
  var state = initialState();
  function render(s) {
    root.setAttribute('data-phase', s.phase);
    pointEls.forEach(function (el, i) {
      var n = i + 1;
      el.setAttribute('data-lit', s.lit[n] ? 'true' : 'false');
      el.setAttribute('data-shown', s.shown[n] ? 'true' : 'false');
      el.setAttribute('data-ring', s.ring === n ? 'true' : 'false');
      el.querySelector('.walk-reading .walk-dot').setAttribute('data-pulse', s.pulse === n ? 'true' : 'false');
    });
    segLit.forEach(function (el, i) { el.setAttribute('data-drawn', s.drawn[i + 1] ? 'true' : 'false'); });
  }

  // ---------- Clock ----------
  var steps = buildSteps();
  var elapsed = 0, cursor = 0, last = 0, raf = 0;
  var playing = false, paused = false, onScreen = true, pageVisible = !document.hidden;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function applyInstant(fn) {
    root.classList.add('is-seeking');
    fn();
    void root.offsetWidth;
    requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.remove('is-seeking'); }); });
  }
  function seek(t) {
    applyInstant(function () {
      state = initialState(); cursor = 0;
      while (cursor < steps.length && steps[cursor].at <= t) { state = reduce(state, steps[cursor]); cursor++; }
      state.pulse = 0;
      render(state);
    });
    elapsed = t;
  }
  function tick(now) {
    if (!playing) return;
    var dt = Math.min(now - last, 100); last = now;
    elapsed += dt;
    if (elapsed >= T.loop) {
      elapsed -= T.loop;
      applyInstant(function () { state = initialState(); cursor = 0; render(state); });
    }
    while (cursor < steps.length && steps[cursor].at <= elapsed) {
      state = reduce(state, steps[cursor]); cursor++; render(state);
    }
    raf = requestAnimationFrame(tick);
  }
  function update() {
    var should = !paused && onScreen && pageVisible && !reduced && !seekOnly;
    if (should && !playing) { playing = true; last = performance.now(); raf = requestAnimationFrame(tick); }
    if (!should && playing) { playing = false; cancelAnimationFrame(raf); }
  }

  var btn = root.querySelector('.walk-pause');
  btn.addEventListener('click', function () {
    paused = !paused;
    btn.textContent = paused ? 'Play' : 'Pause';
    btn.setAttribute('aria-pressed', paused ? 'true' : 'false');
    update();
  });
  document.addEventListener('visibilitychange', function () { pageVisible = !document.hidden; update(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) { onScreen = entries[0].isIntersecting; update(); }, { threshold: 0.25 }).observe(root);
  }
  if ('ResizeObserver' in window) new ResizeObserver(layout).observe(root); else window.addEventListener('resize', layout);

  // ---------- Start ----------
  var params = new URLSearchParams(location.search);
  var seekOnly = params.has('t');
  layout();
  requestAnimationFrame(layout);
  if (seekOnly) {
    seek(parseInt(params.get('t'), 10) || 0);
    paused = true; btn.textContent = 'Play'; btn.setAttribute('aria-pressed', 'true');
    btn.addEventListener('click', function () { seekOnly = false; }, { once: true });
  } else if (reduced) {
    seek(T.hold);
  } else {
    render(state);
    update();
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
})();
