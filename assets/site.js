// Emily by Night — language switch, copy button, line-by-line reveals,
// and a different living element in each room.
(function () {
  var root = document.documentElement;
  var room = document.body.getAttribute('data-room') || 'home';

  /* ---------- English / Arabic ---------- */
  var btn = document.getElementById('lang');
  if (btn) btn.addEventListener('click', function () {
    var next = root.getAttribute('data-lang') === 'ar' ? 'en' : 'ar';
    root.setAttribute('data-lang', next);
    root.setAttribute('dir', next === 'ar' ? 'rtl' : 'ltr');
    root.lang = next;
    try { localStorage.setItem('ebn-lang', next); } catch (e) {}
  });

  /* ---------- copy email ---------- */
  document.querySelectorAll('.copy').forEach(function (b) {
    b.addEventListener('click', function () {
      var text = b.getAttribute('data-copy');
      var done = function () { b.classList.add('done'); b.textContent = '✓'; };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
    });
  });

  /* ---------- lines appear one after another ---------- */
  document.querySelectorAll('.lines').forEach(function (box) {
    Array.prototype.forEach.call(box.children, function (el, i) { el.style.setProperty('--i', Math.min(i, 40)); });
  });

  /* ---------- the living sky ---------- */
  var c = document.getElementById('sky');
  if (!c || !c.getContext) return;
  var ctx = c.getContext('2d');
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W, H, dpr, t = 0;

  // what lives in each room
  var rooms = {
    home:     { butterflies: 3, wings: ['236,140,196', '250,196,224'], dust: 34, dustCol: ['245,205,160', '248,227,236'] },
    poems:    { petals: 40 },
    essays:   { dust: 46, dustCol: ['150,104,52', '120,80,40', '190,150,90'], rise: true, ink: true },
    articles: { sparkle: 60 },
    journal:  { butterflies: 2, wings: ['214,140,50', '240,186,100'], dust: 22, dustCol: ['214,150,60', '196,104,122'] },
    contact:  { sparkle: 34, butterflies: 1, wings: ['196,88,126', '236,150,180'] }
  };
  var cfg = rooms[room] || rooms.home;
  var things = [];

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = c.clientWidth; H = c.clientHeight;
    c.width = W * dpr; c.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[(Math.random() * a.length) | 0]; }

  /* butterflies: wander, flap, leave a soft motion blur */
  function Butterfly() {
    this.x = rnd(0, W); this.y = rnd(H * 0.15, H * 0.85);
    this.a = rnd(0, Math.PI * 2); this.v = rnd(0.5, 0.9);
    this.flap = rnd(0, 6); this.size = rnd(13, 21);
    this.col = cfg.wings; this.trail = [];
  }
  Butterfly.prototype.step = function () {
    this.a += Math.sin(t * 0.004 + this.size) * 0.02 + rnd(-0.03, 0.03);
    // stay on screen: steer gently back toward the middle
    var dx = W / 2 - this.x, dy = H / 2 - this.y;
    if (Math.abs(dx) > W * 0.45 || Math.abs(dy) > H * 0.42) {
      var want = Math.atan2(dy, dx), diff = Math.atan2(Math.sin(want - this.a), Math.cos(want - this.a));
      this.a += diff * 0.03;
    }
    var glide = (Math.sin(t * 0.01 + this.size) + 1) / 2; // moments of gliding
    this.flap += 0.18 + glide * 0.12;
    this.x += Math.cos(this.a) * this.v;
    this.y += Math.sin(this.a) * this.v + Math.sin(this.flap) * 0.35;
    this.trail.unshift([this.x, this.y, this.flap]);
    if (this.trail.length > 6) this.trail.pop();
  };
  function wing(s, open, col, alpha) {
    var w = s * (0.25 + 0.75 * Math.abs(Math.cos(open)));
    var g = ctx.createRadialGradient(0, 0, 1, 0, 0, s * 1.3);
    g.addColorStop(0, 'rgba(' + col[1] + ',' + alpha + ')');
    g.addColorStop(0.55, 'rgba(' + col[0] + ',' + alpha * 0.9 + ')');
    g.addColorStop(1, 'rgba(' + col[0] + ',0)');
    ctx.fillStyle = g;
    [-1, 1].forEach(function (side) {
      ctx.beginPath(); ctx.ellipse(side * w * 0.55, -s * 0.35, w * 0.6, s * 0.62, side * 0.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(side * w * 0.4, s * 0.38, w * 0.42, s * 0.45, side * -0.4, 0, Math.PI * 2); ctx.fill();
    });
  }
  Butterfly.prototype.draw = function () {
    var self = this;
    for (var k = this.trail.length - 1; k >= 0; k--) {
      var p = this.trail[k], fade = k === 0 ? 0.75 : 0.12 * (1 - k / this.trail.length);
      ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(this.a + Math.PI / 2);
      wing(self.size, p[2], self.col, fade);
      if (k === 0) { ctx.fillStyle = 'rgba(60,30,30,.6)'; ctx.beginPath(); ctx.ellipse(0, 0, 1.4, self.size * 0.55, 0, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
  };

  /* petals and pollen (night poems) */
  function Petal(any) {
    this.petal = Math.random() < 0.45;
    this.x = rnd(0, W); this.y = any ? rnd(0, H) : -20;
    this.r = this.petal ? rnd(4, 10) : rnd(0.8, 2.6);
    this.vy = rnd(0.12, 0.45); this.sway = rnd(0, 6); this.rot = rnd(0, 3); this.spin = rnd(-0.01, 0.01);
    this.al = rnd(0.15, 0.55); this.col = pick(['233,166,196', '248,227,236', '143,182,216', '245,214,160']);
  }
  Petal.prototype.step = function () {
    this.sway += 0.008; this.rot += this.spin; this.y += this.vy; this.x += Math.sin(this.sway) * 0.3;
    if (this.y > H + 20) Petal.call(this, false);
  };
  Petal.prototype.draw = function () {
    ctx.save(); ctx.translate(this.x, this.y);
    if (this.petal) {
      ctx.rotate(this.rot);
      var g = ctx.createRadialGradient(0, 0, 0, 0, 0, this.r * 1.6);
      g.addColorStop(0, 'rgba(' + this.col + ',' + this.al + ')'); g.addColorStop(1, 'rgba(' + this.col + ',0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, this.r * 1.6, this.r * 0.7, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(' + this.col + ',' + (this.al + 0.2) + ')'; ctx.shadowColor = 'rgba(' + this.col + ',.9)'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(0, 0, this.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  };

  /* dust in lamplight (letters, journal, home) */
  function Dust(any) {
    this.x = rnd(0, W); this.y = any ? rnd(0, H) : (cfg.rise ? H + 10 : rnd(0, H));
    this.r = rnd(0.6, 2.2); this.vy = cfg.rise ? -rnd(0.05, 0.25) : rnd(-0.12, 0.12);
    this.vx = rnd(-0.12, 0.12); this.ph = rnd(0, 6); this.col = pick(cfg.dustCol); this.al = rnd(0.15, 0.5);
  }
  Dust.prototype.step = function () {
    this.ph += 0.02; this.x += this.vx + Math.sin(this.ph) * 0.15; this.y += this.vy;
    if (this.y < -10 || this.y > H + 10 || this.x < -10 || this.x > W + 10) Dust.call(this, false);
  };
  Dust.prototype.draw = function () {
    var a = this.al * (0.6 + 0.4 * Math.sin(this.ph * 1.7));
    ctx.fillStyle = 'rgba(' + this.col + ',' + a + ')';
    ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); ctx.fill();
  };

  /* sun glints on water (articles, contact) */
  function Glint() {
    this.x = rnd(0, W); this.y = rnd(H * 0.05, H); this.r = rnd(2, 14);
    this.sp = rnd(0.01, 0.035); this.ph = rnd(0, 6); this.vx = rnd(0.05, 0.2);
  }
  Glint.prototype.step = function () { this.ph += this.sp; this.x += this.vx; if (this.x > W + 20) { this.x = -20; this.y = rnd(H * 0.05, H); } };
  Glint.prototype.draw = function () {
    var s = Math.pow((Math.sin(this.ph) + 1) / 2, 6);
    if (s < 0.02) return;
    var g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
    g.addColorStop(0, 'rgba(255,252,240,' + 0.9 * s + ')'); g.addColorStop(0.4, 'rgba(255,240,200,' + 0.35 * s + ')'); g.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); ctx.fill();
    if (this.r > 8 && s > 0.5) { // a little star cross on the brightest ones
      ctx.strokeStyle = 'rgba(255,255,255,' + (s - 0.5) + ')'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(this.x - this.r * 1.6, this.y); ctx.lineTo(this.x + this.r * 1.6, this.y);
      ctx.moveTo(this.x, this.y - this.r * 1.2); ctx.lineTo(this.x, this.y + this.r * 1.2); ctx.stroke();
    }
  };

  /* ink drops that bloom and fade (letters) */
  function Ink() { this.reset(); this.age = rnd(0, 400); }
  Ink.prototype.reset = function () { this.x = rnd(0, W); this.y = rnd(0, H); this.age = 0; this.max = rnd(18, 46); };
  Ink.prototype.step = function () { this.age++; if (this.age > 520) this.reset(); };
  Ink.prototype.draw = function () {
    var k = Math.min(this.age / 240, 1), r = this.max * (1 - Math.pow(1 - k, 3)), a = 0.045 * (this.age < 360 ? 1 : 1 - (this.age - 360) / 160);
    var g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r);
    g.addColorStop(0, 'rgba(42,32,24,' + a + ')'); g.addColorStop(0.7, 'rgba(59,74,122,' + a * 0.6 + ')'); g.addColorStop(1, 'rgba(59,74,122,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(this.x, this.y, r, 0, Math.PI * 2); ctx.fill();
  };

  function populate() {
    things = [];
    var area = (W * H) / (1280 * 800), i;
    var n = function (k) { return Math.max(4, Math.round(k * Math.min(area, 1.2))); };
    if (cfg.ink) for (i = 0; i < 4; i++) things.push(new Ink());
    if (cfg.dust) for (i = 0; i < n(cfg.dust); i++) things.push(new Dust(true));
    if (cfg.petals) for (i = 0; i < n(cfg.petals); i++) things.push(new Petal(true));
    if (cfg.sparkle) for (i = 0; i < n(cfg.sparkle); i++) things.push(new Glint());
    if (cfg.butterflies) for (i = 0; i < cfg.butterflies; i++) things.push(new Butterfly());
  }
  function frame() {
    t++;
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < things.length; i++) { things[i].step(); things[i].draw(); }
    requestAnimationFrame(frame);
  }
  size(); populate();
  var lastW = W;
  window.addEventListener('resize', function () { size(); if (Math.abs(W - lastW) > 40) { lastW = W; populate(); } });
  if (still) { things.forEach(function (o) { if (o.step && o instanceof Butterfly) o.step(); o.draw(); }); }
  else requestAnimationFrame(frame);
})();
