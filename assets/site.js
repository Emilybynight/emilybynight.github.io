// Emily by Night: drifting petals + line-by-line reveal
(function () {
  // number each line of a poem / paragraph of a piece so they appear one after another
  document.querySelectorAll('.lines').forEach(function (box) {
    Array.prototype.forEach.call(box.children, function (el, i) { el.style.setProperty('--i', Math.min(i, 40)); });
  });

  var c = document.getElementById('petals');
  if (!c || !c.getContext) return;
  var ctx = c.getContext('2d');
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W, H, dpr, items = [];
  var colors = ['233,166,196', '248,227,236', '143,182,216', '245,214,160'];

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = c.clientWidth; H = c.clientHeight;
    c.width = W * dpr; c.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function make(anywhere) {
    var petal = Math.random() < 0.45;
    return {
      x: Math.random() * W,
      y: anywhere ? Math.random() * H : -20,
      r: petal ? 4 + Math.random() * 6 : 0.8 + Math.random() * 1.8,
      petal: petal,
      vy: 0.12 + Math.random() * 0.35,
      sway: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.01,
      rot: Math.random() * Math.PI,
      a: 0.15 + Math.random() * 0.45,
      col: colors[(Math.random() * colors.length) | 0]
    };
  }
  function draw(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    if (p.petal) {
      ctx.rotate(p.rot);
      var g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.r * 1.6);
      g.addColorStop(0, 'rgba(' + p.col + ',' + p.a + ')');
      g.addColorStop(1, 'rgba(' + p.col + ',0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.r * 1.6, p.r * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(' + p.col + ',' + (p.a + 0.2) + ')';
      ctx.shadowColor = 'rgba(' + p.col + ',0.9)';
      ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < items.length; i++) {
      var p = items[i];
      p.sway += 0.008; p.rot += p.spin;
      p.y += p.vy; p.x += Math.sin(p.sway) * 0.3;
      if (p.y > H + 20) items[i] = make(false);
      draw(p);
    }
    requestAnimationFrame(frame);
  }
  size();
  var n = Math.round(Math.min(46, (W * H) / 26000));
  for (var i = 0; i < n; i++) items.push(make(true));
  window.addEventListener('resize', size);
  if (still) { items.forEach(draw); } else { requestAnimationFrame(frame); }
})();
