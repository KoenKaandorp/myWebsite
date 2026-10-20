/* Shared by the home page and project pages: every block checks that its
   elements exist, so a missing element on one page can't stop the rest. */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/* --- Light / dark toggle (dark is the default; the head script applies a saved choice before paint) --- */
(function () {
  const root = document.documentElement;
  const btn = document.getElementById("theme-toggle");
  const meta = document.querySelector('meta[name="theme-color"]');

  function apply(theme, save) {
    if (theme === "light") root.dataset.theme = "light";
    else delete root.dataset.theme;
    if (meta) meta.content = theme === "light" ? "#F7F9FC" : "#060D1A";
    if (btn) btn.setAttribute("aria-label", theme === "light" ? "Switch to dark mode" : "Switch to light mode");
    if (save) { try { localStorage.setItem("theme", theme); } catch (e) {} }
    document.dispatchEvent(new CustomEvent("themechange"));
  }

  apply(root.dataset.theme === "light" ? "light" : "dark", false);
  if (btn) btn.addEventListener("click", () => apply(root.dataset.theme === "light" ? "dark" : "light", true));
})();

/* --- Typewriter --- */
(function () {
  const te = document.getElementById("changing-text");
  if (!te) return;
  const words = ["AI Engineer","Python Developer","Machine Learning Engineer","Problem Solver","Data Scientist", "Web Developer"];

  // Screen readers get the whole list once instead of a stream of letters.
  const sr = document.getElementById("changing-text-sr");
  if (sr) sr.textContent = words.join(", ");

  let wIdx = 0, cIdx = 0, del = false;
  function type() {
    if (reduceMotion.matches) {
      // No typing motion: show whole words and swap them slowly.
      te.textContent = words[wIdx];
      wIdx = (wIdx + 1) % words.length;
      setTimeout(type, 2600);
      return;
    }
    const w = words[wIdx];
    del ? cIdx-- : cIdx++;
    te.textContent = w.substring(0, cIdx);
    if (!del && cIdx === w.length) { del = true; setTimeout(type, 1100); return; }
    if (del && cIdx === 0) { del = false; wIdx = (wIdx + 1) % words.length; }
    setTimeout(type, del ? 28 : 55);
  }
  type();
})();

/* --- Navbar background --- */
(function () {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;
  // Project pages have no hero, so the bar stays solid there.
  if (!document.getElementById("hero-canvas")) {
    navbar.classList.add("scrolled");
    return;
  }
  const update = () => navbar.classList.toggle("scrolled", window.scrollY > 30);
  window.addEventListener("scroll", update, { passive: true });
  update();
})();

/* --- Mobile nav --- */
(function () {
  const toggle = document.getElementById("nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  if (!toggle || !mobileNav) return;

  function setOpen(open) {
    mobileNav.classList.toggle("open", open);
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  toggle.addEventListener("click", () => setOpen(!mobileNav.classList.contains("open")));
  mobileNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && mobileNav.classList.contains("open")) {
      setOpen(false);
      toggle.focus();
    }
  });
  window.matchMedia("(min-width: 901px)").addEventListener("change", e => { if (e.matches) setOpen(false); });
})();

/* --- Experience tabs (WAI-ARIA tabs pattern) --- */
(function () {
  const tabs = Array.from(document.querySelectorAll(".tab-btn"));
  if (!tabs.length) return;

  function select(tab, focus) {
    tabs.forEach(t => {
      const on = t === tab;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById("tab-" + t.dataset.tab).classList.toggle("active", on);
    });
    if (focus) tab.focus();
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab, false));
    tab.addEventListener("keydown", e => {
      let next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") next = tabs[0];
      else if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); select(next, true); }
    });
  });
})();

/* --- Scroll reveal --- */
(function () {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;
  if (!("IntersectionObserver" in window)) {
    els.forEach(el => el.classList.add("visible"));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => observer.observe(el));
})();

