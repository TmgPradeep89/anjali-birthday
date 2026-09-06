/* ============================================================
   navigation.js — page veil transitions, chapter indicator,
   timed reveals, and scroll reveals. No framework, just care.
   ============================================================ */
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;

  // ---- Which chapter are we on? ------------------------------
  // Works with plain files (birthday.html), "pretty URLs" (/birthday, /birthday/) and the site root (/).
  const slug = f => String(f).toLowerCase().replace(/\/+$/, "").split("/").pop().replace(/\.html?$/, "") || "index";
  const here = slug(location.pathname);
  const chapters = birthdayConfig.chapters;
  const idx = Math.max(0, chapters.findIndex(c => slug(c.file) === here));
  const pad = n => String(n).padStart(2, "0");
  // If the host serves clean URLs, link the same way so nothing bounces through a redirect.
  const pretty = !/\.html?$/i.test(location.pathname) && location.pathname !== "/" && !location.pathname.endsWith("/index");
  const hrefFor = c => pretty ? slug(c.file) : c.file;

  // Fill chapter indicators and prev/next hrefs automatically
  document.querySelectorAll("[data-chapter]").forEach(el => {
    el.textContent = `${pad(idx + 1)} / ${pad(chapters.length)}`;
    el.setAttribute("aria-label", `Chapter ${idx + 1} of ${chapters.length}: ${chapters[idx].label}`);
  });
  document.querySelectorAll("[data-next]").forEach(a => { if (chapters[idx + 1]) a.href = hrefFor(chapters[idx + 1]); });
  document.querySelectorAll("[data-prev]").forEach(a => {
    if (chapters[idx - 1]) a.href = hrefFor(chapters[idx - 1]); else a.remove();
  });
  if (pretty) document.querySelectorAll('a[href$=".html"]').forEach(a => { const c = chapters.find(ch => ch.file === a.getAttribute("href")); if (c) a.href = slug(c.file); });
  document.title = `${chapters[idx].label} · For ${birthdayConfig.name}`;

  // ---- Page veil: enter -------------------------------------
  let veil = document.querySelector(".veil");
  if (!veil) { veil = document.createElement("div"); veil.className = "veil"; veil.setAttribute("aria-hidden", "true"); body.prepend(veil); }
  body.classList.add("is-entering");
  const lift = () => { body.classList.add("is-ready"); body.classList.remove("is-entering"); };
  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise(r => setTimeout(r, 900))]).then(() => requestAnimationFrame(() => requestAnimationFrame(lift)));

  // ---- Page veil: leave (with a per-page flourish) ------------
  const flourish = body.dataset.transition || "fade";
  function sprinkle(kind) {
    if (reduceMotion) return;
    const n = kind === "petals" ? 16 : 22;
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.className = kind === "petals" ? "veil-petal" : "veil-star";
      s.style.left = Math.random() * 100 + "vw";
      s.style.top = kind === "petals" ? "-8vh" : Math.random() * 100 + "vh";
      s.style.animationDelay = Math.random() * 0.35 + "s";
      if (kind === "petals") s.style.transform = `rotate(${Math.random() * 180}deg)`;
      veil.appendChild(s);
    }
  }
  function leaveTo(href) {
    if (body.classList.contains("is-leaving")) return;
    body.classList.add("is-leaving");
    if (window.birthdayMusic) birthdayMusic.save();   // keep the music exactly where it is
    if (flourish === "petals" || flourish === "stars") sprinkle(flourish);
    if (flourish === "blur") document.querySelector(".page")?.animate([{ filter: "blur(0)" }, { filter: "blur(10px)" }], { duration: 600, fill: "forwards" });
    setTimeout(() => { if (window.birthdayMusic) birthdayMusic.save(); location.href = href; }, reduceMotion ? 200 : 850);
  }
  document.addEventListener("click", e => {
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname && url.hash) return;
    e.preventDefault();
    leaveTo(a.href);
  });
  // If the page is restored from bfcache, make sure the veil lifts.
  window.addEventListener("pageshow", e => { if (e.persisted) { body.classList.remove("is-leaving"); body.classList.add("is-ready"); } });

  // ---- Keyboard: → next, ← back (only when the next button is visible)
  document.addEventListener("keydown", e => {
    if (e.target.matches("input, textarea")) return;
    if (e.key === "ArrowRight") { const n = document.querySelector(".nav-next:not(.is-waiting)"); if (n) leaveTo(n.href); }
    if (e.key === "ArrowLeft") { const p = document.querySelector("[data-prev]"); if (p) leaveTo(p.href); }
  });

  // ---- Timed reveals: data-reveal="ms" ------------------------
  // Each element appears after its delay (from page ready). Elements with
  // data-reveal-group share a sequence; used for "cinematic" line reveals.
  window.revealSequence = function (root = document, opts = {}) {
    const items = [...root.querySelectorAll("[data-reveal]")].filter(el => !el.classList.contains("is-shown"));
    const speed = reduceMotion ? 0.25 : 1;
    const base = opts.base || 0;
    let last = 0;
    items.forEach(el => {
      const d = (Number(el.dataset.reveal) || 0) * speed + base;
      last = Math.max(last, d);
      setTimeout(() => {
        el.classList.add("is-shown");
        el.dispatchEvent(new CustomEvent("revealed", { bubbles: true }));
      }, d);
    });
    // Reveal the "next" button after the sequence unless it's controlled by the page itself.
    const next = document.querySelector(".nav-next.is-waiting:not([data-manual])");
    if (next) setTimeout(() => next.classList.remove("is-waiting"), last + (opts.tail ?? 900) * speed);
    return last;
  };
  window.showNext = function () { document.querySelectorAll(".nav-next.is-waiting").forEach(n => n.classList.remove("is-waiting")); };

  // ---- Scroll reveals: data-reveal-scroll ----------------------
  const io = "IntersectionObserver" in window ? new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        const el = en.target;
        const stagger = Number(el.dataset.stagger) || 0;
        setTimeout(() => { el.classList.add("is-shown"); el.dispatchEvent(new CustomEvent("revealed", { bubbles: true })); }, stagger);
        io.unobserve(el);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.15 }) : null;
  document.querySelectorAll("[data-reveal-scroll]").forEach((el, i) => {
    if (!el.dataset.stagger) el.dataset.stagger = String((i % 6) * 120);
    if (io) io.observe(el); else el.classList.add("is-shown");
  });

  // Kick off the timed sequence automatically unless the page opts out.
  if (!body.hasAttribute("data-manual-reveal")) {
    window.addEventListener("load", () => setTimeout(() => window.revealSequence(), 200));
  }

  window.__chapter = { idx, total: chapters.length, reduceMotion, leaveTo };
})();
