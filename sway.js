/* SWAY Oakville concept: one day at the lake, with the shop. Shop + bag, today's sunset, the sun clock, the light,
   the prints, golden hour, and WebGL glints and fireflies. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement, body = doc.body;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var G = window.gsap, ST = window.ScrollTrigger, FL = window.Flip;
  if (G && ST) G.registerPlugin(ST);
  if (G && FL) G.registerPlugin(FL);
  var motion = !reduce && !!G && !!ST;
  root.classList.toggle('motion', motion);
  var params = new URLSearchParams(location.search);
  var FREEZE = params.has('t') ? parseFloat(params.get('t')) || 0 : null;
  var money = function (n) { return '$' + n.toLocaleString('en-CA'); };

  /* ------------------------------------------------------------------ the shop */
  var cards = Array.prototype.slice.call(doc.querySelectorAll('.card'));
  var byId = {};
  cards.forEach(function (card) {
    var id = card.dataset.id, name = card.querySelector('h3').textContent, price = +card.dataset.price;
    var colours = (card.dataset.colours || '').split('|').filter(Boolean).map(function (c) { var p = c.split(':'); return { n: p[0], c: p[1] }; });
    var sizes = (card.dataset.sizes || '').split(' ').filter(Boolean);
    var st = { id: id, name: name, price: price, img: card.querySelector('img').getAttribute('src'), colour: 0, size: null, sizes: sizes, colours: colours, card: card };
    byId[id] = st;
    var opts = doc.createElement('div'); opts.className = 'opts';
    if (colours.length > 1) {
      var sw = doc.createElement('div'); sw.className = 'sw'; sw.setAttribute('role', 'radiogroup'); sw.setAttribute('aria-label', name + ' colour');
      colours.forEach(function (c, i) {
        var b = doc.createElement('button'); b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', i === 0); b.setAttribute('aria-label', c.n); b.title = c.n;
        b.style.setProperty('--c', c.c);
        b.addEventListener('click', function () { st.colour = i; sw.querySelectorAll('button').forEach(function (x, k) { x.setAttribute('aria-checked', k === i); }); });
        sw.appendChild(b);
      });
      opts.appendChild(sw);
    }
    var add = doc.createElement('button'); add.type = 'button'; add.className = 'btn add'; add.textContent = 'Add to bag';
    add.setAttribute('aria-label', 'Add ' + name + ' to bag');
    if (sizes.length) {
      var sz = doc.createElement('div'); sz.className = 'sz'; sz.setAttribute('role', 'radiogroup'); sz.setAttribute('aria-label', name + ' size');
      sizes.forEach(function (s) {
        var b = doc.createElement('button'); b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', 'false'); b.textContent = s;
        b.addEventListener('click', function () {
          st.size = s; sz.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-checked', x === b); });
          add.classList.remove('need'); add.textContent = 'Add to bag';
        });
        sz.appendChild(b);
      });
      opts.appendChild(sz); st.sz = sz;
    }
    add.addEventListener('click', function () {
      if (st.sizes.length && !st.size) {
        add.classList.add('need'); add.textContent = 'Pick a size first';
        if (G && !reduce) G.fromTo(st.sz, { x: -6 }, { x: 0, duration: 0.5, ease: 'elastic.out(1.2, 0.3)' });
        st.sz.querySelector('button').focus();
        return;
      }
      addLine(st);
      hearts(add);
      add.textContent = 'Added';
      setTimeout(function () { add.textContent = 'Add to bag'; }, 1300);
    });
    if (opts.childNodes.length) card.appendChild(opts);
    card.appendChild(add);
  });

  // little hearts float up from a button
  function hearts(el) {
    if (!G || reduce) return;
    var r = el.getBoundingClientRect(), cols = ['#807f71', '#f7b955', '#a9cbe8', '#c9a68a'];
    for (var k = 0; k < 6; k++) {
      var h = doc.createElement('span'); h.className = 'heart';
      h.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16"><path d="M8 14S1.5 9.8 1.5 5.6A3.3 3.3 0 0 1 8 4.2a3.3 3.3 0 0 1 6.5 1.4C14.5 9.8 8 14 8 14z" fill="' + cols[k % 4] + '"/></svg>';
      h.style.left = (r.left + r.width / 2) + 'px'; h.style.top = r.top + 'px'; body.appendChild(h);
      G.fromTo(h, { y: 0, x: 0, scale: 0.4, opacity: 1, rotation: 0 }, { y: -60 - Math.random() * 50, x: (Math.random() - 0.5) * 90, scale: 1 + Math.random() * 0.4, rotation: (Math.random() - 0.5) * 50, opacity: 0, duration: 1 + Math.random() * 0.4, ease: 'power2.out', onComplete: h.remove.bind(h) });
    }
  }

  // category chips, rearranged with Flip
  var chips = doc.querySelectorAll('.chip');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var cat = chip.dataset.cat;
      chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip); });
      var state = FL && !reduce ? FL.getState(cards) : null;
      cards.forEach(function (c) { c.hidden = !(cat === 'all' || c.dataset.cat === cat); });
      if (state) FL.from(state, { duration: 0.55, ease: 'power2.inOut', scale: true, absolute: true,
        onEnter: function (els) { return G.fromTo(els, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.45 }); },
        onLeave: function (els) { return G.to(els, { opacity: 0, scale: 0.92, duration: 0.3 }); } });
      if (ST) setTimeout(function () { ST.refresh(); }, 650);
    });
  });

  /* ------------------------------------------------------------------ the bag */
  var lines = [];
  try { lines = JSON.parse(localStorage.getItem('sway-bag') || '[]') || []; } catch (e) { lines = []; }
  lines = lines.filter(function (l) { return byId[l.id]; });
  var dlg = doc.getElementById('bag'), FREE = 150;
  function save() { try { localStorage.setItem('sway-bag', JSON.stringify(lines)); } catch (e) {} }
  function addLine(st) {
    var colour = st.colours[st.colour] ? st.colours[st.colour].n : '', key = st.id + '|' + colour + '|' + (st.size || '');
    var l = lines.filter(function (x) { return x.key === key; })[0];
    if (l) l.qty++; else lines.push({ key: key, id: st.id, colour: colour, size: st.size || '', qty: 1 });
    save(); draw();
    if (G && !reduce) G.fromTo('#bagCount', { scale: 1.7 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' });
  }
  function how() { var c = doc.querySelector('input[name="how"]:checked'); return c ? c.value : 'ship'; }
  function draw() {
    var list = doc.getElementById('bagList'), count = 0, sub = 0;
    list.textContent = '';
    lines.forEach(function (l, i) {
      var st = byId[l.id]; count += l.qty; sub += st.price * l.qty;
      var li = doc.createElement('li'); li.className = 'line';
      li.innerHTML = '<img alt="" width="64" height="80"><div><p class="nm"></p><p class="vr"></p><div class="qty"><button type="button" class="m">−</button><span></span><button type="button" class="p">+</button></div></div><span class="lp"></span>';
      li.querySelector('img').src = st.img;
      li.querySelector('.nm').textContent = st.name;
      li.querySelector('.vr').textContent = [l.colour, l.size].filter(Boolean).join(', ');
      li.querySelector('.qty span').textContent = l.qty;
      li.querySelector('.lp').textContent = money(st.price * l.qty);
      li.querySelector('.m').setAttribute('aria-label', 'One less ' + st.name);
      li.querySelector('.p').setAttribute('aria-label', 'One more ' + st.name);
      li.querySelector('.m').addEventListener('click', function () { l.qty--; if (l.qty < 1) lines.splice(i, 1); save(); draw(); });
      li.querySelector('.p').addEventListener('click', function () { l.qty++; save(); draw(); });
      list.appendChild(li);
    });
    if (!lines.length) { var e = doc.createElement('li'); e.className = 'empty'; e.textContent = 'Nothing in here yet. Something sunny?'; list.appendChild(e); }
    var pickup = how() === 'pickup', ship = pickup || sub >= FREE || !sub ? 0 : 12, total = sub + ship;
    doc.getElementById('bagCount').textContent = count;
    doc.getElementById('bagTotal').textContent = money(total) + (ship ? ' (incl. $12 shipping)' : '');
    var left = FREE - sub;
    doc.getElementById('shipMsg').textContent = pickup ? 'Pick-up in Oakville is always free.' : (left > 0 ? (sub ? money(left) + ' more for free shipping.' : 'Free shipping over $150.') : 'You get free shipping.');
    doc.getElementById('shipBar').style.setProperty('--f', pickup ? 1 : Math.min(1, sub / FREE));
    doc.getElementById('held').textContent = count
      ? 'In your bag: ' + lines.map(function (l) { return byId[l.id].name + (l.qty > 1 ? ' ×' + l.qty : ''); }).join(', ') + '. ' + money(sub) + ' so far.'
      : 'Your bag is empty. Add something sunny from the shop.';
    var bodyTxt = 'Hello SWAY,\n\nI would like to order:\n' + (lines.length ? lines.map(function (l) { var s = byId[l.id]; return '- ' + l.qty + ' × ' + s.name + (l.colour || l.size ? ' (' + [l.colour, l.size].filter(Boolean).join(', ') + ')' : '') + ', ' + money(s.price * l.qty); }).join('\n') : '- (nothing yet)') +
      '\n\nTotal: ' + money(total) + (pickup ? '\nI will pick up in Oakville.' : '\nPlease ship to:') + '\n\nName:\nPhone:\n';
    doc.getElementById('checkout').href = 'mailto:shop@swayoakville.example?subject=' + encodeURIComponent('Order from the site') + '&body=' + encodeURIComponent(bodyTxt);
  }
  doc.querySelectorAll('input[name="how"]').forEach(function (r) { r.addEventListener('change', draw); });
  function openBag() { draw(); dlg.showModal(); }
  doc.getElementById('bagBtn').addEventListener('click', openBag);
  doc.getElementById('askBag').addEventListener('click', openBag);
  doc.getElementById('bagClose').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  draw();

  /* ------------------------------------------------------------------ today's sun over Oakville (NOAA) */
  var LAT = 43.447, LON = -79.666, TZ = 'America/Toronto';
  function torontoToday() { var p = {}; new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(new Date()).forEach(function (x) { p[x.type] = +x.value; }); return p; }
  function sunUTC(y, m, d) {
    var rad = Math.PI / 180, doy = (Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / 864e5, g = 2 * Math.PI / 365 * (doy - 1);
    var eq = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
    var dec = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
    var ha = Math.acos(Math.cos(90.833 * rad) / (Math.cos(LAT * rad) * Math.cos(dec)) - Math.tan(LAT * rad) * Math.tan(dec)) / rad;
    return { rise: Date.UTC(y, m - 1, d) + (720 - 4 * (LON + ha) - eq) * 6e4, set: Date.UTC(y, m - 1, d) + (720 - 4 * (LON - ha) - eq) * 6e4 };
  }
  function localMinutes(ms) { var p = {}; new Intl.DateTimeFormat('en-CA', { timeZone: TZ, hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date(ms)).forEach(function (x) { p[x.type] = +x.value; }); return p.hour * 60 + p.minute; }
  function fmt(min) { min = Math.round(min); var h = Math.floor(min / 60) % 24, m = min % 60, ap = h >= 12 ? 'pm' : 'am'; return (h % 12 || 12) + ':' + (m < 10 ? '0' : '') + m + ' ' + ap; }
  var today = torontoToday(), sun = sunUTC(today.year, today.month, today.day);
  var RISE = localMinutes(sun.rise), SET = localMinutes(sun.set);
  doc.getElementById('sunset').textContent = 'Today the sun sets over Oakville at ' + fmt(SET) + ', so golden hour starts around ' + fmt(SET - 60) + '. Bring a silk scarf.';

  /* ------------------------------------------------------------------ the sun clock */
  var hours = [
    { el: doc.getElementById('top'), min: 13 * 60, note: 'by the lake' },
    { el: doc.getElementById('shop'), min: 15 * 60, note: 'shop is open' },
    { el: doc.getElementById('golden'), min: SET - 60, note: 'golden hour' },
    { el: doc.getElementById('ask'), min: SET + 25, note: 'dusk' },
    { el: doc.getElementById('visit'), min: Math.max(SET + 80, 21 * 60), note: 'after dark' }
  ];
  if (hours[2].min < hours[1].min + 30) hours[2].min = hours[1].min + 30;
  var clockT = doc.getElementById('clockT'), clockS = doc.getElementById('clockS'), sunG = doc.getElementById('sun');
  var svg = sunG.ownerSVGElement, moon = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
  moon.setAttribute('d', 'M14 4a6 6 0 1 0 6 8a5 5 0 0 1-6-8z'); moon.setAttribute('fill', '#c9cde6'); moon.style.opacity = 0;
  svg.appendChild(moon);
  function clockAt() {
    var mid = innerHeight * 0.5, cur = hours[0].min, note = hours[0].note;
    for (var i = 0; i < hours.length; i++) {
      var r = hours[i].el.getBoundingClientRect();
      if (r.top <= mid) { var next = hours[i + 1], p = Math.min(1, Math.max(0, (mid - r.top) / Math.max(1, r.height))); cur = next ? hours[i].min + (next.min - hours[i].min) * p : hours[i].min + 30 * p; note = hours[i].note; }
    }
    clockT.textContent = fmt(cur); clockS.textContent = note;
    var f = (cur - RISE) / Math.max(1, SET - RISE);
    if (f <= 1) {
      var ff = Math.min(1, Math.max(0, f));
      sunG.setAttribute('transform', 'translate(' + (4 + 50 * ff).toFixed(1) + ' ' + (30 - 19 * Math.sin(Math.PI * ff)).toFixed(1) + ')'); sunG.style.opacity = 1; moon.style.opacity = 0;
    } else {
      var k = Math.min(1, (cur - SET) / 45);
      sunG.setAttribute('transform', 'translate(54 ' + (30 + 8 * k).toFixed(1) + ')'); sunG.style.opacity = 1 - k; moon.style.opacity = k;
    }
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { clockAt(); ticking = false; }); } }, { passive: true });
  addEventListener('resize', clockAt);
  clockAt();
  doc.getElementById('clock').addEventListener('click', function () {
    var mid = innerHeight * 0.5;
    for (var i = 0; i < hours.length; i++) if (hours[i].el.getBoundingClientRect().top > mid - 4) { hours[i].el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); return; }
    doc.getElementById('top').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });

  /* ------------------------------------------------------------------ the light of golden hour */
  var gHead = doc.getElementById('gHead');
  function lum(hex) { var n = parseInt(hex.slice(1), 16), c = [n >> 16 & 255, n >> 8 & 255, n & 255].map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
  function inkFor(bg) { gHead.style.color = '#262a44'; }
  var BUTTER = '#ffffff', GOLD = '#f7b955', ROSE = '#f39a8f', DUSK = '#efe9ff';
  function mix(a, b, t) { var x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16); return '#' + [16, 8, 0].map(function (s) { var p = x >> s & 255, q = y >> s & 255; return Math.round(p + (q - p) * t).toString(16).padStart(2, '0'); }).join(''); }
  var stops = [];
  function measure() {
    var vh = innerHeight, g = doc.getElementById('golden'), g0 = g.getBoundingClientRect().top + scrollY, L = Math.max(1, g.offsetHeight - vh);
    stops = [[0, BUTTER], [g0, BUTTER], [g0 + L * 0.3, GOLD], [g0 + L * 0.55, GOLD], [g0 + L * 0.78, ROSE], [g0 + L * 0.98, DUSK]];
  }
  function light() {
    if (!root.classList.contains('drift') || !stops.length) return;
    var y = scrollY, c = stops[stops.length - 1][1];
    for (var i = 0; i < stops.length - 1; i++) if (y <= stops[i + 1][0]) { var a = stops[i], b = stops[i + 1]; c = mix(a[1], b[1], b[0] > a[0] ? Math.min(1, Math.max(0, (y - a[0]) / (b[0] - a[0]))) : 1); break; }
    body.style.backgroundColor = c; inkFor(c);
  }

  if (motion) {
    var lt = false;
    addEventListener('scroll', function () { if (!lt) { lt = true; requestAnimationFrame(function () { light(); lt = false; }); } }, { passive: true });
    ST.addEventListener('refresh', function () { measure(); light(); });
    var mm = G.matchMedia();
    mm.add({ wide: '(min-width: 900px)' }, function () {
      root.classList.add('drift');
      doc.querySelectorAll('[data-depth]').forEach(function (el) { G.to(el, { y: +el.getAttribute('data-depth'), ease: 'none', scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom top', scrub: 0.4 } }); });
      var row = doc.getElementById('gRow'), centre = row.children[1], outers = [row.children[0], row.children[2]];
      G.set(row, { xPercent: -50 });
      G.timeline({ scrollTrigger: { trigger: '#golden', start: 'top top', end: 'bottom bottom', scrub: 0.5, invalidateOnRefresh: true } })
        .fromTo(row, { y: function () { return innerHeight - centre.offsetHeight * 0.25; } }, { y: function () { return gHead.offsetTop + gHead.offsetHeight + 40; }, ease: 'power1.out', duration: 1 }, 0)
        .fromTo(centre, { scale: 620 / 760 }, { scale: 1, transformOrigin: '50% 0%', ease: 'power1.out', duration: 1 }, 0)
        .fromTo(outers, { y: 140 }, { y: 0, ease: 'power2.out', duration: 1 }, 0);
      return function () { root.classList.remove('drift'); body.style.backgroundColor = ''; };
    });
    mm.add('(max-width: 899px)', function () {
      root.classList.add('drift');
      var row = doc.getElementById('gRow'), centre = row.children[1];
      G.set(row, { xPercent: -50 });
      G.timeline({ scrollTrigger: { trigger: '#golden', start: 'top top', end: 'bottom bottom', scrub: 0.5, invalidateOnRefresh: true } })
        .fromTo(row, { y: function () { return innerHeight - centre.offsetHeight * 0.3; } }, { y: function () { return gHead.offsetTop + gHead.offsetHeight + 28; }, ease: 'power1.out', duration: 1 }, 0)
        .fromTo(centre, { scale: 0.8 }, { scale: 1.25, transformOrigin: '50% 0%', ease: 'power1.out', duration: 1 }, 0);
      return function () { root.classList.remove('drift'); body.style.backgroundColor = ''; };
    });
    // the shop's cards bob in as they arrive
    ST.batch('.card', { start: 'top 92%', once: true, onEnter: function (els) { G.fromTo(els, { y: 26, autoAlpha: 0, rotation: function (i) { return i % 2 ? 1.5 : -1.5; } }, { y: 0, autoAlpha: 1, rotation: 0, duration: 0.7, ease: 'back.out(1.6)', stagger: 0.07, clearProps: 'transform,opacity,visibility' }); } });
    // 1 pm arrives: the arch opens like a shutter, the rest follow
    var shutter = doc.getElementById('shutter');
    G.timeline({ defaults: { ease: 'power3.out' } })
      .fromTo(shutter, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, clearProps: 'clipPath' }, 0)
      .fromTo(shutter.querySelector('img'), { scale: 1.12 }, { scale: 1, duration: 1.4, clearProps: 'transform' }, 0)
      .from('.p-sq, .col-land, .hcopy > *, .cap', { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.08, clearProps: 'opacity,visibility,transform' }, 0.2);
  } else {
    inkFor(GOLD);
  }

  /* ------------------------------------------------------------------ WebGL: sun on the water, fireflies */
  function program(gl, vs, fs) {
    function sh(t, s) { var x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(x)); return null; } return x; }
    var p = gl.createProgram(), v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs); if (!v || !f) return null;
    gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p); return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
  }
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function points(canvas, opts) {
    var gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return;
    var rnd = mulberry32(opts.seed), N = opts.n, data = new Float32Array(N * 5);
    for (var k = 0; k < N; k++) { var p = opts.place(rnd); data.set([p[0], p[1], rnd(), 0.6 + rnd() * 1.6, 0.6 + rnd() * 0.8], k * 5); }
    var vs = 'attribute vec2 a_p;attribute float a_ph,a_sp,a_sz;uniform float u_t,u_dpr,u_mode;varying float v_a,v_f;' +
      'void main(){vec2 p=a_p;float a;' +
      'if(u_mode<0.5){a=pow(max(0.0,sin(u_t*a_sp*1.7+a_ph*40.0)),14.0);p.x+=sin(u_t*0.3+a_ph*9.0)*0.004;}' +
      'else{p+=vec2(sin(u_t*0.21*a_sp+a_ph*20.0),cos(u_t*0.17*a_sp+a_ph*31.0))*0.045;a=0.35+0.65*pow(0.5+0.5*sin(u_t*0.9*a_sp+a_ph*12.0),2.0);}' +
      'v_a=a;v_f=u_mode;gl_Position=vec4(p.x*2.0-1.0,1.0-p.y*2.0,0.0,1.0);gl_PointSize=(u_mode<0.5?(7.0+9.0*a_sz)*a:(5.0+5.0*a_sz))*u_dpr;}';
    var fs = 'precision mediump float;uniform vec3 u_col;varying float v_a,v_f;' +
      'void main(){vec2 q=gl_PointCoord*2.0-1.0;float al;' +
      'if(v_f<0.5){vec2 z=abs(q);float star=1.0-smoothstep(0.75,1.0,sqrt(z.x)+sqrt(z.y));float core=1.0-smoothstep(0.0,0.35,length(q));al=max(star*0.8,core)*v_a;}' +
      'else{al=(1.0-smoothstep(0.15,1.0,length(q)))*v_a;}' +
      'gl_FragColor=vec4(u_col*al,al);}';
    var pr = program(gl, vs, fs); if (!pr) return;
    gl.useProgram(pr);
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    [['a_p', 2, 0], ['a_ph', 1, 8], ['a_sp', 1, 12], ['a_sz', 1, 16]].forEach(function (a) { var l = gl.getAttribLocation(pr, a[0]); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, a[1], gl.FLOAT, false, 20, a[2]); });
    var uT = gl.getUniformLocation(pr, 'u_t'), uD = gl.getUniformLocation(pr, 'u_dpr');
    gl.uniform1f(gl.getUniformLocation(pr, 'u_mode'), opts.mode); gl.uniform3fv(gl.getUniformLocation(pr, 'u_col'), opts.col);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, opts.mode < 0.5 ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA);
    var dpr = Math.min(devicePixelRatio || 1, 1.5);
    function size() { var w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr); if (w && h && (canvas.width !== w || canvas.height !== h)) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); } }
    var t = opts.t0 || 4, last = performance.now(), running = false, visible = false;
    function draw() { size(); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.uniform1f(uT, t); gl.uniform1f(uD, dpr); gl.drawArrays(gl.POINTS, 0, N); }
    function frame(now) { if (!running) return; t += Math.min((now - last) / 1000, 1 / 30); last = now; draw(); requestAnimationFrame(frame); }
    function go() { var want = visible && !doc.hidden; if (want && !running) { running = true; last = performance.now(); requestAnimationFrame(frame); } else if (!want) running = false; }
    addEventListener('resize', function () { if (!running) draw(); });
    if (FREEZE !== null || reduce) { t = FREEZE !== null ? FREEZE : t; new IntersectionObserver(function (es) { if (es[0].isIntersecting) draw(); }).observe(canvas); return; }
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; go(); }).observe(canvas);
    doc.addEventListener('visibilitychange', go);
  }
  points(doc.getElementById('glintNoon'), { seed: 1300, n: 110, mode: 0, col: [1, 1, 0.94], place: function (r) { return [r(), 0.64 + Math.pow(r(), 0.8) * 0.34]; } });
  points(doc.getElementById('glintGold'), { seed: 1910, n: 170, mode: 0, col: [1, 0.86, 0.6], place: function (r) { var onPath = r() < 0.65, x = onPath ? 0.18 + (r() + r() - 1) * 0.16 : r(); return [Math.min(0.98, Math.max(0.02, x)), 0.36 + Math.pow(r(), 0.9) * 0.6]; } });
  points(doc.getElementById('flies'), { seed: 2100, n: innerWidth < 900 ? 14 : 26, mode: 1, col: [0.98, 0.9, 0.6], t0: 2, place: function (r) { return [r(), 0.15 + r() * 0.75]; } });

  /* ------------------------------------------------------------------ scroll-craft engine: entrances */
  if (window.ScrollCraft) window.ScrollCraft.mount(body);
  if (motion) { measure(); light(); }
  if (ST) addEventListener('load', function () { ST.refresh(); measure(); light(); clockAt(); });
})();
