/* ============================================================
   script.js — shared helpers used by every chapter:
   • music control (starts only after the first interaction)
   • image frames that show an elegant placeholder when a file is missing
   • the starry sky canvas behind night pages
   • fireflies / floating particles
   ============================================================ */
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cfg = birthdayConfig;

  /* ---------------- Music ---------------- */
  const MUSIC_KEY = "anjali.music";
  const state = JSON.parse(sessionStorage.getItem(MUSIC_KEY) || "{}");
  const audio = new Audio(cfg.music);
  audio.loop = true;
  audio.preload = "auto";
  const targetVolume = () => (state.volume ?? cfg.musicVolume);
  audio.volume = targetVolume();
  if (state.time) audio.currentTime = state.time;

  const ui = document.createElement("div");
  ui.className = "music";
  ui.innerHTML = `
    <div class="music-panel">
      <span class="music-label">music</span>
      <input type="range" min="0" max="1" step="0.02" aria-label="Music volume">
    </div>
    <button class="music-btn" type="button" aria-pressed="false" aria-label="Play background music" title="Music">🔇</button>`;
  document.body.appendChild(ui);
  const btn = ui.querySelector(".music-btn");
  const range = ui.querySelector("input");
  range.value = state.volume ?? cfg.musicVolume;

  let wanted = state.on === true;   // did she turn music on earlier in this visit?
  let fadeTimer = null;
  function fadeTo(v, ms = 900) {
    clearInterval(fadeTimer);
    const start = audio.volume, steps = 24, dt = ms / steps; let i = 0;
    fadeTimer = setInterval(() => { i++; audio.volume = Math.max(0, Math.min(1, start + (v - start) * (i / steps))); if (i >= steps) clearInterval(fadeTimer); }, dt);
  }
  function paint() {
    const on = wanted && !audio.paused;
    btn.textContent = on ? "🔊" : "🔇";
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-pressed", String(on));
    btn.setAttribute("aria-label", on ? "Mute background music" : "Play background music");
  }
  function save() { sessionStorage.setItem(MUSIC_KEY, JSON.stringify({ on: wanted, volume: Number(range.value), time: audio.currentTime, at: Date.now() })); }
  async function play(fadeMs = 1200) {
    try { audio.volume = 0; await audio.play(); fadeTo(targetVolume(), fadeMs); wanted = true; }
    catch (e) { wanted = false; }
    paint(); save();
  }
  function pause() { fadeTo(0, 500); setTimeout(() => audio.pause(), 520); wanted = false; paint(); save(); }
  btn.addEventListener("click", e => { e.stopPropagation(); if (wanted && !audio.paused) pause(); else play(); ui.classList.add("is-open"); });
  range.addEventListener("input", () => { state.volume = Number(range.value); audio.volume = targetVolume(); save(); });
  document.addEventListener("click", e => { if (!ui.contains(e.target)) ui.classList.remove("is-open"); });

  // Continuity between chapters: pick up where the previous page left off (plus the time spent loading),
  // then try to resume silently; if the browser insists on a gesture, resume on the very first one.
  if (wanted) {
    const elapsed = state.at ? (Date.now() - state.at) / 1000 : 0;
    const seek = () => { try { if (audio.duration) audio.currentTime = ((state.time || 0) + elapsed) % audio.duration; } catch (e) {} };
    if (audio.readyState >= 1) seek(); else audio.addEventListener("loadedmetadata", seek, { once: true });
    const resume = () => { if (audio.paused) play(1500); document.removeEventListener("pointerdown", resume); document.removeEventListener("keydown", resume); };
    document.addEventListener("pointerdown", resume);
    document.addEventListener("keydown", resume);
    play(1500);
  }
  audio.addEventListener("error", () => { btn.title = "Add music/birthday.mp3 to enable music"; btn.style.opacity = ".5"; });
  window.addEventListener("pagehide", save);
  window.addEventListener("beforeunload", save);
  document.addEventListener("visibilitychange", save);
  setInterval(save, 2000);
  paint();
  window.birthdayMusic = { play, pause, audio, fadeTo, save, targetVolume };

  /* ---------------- Image frames ---------------- */
  // <div class="frame" data-src="images/bts/bts-01.jpg" data-label="BTS"></div>
  const placeholderSVG = `<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="9" y="12" width="46" height="40" rx="4"/><path d="M13 46l12-13 9 9 7-6 10 10"/><circle cx="44" cy="23" r="4"/></g>
    <path d="M32 4l1.4 3.6L37 9l-3.6 1.4L32 14l-1.4-3.6L27 9l3.6-1.4z" fill="currentColor" opacity=".7"/></svg>`;
  window.mountFrame = function (frame) {
    const src = frame.dataset.src; if (!src) return;
    const label = frame.dataset.label || "";
    const isVideo = /\.(mp4|webm|mov)$/i.test(src);
    frame.classList.add("is-empty");
    const ph = document.createElement("div");
    ph.className = "placeholder";
    ph.innerHTML = `${placeholderSVG}<span class="ph-label">${label}</span><span class="ph-file">${src.split("/").pop()}</span>`;
    frame.appendChild(ph);
    // Candidate filenames: the one in config first, then common extension / capitalisation variants,
    // so "bts-01.JPG", "bts-01.jpeg", "bts-01.png" or "bts-01.webp" all still work on case-sensitive hosts.
    const base = src.replace(/\.[a-z0-9]+$/i, "");
    const variants = isVideo
      ? [src, base + ".mp4", base + ".MP4", base + ".webm", base + ".mov", base + ".MOV"]
      : [src, base + ".jpg", base + ".jpeg", base + ".png", base + ".webp", base + ".JPG", base + ".JPEG", base + ".PNG", base + ".WEBP"];
    const queue = [...new Set(variants)];

    const show = (url) => {
      let media;
      if (isVideo) {
        media = document.createElement("video");
        media.muted = true; media.loop = true; media.playsInline = true; media.autoplay = true; media.preload = "metadata";
      } else {
        media = new Image();
        media.decoding = "async";
        media.alt = frame.dataset.alt || label;
      }
      media.src = url;
      frame.appendChild(media);
      frame.classList.remove("is-empty");
    };
    // Probe candidates one by one (eagerly — lazy <img> never fires error while off-screen).
    const probe = () => {
      const url = queue.shift();
      if (!url) return;                       // nothing found → placeholder stays
      if (isVideo) {
        const v = document.createElement("video"); v.preload = "metadata"; v.muted = true;
        v.addEventListener("loadedmetadata", () => show(url), { once: true });
        v.addEventListener("error", probe, { once: true });
        v.src = url;
      } else {
        const im = new Image();
        im.addEventListener("load", () => show(url), { once: true });
        im.addEventListener("error", probe, { once: true });
        im.src = url;
      }
    };
    // Start probing when the frame is near the viewport (keeps things light), or immediately if no IO.
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); probe(); } }, { rootMargin: "600px" });
      io.observe(frame);
    } else probe();
  };
  document.querySelectorAll(".frame[data-src]").forEach(window.mountFrame);

  /* ---------------- Starry sky canvas ---------------- */
  const sky = document.querySelector("canvas.sky");
  if (sky) {
    const ctx = sky.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W, H, stars = [], flies = [];
    const density = Number(sky.dataset.density || 1);
    const withFireflies = sky.dataset.fireflies !== "false";
    function resize() {
      W = sky.width = innerWidth * dpr; H = sky.height = innerHeight * dpr;
      sky.style.width = innerWidth + "px"; sky.style.height = innerHeight + "px";
      const n = Math.round((innerWidth * innerHeight) / 9000 * density);
      stars = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H * 0.9, r: (Math.random() * 1.1 + 0.3) * dpr, p: Math.random() * Math.PI * 2, s: 0.4 + Math.random() * 0.8, gold: Math.random() < 0.15 }));
      const m = withFireflies ? Math.round(innerWidth / 70) : 0;
      flies = Array.from({ length: m }, () => ({ x: Math.random() * W, y: H * (0.35 + Math.random() * 0.6), vx: (Math.random() - .5) * .25 * dpr, vy: (Math.random() - .5) * .2 * dpr, p: Math.random() * 6, r: (1.6 + Math.random() * 1.6) * dpr }));
    }
    let t = 0;
    function draw() {
      t += 0.016;
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.s + s.p));
        ctx.fillStyle = s.gold ? `rgba(240,223,176,${a})` : `rgba(230,220,250,${a * .85})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      }
      for (const f of flies) {
        f.x += f.vx + Math.sin(t + f.p) * .15 * dpr; f.y += f.vy + Math.cos(t * .7 + f.p) * .12 * dpr;
        if (f.x < 0) f.x = W; if (f.x > W) f.x = 0; if (f.y < H * .3) f.y = H; if (f.y > H) f.y = H * .3;
        const a = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * 1.3 + f.p));
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 5);
        g.addColorStop(0, `rgba(240,223,176,${a * .9})`); g.addColorStop(.35, `rgba(196,138,214,${a * .35})`); g.addColorStop(1, "rgba(196,138,214,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, f.r * 5, 0, Math.PI * 2); ctx.fill();
      }
      if (!reduceMotion) requestAnimationFrame(draw);
    }
    resize(); draw();
    addEventListener("resize", resize);
  }

  /* ---------------- Shared decorative SVG snippets ---------------- */
  window.doodles = {
    flower: (c = "currentColor") => `<svg viewBox="0 0 60 60" aria-hidden="true"><g fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round"><path d="M30 58V34"/><path d="M30 46c-6 0-10-4-11-9 5 0 10 3 11 9zM30 42c1-6 5-9 11-9-1 6-5 9-11 9z"/><g><ellipse cx="30" cy="16" rx="5" ry="9"/><ellipse cx="30" cy="16" rx="5" ry="9" transform="rotate(60 30 16)"/><ellipse cx="30" cy="16" rx="5" ry="9" transform="rotate(120 30 16)"/></g><circle cx="30" cy="16" r="3" fill="${c}" opacity=".5"/></g></svg>`,
    star: (c = "currentColor") => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" fill="none" stroke="${c}" stroke-width="1.4" stroke-linejoin="round"/></svg>`,
    heart: (c = "currentColor") => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" fill="none" stroke="${c}" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
    arrow: (c = "currentColor") => `<svg viewBox="0 0 80 40" aria-hidden="true"><path d="M4 30c20-18 40-20 70-8M66 14l9 8-11 4" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    butterfly: (c = "currentColor") => `<svg viewBox="0 0 60 50" aria-hidden="true"><g fill="none" stroke="${c}" stroke-width="1.5" stroke-linejoin="round"><path class="wing" d="M30 25c-4-12-16-20-24-14-6 5-2 16 8 18-10 2-12 12-6 16 8 4 18-8 22-20z"/><path class="wing" d="M30 25c4-12 16-20 24-14 6 5 2 16-8 18 10 2 12 12 6 16-8 4-18-8-22-20z"/><path d="M30 12v28M27 10l-3-6M33 10l3-6" stroke-linecap="round"/></g></svg>`,
    vine: (c = "currentColor") => `<svg viewBox="0 0 200 40" aria-hidden="true"><g fill="none" stroke="${c}" stroke-width="1.5" stroke-linecap="round"><path d="M2 22c30-20 60 20 90 0s60 20 106 0"/><path d="M30 12c4-6 10-6 12 0-6 2-10 2-12 0zM70 30c-4 6-10 6-12 0 6-2 10-2 12 0zM120 12c4-6 10-6 12 0-6 2-10 2-12 0zM160 30c-4 6-10 6-12 0 6-2 10-2 12 0z"/></g></svg>`,
    moon: (c = "currentColor") => `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M28 6a14 14 0 100 28 11 11 0 010-28z" fill="none" stroke="${c}" stroke-width="1.5"/></svg>`,
    envelope: (c = "currentColor") => `<svg viewBox="0 0 60 44" aria-hidden="true"><g fill="none" stroke="${c}" stroke-width="1.6" stroke-linejoin="round"><rect x="3" y="6" width="54" height="34" rx="3"/><path d="M3 9l27 18L57 9M3 38l20-15M57 38L37 23"/></g></svg>`
  };
  document.querySelectorAll("[data-doodle]").forEach(el => { const d = window.doodles[el.dataset.doodle]; if (d) el.innerHTML = d(); });
})();
