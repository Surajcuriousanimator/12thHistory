/* ============================================================================
   ERA 1900–1950 · App logic
   Horizontal zoomable scale · sounds · navspy · memory tips · quiz · modal
   ============================================================================ */

(function () {
  "use strict";

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  const Y0 = 1900, Y1 = 1950, SPAN = Y1 - Y0;
  let PAD = 110; // horizontal gutter, recomputed responsively in pxRange()

  const EVENTS = [...TIMELINE].sort((a, b) => (a.year - b.year) || (a.track > b.track ? 1 : -1));
  EVENTS.forEach((e, i) => (e._i = i));
  /* stagger order within each track */
  ["india", "world"].forEach((tr) => {
    EVENTS.filter((e) => e.track === tr).forEach((e, i) => (e._tall = i % 2 === 1));
  });

  /* ============================ SOUND ENGINE ============================ */
  const Sound = (() => {
    let ctx = null;
    let muted = localStorage.getItem("era-muted") === "1";
    const ensure = () => { if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } return ctx; };
    function blip(freq, dur, type = "sine", gain = 0.05, slideTo) {
      if (muted) return; const c = ensure(); if (!c) return;
      if (c.state === "suspended") c.resume();
      const o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, c.currentTime);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + dur);
      g.gain.setValueAtTime(0.0001, c.currentTime);
      g.gain.exponentialRampToValueAtTime(gain, c.currentTime + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
      o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + dur + 0.02);
    }
    return {
      tick:  () => blip(880, 0.05, "triangle", 0.035),
      pop:   () => { blip(523, 0.10, "sine", 0.05, 784); },
      open:  () => { blip(440, 0.12, "sine", 0.05, 660); },
      correct: () => { blip(660, 0.10, "sine", 0.06, 990); setTimeout(() => blip(990, 0.12, "sine", 0.05), 90); },
      wrong: () => blip(200, 0.18, "sawtooth", 0.04, 130),
      toggle() { muted = !muted; localStorage.setItem("era-muted", muted ? "1" : "0"); document.body.classList.toggle("muted", muted); if (!muted) this.tick(); return muted; },
      get muted() { return muted; }
    };
  })();

  /* ============================ HORIZONTAL TIMELINE ============================ */
  const viewport = $("#htViewport");
  const track = $("#htTrack");
  const tooltip = $("#htTooltip");
  let px = 24;            // pixels per year (current)
  let zoom = 0;           // 0..1
  let filter = "all";

  const xOf = (year) => PAD + (year - Y0) * px;

  function pxRange() {
    const vw = viewport.clientWidth || 800;
    PAD = clamp(vw * 0.09, 36, 110);       // responsive gutter
    const minPx = (vw - PAD * 2) / SPAN;   // all 50 years fit
    const maxPx = (vw - PAD * 2) / 5;      // ~5 years across
    return { minPx, maxPx, vw };
  }

  function buildTimeline() {
    let html = `<div class="ht-axis"></div>`;
    /* ruler ticks: every year, major every 10, medium every 5 */
    for (let y = Y0; y <= Y1; y++) {
      const major = y % 10 === 0;
      const med = y % 5 === 0;
      html += `<div class="tick ${major ? "major" : "minor"}" data-year="${y}"></div>`;
      if (major) html += `<div class="tick-label decade" data-year="${y}">${y}</div>`;
      else if (med) html += `<div class="tick-label" data-year="${y}">${y}</div>`;
    }
    /* markers */
    EVENTS.forEach((e, k) => {
      const d = (k * 24) + "ms";                       // entrance stagger
      const pd = (Math.random() * 2.6).toFixed(2) + "s"; // pulse-ring stagger
      html += `
        <button class="pt ${e.track} ${e._tall ? "tall" : ""}" style="--d:${d};--pd:${pd}" data-year="${e.year}" data-index="${e._i}" data-track="${e.track}" aria-label="${e.year} ${e.title}">
          <span class="pt-flag">
            <span class="pt-ico">${svgFor(e.icon)}</span>
            <span class="pt-txt"><b>${e.year}</b><small>${e.title}</small></span>
          </span>
          <span class="pt-stem"></span>
          <span class="pt-node"></span>
        </button>`;
    });
    track.innerHTML = html;
  }

  function layout() {
    const { minPx, maxPx, vw } = pxRange();
    px = lerp(minPx, maxPx, zoom);
    track.style.width = (SPAN * px + PAD * 2) + "px";

    $$(".tick", track).forEach((t) => (t.style.left = xOf(+t.dataset.year) + "px"));
    $$(".tick-label", track).forEach((t) => (t.style.left = xOf(+t.dataset.year) + "px"));
    $$(".pt", track).forEach((p) => (p.style.left = xOf(+p.dataset.year) + "px"));

    /* label density: dots → icon chips → full titles.
       Titles only appear once same-row neighbours (≥2 yrs apart) clear the
       card width, so they never overlap; the hover tooltip covers lower zooms. */
    track.classList.toggle("show-title", px >= 96);
    track.classList.toggle("dots", px < 32);

    /* hide the every-5-year labels when zoomed out so they never overlap */
    const showMed = px >= 22;
    $$(".tick-label:not(.decade)", track).forEach((l) => (l.style.display = showMed ? "" : "none"));

    /* readout */
    const visible = clamp(Math.round(vw / px), 5, 50);
    $("#zoomReadout").textContent = visible + " yrs";
  }

  function applyFilter(f) {
    filter = f;
    $$(".pt", track).forEach((p) => {
      p.style.display = f !== "all" && p.dataset.track !== f ? "none" : "";
    });
  }

  function setupFilter() {
    $$(".seg-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        $$(".seg-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        applyFilter(btn.dataset.filter);
      });
    });
  }

  function setZoom(v, focusCenter = true) {
    const prevCenterYear = focusCenter ? (viewport.scrollLeft + viewport.clientWidth / 2 - PAD) / px + Y0 : null;
    zoom = clamp(v, 0, 1);
    $("#zoomSlider").value = Math.round(zoom * 100);
    layout();
    if (prevCenterYear != null) {
      viewport.scrollLeft = xOf(prevCenterYear) - viewport.clientWidth / 2;
    }
  }

  /* set zoom so ~`years` are visible, optionally centring on a given year */
  function setZoomYears(years, centerYear) {
    const { minPx, maxPx, vw } = pxRange();
    const target = vw / years;
    setZoom(clamp((target - minPx) / (maxPx - minPx), 0, 1), false);
    if (centerYear != null) viewport.scrollLeft = xOf(centerYear) - viewport.clientWidth / 2;
  }

  /* ---- pan (drag) ---- */
  function setupPan() {
    let down = false, startX = 0, startScroll = 0, moved = false;
    viewport.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".pt")) return; // let marker clicks through
      down = true; moved = false; startX = e.clientX; startScroll = viewport.scrollLeft;
      viewport.classList.add("dragging"); viewport.setPointerCapture(e.pointerId);
    });
    viewport.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 3) moved = true;
      viewport.scrollLeft = startScroll - dx;
    });
    const end = () => { down = false; viewport.classList.remove("dragging"); };
    viewport.addEventListener("pointerup", end);
    viewport.addEventListener("pointercancel", end);
    /* wheel → horizontal */
    viewport.addEventListener("wheel", (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { viewport.scrollLeft += e.deltaY; e.preventDefault(); }
    }, { passive: false });
  }

  /* ---- tooltip ---- */
  function setupTooltip() {
    track.addEventListener("pointerover", (e) => {
      const pt = e.target.closest(".pt"); if (!pt) return;
      const ev = EVENTS[+pt.dataset.index];
      tooltip.className = "ht-tooltip show " + ev.track;
      tooltip.innerHTML = `<b>${ev.year}</b>${ev.title}`;
      const r = $(".pt-node", pt).getBoundingClientRect();
      tooltip.style.left = r.left + r.width / 2 + "px";
      tooltip.style.top = r.top - 12 + "px";
      Sound.tick();
    });
    track.addEventListener("pointerout", (e) => {
      if (e.target.closest(".pt")) tooltip.classList.remove("show");
    });
  }

  /* ---- zoom controls ---- */
  function setupZoom() {
    const slider = $("#zoomSlider");
    let lastTick = 0;
    slider.addEventListener("input", () => {
      setZoom(slider.value / 100);
      const now = performance.now(); if (now - lastTick > 60) { Sound.tick(); lastTick = now; }
    });
    $("#zoomIn").addEventListener("click", () => setZoom(zoom + 0.16));
    $("#zoomOut").addEventListener("click", () => setZoom(zoom - 0.16));
  }

  /* ============================ MODAL ============================ */
  function setupModal() {
    const backdrop = $("#modalBackdrop");
    let idx = null;
    function fill(i) {
      const e = EVENTS[i]; if (!e) return; idx = i;
      const m = $(".modal", backdrop);
      m.classList.toggle("india-accent", e.track === "india");
      m.classList.toggle("world-accent", e.track === "world");
      $("#modalArt").innerHTML = svgFor(e.icon);
      /* per-point photo: assets/img/point{N}.png  (N = chronological order, 1-based).
         Shows automatically once you drop the file in; falls back to the emblem. */
      const img = $("#modalImg");
      m.classList.remove("has-img");
      img.alt = e.title;
      img.onload = () => m.classList.add("has-img");
      img.onerror = () => m.classList.remove("has-img");
      img.src = `assets/img/point${i + 1}.png`;
      const t = $("#modalTrack"); t.textContent = e.track === "india" ? "Indian National Movement" : "World History"; t.className = "modal-track " + e.track;
      $("#modalYear").textContent = e.year;
      $("#modalTitle").textContent = e.title;
      $("#modalTag").textContent = e.tag;
      $("#modalDetail").textContent = e.detail;
      $("#modalRemember").textContent = e.remember;
      $("#modalUnit").textContent = e.unit ? `Textbook Unit ${e.unit}` : "";
    }
    function open(i) { fill(i); backdrop.classList.add("show"); backdrop.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; Sound.pop(); }
    function close() { backdrop.classList.remove("show"); backdrop.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; }
    function step(d) { fill((idx + d + EVENTS.length) % EVENTS.length); Sound.tick(); }

    track.addEventListener("click", (e) => {
      const pt = e.target.closest(".pt"); if (pt) open(+pt.dataset.index);
    });
    $("#modalClose").addEventListener("click", close);
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });
    $("#modalPrev").addEventListener("click", () => step(-1));
    $("#modalNext").addEventListener("click", () => step(1));
    document.addEventListener("keydown", (e) => {
      if (!backdrop.classList.contains("show")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }

  /* ============================ REMEMBER CARDS ============================ */
  function buildTips() {
    $("#tipsGrid").innerHTML = MEMORY_TIPS.map((t) =>
      `<div class="tip"><div class="tip-ico">${svgFor(t.icon)}</div><h4>${t.title}</h4><p>${t.text}</p></div>`
    ).join("");
    const io = new IntersectionObserver((ent) => ent.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("show"); io.unobserve(en.target); } }), { threshold: 0.2 });
    $$(".tip").forEach((el, i) => { el.style.transitionDelay = (i * 70) + "ms"; io.observe(el); });
  }

  /* ============================ QUIZ ============================ */
  function setupQuiz() {
    let i = 0, score = 0, answered = false;
    const qEl = $("#quizQ"), optEl = $("#quizOptions"), whyEl = $("#quizWhy"),
          nextBtn = $("#quizNext"), countEl = $("#quizCount"), scoreEl = $("#quizScore"),
          barEl = $("#quizBar"), card = $("#quizRoot"), resultEl = $("#quizResult");
    const KEYS = ["A", "B", "C", "D"];

    function render() {
      answered = false;
      const item = QUIZ[i];
      countEl.textContent = `Question ${i + 1} / ${QUIZ.length}`;
      scoreEl.textContent = `Score ${score}`;
      barEl.style.width = (i / QUIZ.length) * 100 + "%";
      qEl.textContent = item.q;
      whyEl.textContent = item.why; whyEl.classList.remove("show");
      nextBtn.disabled = true;
      nextBtn.textContent = i === QUIZ.length - 1 ? "See Result →" : "Next →";
      optEl.innerHTML = item.options.map((o, k) =>
        `<button class="quiz-opt" data-k="${k}"><span class="key">${KEYS[k]}</span><span>${o}</span></button>`
      ).join("");
    }
    function choose(k, btn) {
      if (answered) return; answered = true;
      const item = QUIZ[i];
      $$(".quiz-opt", optEl).forEach((b) => (b.disabled = true));
      if (k === item.answer) { btn.classList.add("correct"); score++; scoreEl.textContent = `Score ${score}`; Sound.correct(); }
      else { btn.classList.add("wrong"); $$(".quiz-opt", optEl)[item.answer].classList.add("correct"); Sound.wrong(); }
      whyEl.classList.add("show");
      nextBtn.disabled = false;
    }
    function next() {
      if (i < QUIZ.length - 1) { i++; render(); }
      else { finish(); }
    }
    function finish() {
      barEl.style.width = "100%";
      $$(".quiz-q, .quiz-options, .quiz-why, .quiz-actions, .quiz-meta", card).forEach((el) => (el.style.display = "none"));
      resultEl.hidden = false;
      const pct = Math.round((score / QUIZ.length) * 100);
      $("#quizResultTitle").textContent = `${score} / ${QUIZ.length}`;
      const msg = pct >= 85 ? "Outstanding — you've mastered the era!" :
                  pct >= 60 ? "Well done — a solid grasp of the timeline." :
                  pct >= 40 ? "Good start — revisit the timeline and try again." :
                              "Keep going — explore the timeline, then come back.";
      $("#quizResultText").textContent = msg;
      Sound.open();
    }
    function restart() {
      i = 0; score = 0; resultEl.hidden = true;
      $$(".quiz-q, .quiz-options, .quiz-why, .quiz-actions, .quiz-meta", card).forEach((el) => (el.style.display = ""));
      render();
    }
    optEl.addEventListener("click", (e) => { const b = e.target.closest(".quiz-opt"); if (b) choose(+b.dataset.k, b); });
    nextBtn.addEventListener("click", next);
    $("#quizRestart").addEventListener("click", restart);
    render();
  }

  /* ============================ NAVSPY ============================ */
  function setupNavspy() {
    const links = $$(".nav-link");
    const map = {}; links.forEach((l) => (map[l.getAttribute("href").slice(1)] = l));
    const io = new IntersectionObserver((ent) => {
      ent.forEach((en) => {
        if (en.isIntersecting) {
          links.forEach((l) => l.classList.remove("active"));
          map[en.target.id]?.classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("section.section, footer.section").forEach((s) => io.observe(s));
  }

  /* ============================ CHROME (theme, menu, sound, scroll) ============================ */
  function setupChrome() {
    const root = document.documentElement;
    const saved = localStorage.getItem("era-theme");
    if (saved) root.setAttribute("data-theme", saved);
    else if (window.matchMedia("(prefers-color-scheme: light)").matches) root.setAttribute("data-theme", "light");
    $("#themeToggle").addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next); localStorage.setItem("era-theme", next); Sound.tick();
    });

    if (Sound.muted) document.body.classList.add("muted");
    $("#soundToggle").addEventListener("click", () => Sound.toggle());

    /* side menu */
    const menu = $("#sideMenu"), overlay = $("#overlay"), toggle = $("#menuToggle");
    const setMenu = (s) => { menu.classList.toggle("open", s); overlay.classList.toggle("show", s); toggle.classList.toggle("active", s); toggle.setAttribute("aria-expanded", String(s)); };
    toggle.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
    overlay.addEventListener("click", () => setMenu(false));
    $$("[data-close]").forEach((a) => a.addEventListener("click", () => setMenu(false)));

    /* global click sounds */
    document.addEventListener("click", (e) => {
      const el = e.target.closest("[data-sound]"); if (!el) return;
      const kind = el.dataset.sound; if (Sound[kind]) Sound[kind]();
    });

    /* progress bar (navbar stays fixed at all times) */
    window.addEventListener("scroll", () => {
      const h = document.documentElement;
      $("#scrollProgress").style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + "%";
    }, { passive: true });

    $("#statEvents").textContent = EVENTS.length;
  }

  /* count-up animation for the hero stats */
  function countUp() {
    $$(".stat strong").forEach((el) => {
      const target = parseInt(el.textContent, 10);
      if (isNaN(target)) return;
      const dur = 1100, t0 = performance.now();
      el.style.opacity = "1";
      function step(t) {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  /* ============================ INIT ============================ */
  document.addEventListener("DOMContentLoaded", () => {
    buildTimeline();
    layout();
    setupPan();
    setupTooltip();
    setupZoom();
    setupFilter();
    setupModal();
    buildTips();
    setupQuiz();
    setupNavspy();
    setupChrome();
    setZoomYears(24, 1925);   // default view: ~24 years, centred on 1925
    countUp();

    let rT; window.addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(() => setZoom(zoom, false), 150); });
  });
})();