/* --- Contact form --- */
(function () {
  const form = document.getElementById("contact-form");
  const succ = document.getElementById("form-success");
  const err = document.getElementById("form-error");
  if (!form || !succ) return;
  const btn = form.querySelector('[type="submit"]');
  const label = btn.textContent;

  form.addEventListener("submit", async e => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = "Sending…";
    if (err) err.hidden = true;
    try {
      const r = await fetch("https://formspree.io/f/mykbwlgz", { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      if (!r.ok) throw new Error(r.status);
      form.hidden = true;
      succ.hidden = false;
      succ.focus();
    } catch {
      if (err) err.hidden = false;
      btn.disabled = false;
      btn.textContent = label;
    }
  });
})();

/* --- Particle canvas --- */
(function () {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const hero = document.querySelector(".hero");
  const readColor = () => getComputedStyle(document.documentElement).getPropertyValue("--particle").trim() || "94,255,216";
  let COLOR = readColor();
  const repel = false;
  const MAX_PARTICLES = 260;

  let W = 0, H = 0;
  const mouse = { x: null, y: null, radius: 130 };
  let particles = [];
  let running = false, visible = true, frame = null;

  class Particle {
    constructor() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 1.2;
      this.vy = (Math.random() - 0.5) * 1.2;
      this.r = Math.random() * 1.8 + 0.8;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x - this.r < 0 || this.x + this.r > W) this.vx *= -1;
      if (this.y - this.r < 0 || this.y + this.r > H) this.vy *= -1;
      if (mouse.x !== null) {
        const dx = this.x - mouse.x, dy = this.y - mouse.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < mouse.radius) { repel ? (this.x += dx / 10, this.y += dy / 10) : (this.x -= dx / 80, this.y -= dy / 80); }
      }
    }
    draw() {
      let op = 0.4;
      if (mouse.x !== null) {
        const dx = this.x - mouse.x, dy = this.y - mouse.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 300) op = 0.5 + (1 - d / 300) * 0.85;
      }
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${COLOR},${op})`; ctx.fill();
    }
  }

  // Size the backing store for the screen's pixel density so dots stay crisp.
  function resize() {
    const r = hero.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const oldW = W, oldH = H;
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!particles.length) {
      const count = Math.min(MAX_PARTICLES, Math.floor((W * H) / 5500));
      particles = Array.from({ length: count }, () => new Particle());
    } else if (oldW && oldH) {
      particles.forEach(p => { p.x *= W / oldW; p.y *= H / oldH; });
    }
    if (reduceMotion.matches) render();
  }

  function connect() {
    const maxD = 130, mouseR = 380, mConnR = 130;
    if (mouse.x === null) return;
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x, dy = particles[a].y - particles[b].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < maxD) {
          const mx = (particles[a].x + particles[b].x) / 2, my = (particles[a].y + particles[b].y) / 2;
          const dm = Math.sqrt((mx - mouse.x) ** 2 + (my - mouse.y) ** 2);
          if (dm > mouseR) continue;
          const mf = Math.pow(1 - Math.min(dm / mouseR, 1), 0.5);
          const pf = 1 - d / maxD;
          ctx.strokeStyle = `rgba(${COLOR},${mf * pf})`; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(particles[a].x, particles[a].y); ctx.lineTo(particles[b].x, particles[b].y); ctx.stroke();
        }
      }
    }
    for (let i = 0; i < particles.length; i++) {
      const dx = particles[i].x - mouse.x, dy = particles[i].y - mouse.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > mConnR) continue;
      const mf = Math.min(Math.pow(Math.max(d / mConnR, 0.01), -0.35), 1);
      ctx.strokeStyle = `rgba(${COLOR},${mf})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
    }
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => p.draw());
    connect();
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    connect();
    frame = requestAnimationFrame(animate);
  }

  // Drift only while the hero is on screen and motion is allowed.
  function sync() {
    const shouldRun = visible && !reduceMotion.matches;
    if (shouldRun && !running) { running = true; animate(); }
    else if (!shouldRun && running) { running = false; cancelAnimationFrame(frame); render(); }
  }

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    // With Reduce Motion the dots hold still, but the lines still follow the pointer.
    if (!running && visible) requestAnimationFrame(render);
  }, { passive: true });
  document.addEventListener("mouseleave", () => {
    mouse.x = null; mouse.y = null;
    if (!running) render();
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(hero);
  }
  reduceMotion.addEventListener("change", sync);
  document.addEventListener("themechange", () => {
    COLOR = readColor();
    if (!running) render();
  });

  resize();
  render();
  sync();
})();

/* ===================== PROJECTS CAROUSEL ===================== */
(function () {
  const carousel = document.getElementById("projects-carousel");
  const prevBtn = document.getElementById("proj-prev");
  const nextBtn = document.getElementById("proj-next");
  if (!carousel || !prevBtn || !nextBtn) return;
  const wrap = carousel.parentElement;

  // One card plus the gap, measured so it stays right at every width.
  function step() {
    const card = carousel.querySelector(".project-card");
    if (!card) return 340;
    const gap = parseFloat(getComputedStyle(carousel).columnGap) || 0;
    return card.getBoundingClientRect().width + gap;
  }

  function update() {
    const atStart = carousel.scrollLeft <= 4;
    const atEnd = carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth - 4;
    prevBtn.disabled = atStart;
    nextBtn.disabled = atEnd;
    wrap.classList.toggle("can-prev", !atStart);
    wrap.classList.toggle("can-next", !atEnd);
  }

  const behavior = () => (reduceMotion.matches ? "auto" : "smooth");
  prevBtn.addEventListener("click", () => carousel.scrollBy({ left: -step(), behavior: behavior() }));
  nextBtn.addEventListener("click", () => carousel.scrollBy({ left: step(), behavior: behavior() }));

  carousel.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();

  /* Drag-to-scroll (mouse). A drag never counts as a click on a card. */
  let isDown = false, moved = false, startX = 0, startScroll = 0;
  carousel.addEventListener("mousedown", e => {
    if (e.button !== 0) return;
    isDown = true; moved = false;
    startX = e.pageX;
    startScroll = carousel.scrollLeft;
  });
  document.addEventListener("mousemove", e => {
    if (!isDown) return;
    const dx = e.pageX - startX;
    if (!moved && Math.abs(dx) > 5) { moved = true; carousel.classList.add("dragging"); }
    if (moved) { e.preventDefault(); carousel.scrollLeft = startScroll - dx; }
  });
  document.addEventListener("mouseup", () => {
    isDown = false;
    carousel.classList.remove("dragging");
  });
  carousel.addEventListener("click", e => {
    if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
  }, true);
  carousel.addEventListener("dragstart", e => e.preventDefault());
})();
