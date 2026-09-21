document.addEventListener("DOMContentLoaded", () => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
  const DATA = window.SITE;

  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const CHEV_L = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
  const CHEV_R = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
  const ICONS = {
    facebook:'<circle cx="12" cy="12" r="9.2"/><path d="M13.4 20.5v-7h2.4l.4-2.8h-2.8V9.1c0-.8.3-1.3 1.4-1.3h1.5V5.3c-.3 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.6v2h-2.4v2.8h2.4v7"/>',
    email:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7.5l8 6 8-6"/>',
    discord:'<path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-6l-4 3v-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/><circle cx="9" cy="11" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1" fill="currentColor" stroke="none"/>'
  };
  const icon = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k]}</svg>`;

  $("#emailBtn").href = "mailto:" + DATA.email;
  $("#socials").innerHTML = `
    <a class="social" href="${esc(DATA.facebook)}" target="_blank" rel="noopener">
      <span class="ico">${icon("facebook")}</span><span><b>Facebook</b><small>Sasha Creatives</small></span>
    </a>
    <a class="social" href="mailto:${esc(DATA.email)}">
      <span class="ico">${icon("email")}</span><span><b>Gmail</b><small>${esc(DATA.email)}</small></span>
    </a>
    <button class="social" id="copyDiscord" type="button" aria-label="Copy Discord username ${esc(DATA.discord)}">
      <span class="ico">${icon("discord")}</span><span><b>Discord</b><small>${esc(DATA.discord)}</small></span><span class="hint" aria-live="polite">Copy</span>
    </button>`;
  $("#copyDiscord").addEventListener("click", async e => {
    const hint = $(".hint", e.currentTarget);
    try { await navigator.clipboard.writeText(DATA.discord); }
    catch (err) { const t = document.createElement("textarea"); t.value = DATA.discord; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); } catch (err2) {} t.remove(); }
    hint.textContent = "Copied!";
    setTimeout(() => hint.textContent = "Copy", 1800);
  });

  const cats = DATA.categories;
  $("#jump").innerHTML = cats.map(c => `<a class="chip" href="#cat-${esc(c.id)}">${esc(c.title)}</a>`).join("");
  $("#cats").innerHTML = cats.map(c => `
    <article class="cat" id="cat-${esc(c.id)}">
      <div class="cat-head">
        <div><h3>${esc(c.title)}</h3><p>${esc(c.note)}</p></div>
        <div class="cat-tools">
          <button class="see-all" data-see="${esc(c.id)}">See all <small>${c.images.length}</small></button>
          <button class="arrow" data-dir="-1" aria-label="Previous ${esc(c.title)}">${CHEV_L}</button>
          <button class="arrow" data-dir="1" aria-label="Next ${esc(c.title)}">${CHEV_R}</button>
        </div>
      </div>
      <div class="track" tabindex="0" role="group" aria-label="${esc(c.title)} carousel">
        ${c.images.map((k, i) => `<button class="slide" data-cat="${esc(c.id)}" data-i="${i}"><img src="${esc(k)}" alt="${esc(c.title)} sample ${i + 1}" width="400" height="400" loading="lazy" decoding="async"></button>`).join("")}
      </div>
    </article>`).join("");

  const commItems = [];
  (DATA.commissions || []).forEach(c => c.images.forEach(im => commItems.push(Object.assign({}, im, { name: c.name }))));
  const COMM = { id: "commission", title: "Our Successful Commissions", images: commItems.map(x => x.src), items: commItems };
  const commBox = $("#commissionShowcase");
  if (commItems.length) {
    const ratio = im => (im.w && im.h) ? Math.min(Math.max(im.w / im.h, 0.72), 1.8).toFixed(3) : 1;
    $("#commCount").textContent = commItems.length;
    $('[data-dir="-1"]', commBox).innerHTML = CHEV_L;
    $('[data-dir="1"]', commBox).innerHTML = CHEV_R;
    $("#commTrack").innerHTML = commItems.map((im, i) => `<button class="slide" type="button" data-cat="commission" data-i="${i}" style="--r:${ratio(im)}" aria-label="${esc(im.name)} - ${esc(im.label)}"><img src="${esc(im.src)}" alt="${esc(im.name)} - ${esc(im.label)}" width="${im.w || 400}" height="${im.h || 400}" loading="lazy" decoding="async"><span class="c-name">${esc(im.name)}</span></button>`).join("");
  } else if (commBox) commBox.hidden = true;

  const scrollTrack = (track, dx) => {
    try { track.scrollBy({ left: dx, behavior: "smooth" }); }
    catch (err) { track.scrollLeft += dx; }
  };

  $$(".cat, .showcase").forEach(cat => {
    const track = $(".track", cat), prev = $('[data-dir="-1"]', cat), next = $('[data-dir="1"]', cat);
    const sync = () => {
      const max = track.scrollWidth - track.clientWidth;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max - 2;
      $(".cat-tools", cat).classList.toggle("no-scroll", max <= 2);
      if (max <= 2) { prev.hidden = next.hidden = true; } else { prev.hidden = next.hidden = false; }
    };
    const step = () => cat.classList.contains("showcase") ? Math.round(track.clientWidth * 0.85) : ($(".slide", track).offsetWidth + 16);
    prev.addEventListener("click", () => scrollTrack(track, -step()));
    next.addEventListener("click", () => scrollTrack(track, step()));
    track.addEventListener("scroll", sync, { passive: true });
    track.addEventListener("keydown", e => {
      if (e.key === "ArrowRight") { e.preventDefault(); scrollTrack(track, step()); }
      if (e.key === "ArrowLeft") { e.preventDefault(); scrollTrack(track, -step()); }
    });
    addEventListener("resize", sync);
    sync();
  });

  const gal = $("#gallery"), gBody = $(".g-body", gal), gGrid = $("#gGrid"), gSingle = $("#gSingle"), gImg = $("#gImg");
  let cur = { cat: null, i: 0 }, lastFocus = null, io = null;
  const catById = id => id === "commission" ? COMM : cats.find(c => c.id === id);
  const fitGallery = () => gal.style.setProperty("--gh", window.innerHeight + "px");

  function loadThumbs() {
    if (io) { io.disconnect(); io = null; }
    const imgs = $$("img[data-src]", gGrid);
    const load = im => { im.src = im.getAttribute("data-src"); im.removeAttribute("data-src"); };
    if (!("IntersectionObserver" in window)) { imgs.forEach(load); return; }
    io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { load(en.target); io.unobserve(en.target); }
    }), { root: gBody, rootMargin: "600px 0px" });
    imgs.forEach(im => io.observe(im));
  }

  function showGrid() {
    const c = catById(cur.cat);
    $("#gTitle").innerHTML = `${esc(c.title)} <small>${c.images.length} works</small>`;
    gGrid.innerHTML = c.images.map((k, i) => {
      const it = c.items && c.items[i];
      const head = it && (i === 0 || c.items[i - 1].name !== it.name)
        ? `<h4 class="g-group">${esc(it.name)} <small>${c.items.filter(x => x.name === it.name).length}</small></h4>` : "";
      const alt = it ? `${it.name} - ${it.label}` : `${c.title} sample ${i + 1}`;
      return head + `<button type="button" class="g-thumb${it ? " fit" : ""}" data-i="${i}"><img data-src="${esc(k)}" alt="${esc(alt)}" decoding="async"></button>`;
    }).join("");
    gGrid.hidden = false; gSingle.hidden = true; $("#gBack").hidden = true;
    gBody.scrollTop = 0;
    loadThumbs();
  }
  function showSingle(i) {
    const c = catById(cur.cat), n = c.images.length;
    if (io) { io.disconnect(); io = null; }
    cur.i = (i + n) % n;
    const it = c.items && c.items[cur.i];
    gImg.alt = it ? `${it.name} - ${it.label}` : `${c.title} sample ${cur.i + 1}`;
    gImg.src = c.images[cur.i];
    $("#gCount").textContent = `${cur.i + 1} / ${n}`;
    $("#gTitle").innerHTML = it ? `${esc(it.name)} <small>${esc(it.label)}</small>` : esc(c.title);
    gGrid.hidden = true; gSingle.hidden = false; $("#gBack").hidden = false;
    gBody.scrollTop = 0;
  }
  function openGallery(id, view, i) {
    cur = { cat: id, i: i || 0 };
    fitGallery();
    if (gal.hidden) {
      lastFocus = document.activeElement;
      gal.hidden = false;
      document.documentElement.classList.add("g-lock");
    }
    if (view === "single") showSingle(cur.i); else showGrid();
    $("#gClose").focus();
  }
  function closeGallery() {
    if (gal.hidden) return;
    gal.hidden = true;
    document.documentElement.classList.remove("g-lock");
    if (io) { io.disconnect(); io = null; }
    gImg.removeAttribute("src");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  [$("#cats"), commBox].forEach(box => box && box.addEventListener("click", e => {
    const see = e.target.closest("[data-see]"), slide = e.target.closest(".slide");
    if (see) openGallery(see.dataset.see, "grid");
    else if (slide) openGallery(slide.dataset.cat, "single", +slide.dataset.i);
  }));
  gGrid.addEventListener("click", e => { const t = e.target.closest(".g-thumb"); if (t) showSingle(+t.dataset.i); });
  $("#gBack").addEventListener("click", showGrid);
  $("#gPrev").addEventListener("click", () => showSingle(cur.i - 1));
  $("#gNext").addEventListener("click", () => showSingle(cur.i + 1));
  $("#gClose").addEventListener("click", closeGallery);
  gal.addEventListener("click", e => { if (e.target === gal) closeGallery(); });
  addEventListener("resize", () => { if (!gal.hidden) fitGallery(); });
  addEventListener("orientationchange", () => { if (!gal.hidden) fitGallery(); });
  document.addEventListener("keydown", e => {
    if (gal.hidden) return;
    if (e.key === "Escape") { closeGallery(); return; }
    if (!gSingle.hidden) {
      if (e.key === "ArrowLeft") showSingle(cur.i - 1);
      if (e.key === "ArrowRight") showSingle(cur.i + 1);
    }
    if (e.key === "Tab") {
      const f = $$("button, a[href]", gal).filter(el => !el.hidden && el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  let sx = null;
  gSingle.addEventListener("touchstart", e => { sx = e.changedTouches[0].clientX; }, { passive: true });
  gSingle.addEventListener("touchend", e => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50) showSingle(cur.i + (dx < 0 ? 1 : -1));
  }, { passive: true });

  $("#pricingGrid").innerHTML = DATA.pricing.map(p => `
    <article class="price-card ${p.featured ? "featured" : ""}">
      <div><h3>${esc(p.name)}</h3><p class="desc" style="margin-top:8px">${esc(p.desc || "")}</p></div>
      <div><span class="from">${esc(p.label)}</span><div class="price">${esc(p.price)}</div></div>
      <ul class="includes">${p.includes.map(x => `<li>${CHECK}<span>${esc(x)}</span></li>`).join("")}</ul>
      ${p.note ? `<p class="note">${esc(p.note)}</p>` : ""}
      <a class="btn btn-primary" href="#contact">Contact for Commission</a>
    </article>`).join("");

  $("#typeTags").innerHTML = cats.map(c => `<li>${esc(c.title)}</li>`).join("");
  $("#prepList").innerHTML = DATA.prepare.map(t => `<li>${CHECK}<span>${esc(t)}</span></li>`).join("");
  $("#steps").innerHTML = DATA.process.map((s, i) => `<li><div class="num">${i + 1}</div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join("");

  const menuBtn = $("#menuBtn"), links = $("#navLinks");
  const setMenu = open => { links.classList.toggle("open", open); menuBtn.setAttribute("aria-expanded", open); menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu"); };
  menuBtn.addEventListener("click", () => setMenu(!links.classList.contains("open")));
  links.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });
  const wideMq = matchMedia("(min-width:861px)"), onWide = () => setMenu(false);
  if (wideMq.addEventListener) wideMq.addEventListener("change", onWide); else if (wideMq.addListener) wideMq.addListener(onWide);

  const sections = $$("[data-nav]"), navLinks = $$(".nav-links a"), nav = $("#nav");
  let ticking = false;
  const update = () => {
    ticking = false;
    nav.classList.toggle("scrolled", scrollY > 8);
    const line = innerHeight * 0.35;
    let current = sections[0].dataset.nav;
    for (const s of sections) if (s.getBoundingClientRect().top <= line) current = s.dataset.nav;
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) current = "contact";
    navLinks.forEach(a => a.setAttribute("aria-current", a.dataset.target === current));
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener("resize", update);
  update();
});
