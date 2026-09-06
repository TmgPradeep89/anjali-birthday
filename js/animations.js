/* ============================================================
   animations.js — the hand-drawn animation toolkit.
   • drawStrokes(svg, opts): draws every .stroke path in order as if by pen
   • confetti(canvas): soft purple paper & petals
   • sparkleAt(x, y, container): a tiny burst of gold
   ============================================================ */
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Prepare a path so it can be "drawn": set dasharray to its own length.
  function prep(el) {
    let len = 100;
    try { len = el.getTotalLength ? el.getTotalLength() : 100; } catch (e) {}
    el.style.strokeDasharray = len;
    el.style.strokeDashoffset = len;
    el.style.transition = "none";
    return len;
  }

  /**
   * Draw all .stroke elements inside `root` in document order.
   * Each element may set data-speed (px per second) and data-pause (ms after).
   * Elements with data-group draw simultaneously with the previous element.
   * Resolves when finished. Fires "drawn" event on each element.
   */
  window.drawStrokes = function (root, opts = {}) {
    const speed = opts.speed || 160;            // px / s
    const items = [...root.querySelectorAll(".stroke")];
    const lens = items.map(prep);
    return new Promise(resolve => {
      if (reduceMotion) { items.forEach(el => { el.style.strokeDashoffset = 0; el.classList.add("is-drawn"); }); resolve(); return; }
      let i = 0;
      function next() {
        if (i >= items.length) { resolve(); return; }
        const batch = [items[i]]; let maxDur = 0;
        // gather concurrent group
        while (items[i + 1] && items[i + 1].dataset.group !== undefined && items[i + 1].dataset.group === items[i].dataset.group && items[i].dataset.group !== "") { i++; batch.push(items[i]); }
        batch.forEach(el => {
          const idx = items.indexOf(el);
          const sp = Number(el.dataset.speed) || speed;
          const dur = Math.max(180, (lens[idx] / sp) * 1000);
          maxDur = Math.max(maxDur, dur);
          el.getBoundingClientRect();
          el.style.transition = `stroke-dashoffset ${dur}ms cubic-bezier(.4,.05,.6,.95)`;
          el.style.strokeDashoffset = 0;
          setTimeout(() => { el.classList.add("is-drawn"); el.dispatchEvent(new CustomEvent("drawn", { bubbles: true })); }, dur);
        });
        const pause = Number(batch[batch.length - 1].dataset.pause) || 120;
        i++;
        setTimeout(next, maxDur + pause);
      }
      setTimeout(next, opts.delay || 0);
    });
  };

  /** Fade in fills after their strokes: elements with .fill-after */
  window.fillAfter = function (root, delay = 0) {
    root.querySelectorAll(".fill-after").forEach((el, i) => {
      el.style.transition = "opacity 1.2s ease";
      setTimeout(() => { el.style.opacity = el.dataset.opacity || 1; }, delay + i * 120);
    });
  };

  /** Tiny gold sparkle burst at viewport coords (x,y) */
  window.sparkleAt = function (x, y, n = 8) {
    if (reduceMotion) return;
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.className = "fx-star";
      s.style.position = "fixed"; s.style.left = x + "px"; s.style.top = y + "px"; s.style.zIndex = 50;
      document.body.appendChild(s);
      const ang = Math.random() * Math.PI * 2, dist = 20 + Math.random() * 40;
      s.animate([
        { transform: "translate(-50%,-50%) scale(1)", opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(ang) * dist}px), calc(-50% + ${Math.sin(ang) * dist}px)) scale(0)`, opacity: 0 }
      ], { duration: 700 + Math.random() * 400, easing: "cubic-bezier(.2,.7,.3,1)" }).onfinish = () => s.remove();
    }
  };

  /** Soft confetti: paper scraps, petals, tiny stars in purple / gold / cream */
  window.confetti = function (canvas, opts = {}) {
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let W, H, parts = [], running = true, spawnUntil = performance.now() + (opts.duration || 6000);
    const colors = ["#bda6e6", "#c48ad6", "#7452a8", "#dccbf2", "#f0dfb0", "#fcf9f3", "#a57fb4"];
    function resize() { W = canvas.width = innerWidth * dpr; H = canvas.height = innerHeight * dpr; canvas.style.width = innerWidth + "px"; canvas.style.height = innerHeight + "px"; }
    resize(); addEventListener("resize", resize);
    function spawn(n) {
      for (let i = 0; i < n; i++) {
        const kind = Math.random();
        parts.push({
          x: Math.random() * W, y: -20 * dpr - Math.random() * H * .2,
          vx: (Math.random() - .5) * .6 * dpr, vy: (0.6 + Math.random() * 1.1) * dpr,
          w: (kind < .3 ? 6 + Math.random() * 6 : 8 + Math.random() * 8) * dpr, h: (kind < .3 ? 6 + Math.random() * 6 : 4 + Math.random() * 6) * dpr,
          rot: Math.random() * Math.PI * 2, vr: (Math.random() - .5) * .08, sw: Math.random() * Math.PI * 2,
          color: colors[(Math.random() * colors.length) | 0], kind: kind < .3 ? "petal" : kind < .4 ? "star" : "paper", a: 1
        });
      }
    }
    let last = performance.now();
    function frame(now) {
      if (!running) return;
      const dt = Math.min(40, now - last); last = now;
      ctx.clearRect(0, 0, W, H);
      if (now < spawnUntil) spawn(reduceMotion ? 1 : Math.round(W / 500));
      parts.forEach(p => {
        p.sw += .02 * dt / 16; p.x += p.vx * dt / 16 + Math.sin(p.sw) * .4 * dpr; p.y += p.vy * dt / 16; p.rot += p.vr * dt / 16;
        if (p.y > H * .85) p.a -= .012;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.max(0, p.a); ctx.fillStyle = p.color;
        if (p.kind === "petal") { ctx.beginPath(); ctx.ellipse(0, 0, p.w / 2, p.h / 1.4, 0, 0, Math.PI * 2); ctx.fill(); }
        else if (p.kind === "star") { ctx.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? p.w / 5 : p.w / 2; const a = k * Math.PI / 5; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); }
        else { ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); }
        ctx.restore();
      });
      parts = parts.filter(p => p.a > 0 && p.y < H + 40);
      if (parts.length || now < spawnUntil) requestAnimationFrame(frame); else running = false;
    }
    requestAnimationFrame(frame);
    return { stop() { running = false; ctx.clearRect(0, 0, W, H); } };
  };

  /** Floating petals / particles drifting inside a container */
  window.driftParticles = function (container, n = 12, kind = "petal") {
    if (reduceMotion) return;
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.className = kind === "petal" ? "fx-petal" : "fx-star";
      s.style.left = Math.random() * 100 + "%"; s.style.top = Math.random() * 100 + "%"; s.style.opacity = .0;
      container.appendChild(s);
      const loop = () => {
        const dx = (Math.random() - .5) * 120, dy = -(40 + Math.random() * 120);
        s.animate([
          { transform: "translate(0,0) rotate(0deg)", opacity: 0 }, { opacity: .8, offset: .2 },
          { transform: `translate(${dx}px, ${dy}px) rotate(${Math.random() * 200}deg)`, opacity: 0 }
        ], { duration: 6000 + Math.random() * 6000, delay: Math.random() * 3000, easing: "ease-in-out" }).onfinish = loop;
      };
      loop();
    }
  };
})();
