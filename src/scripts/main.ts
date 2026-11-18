// Galerías, lightbox y filtros: lógica original del portfolio.
// Cámara, intro y fondo: más abajo.
/* =========================================================
   3. GALERÍAS
   ========================================================= */
function initGalleries() {
  document.querySelectorAll('[data-gallery]').forEach((gallery) => {
    const track = gallery.querySelector('[data-track]');
    const slides = [...track.children];
    const thumbs = [...gallery.querySelectorAll('[data-thumb]')];
    const count = gallery.querySelector('[data-count]');
    let current = 0;
    // posición de scroll que deja el slide i centrado (sirve para 1 slide a ancho completo o varios verticales)
    const slideLeft = (i) => slides[i].offsetLeft - (track.clientWidth - slides[i].clientWidth) / 2;

    function setActive(index, scrollThumbs = true) {
      current = index;
      count.textContent = `${index + 1} / ${slides.length}`;
      thumbs.forEach((t, i) => t.classList.toggle('on', i === index));
      if (scrollThumbs && thumbs[index]) {
        const strip = thumbs[index].parentElement;
        const t = thumbs[index];
        strip.scrollTo({ left: t.offsetLeft - (strip.clientWidth - t.clientWidth) / 2, behavior: 'smooth' });
      }
    }
    function goTo(index) {
      const i = (index + slides.length) % slides.length;
      track.scrollTo({ left: slideLeft(i), behavior: 'smooth' });
      setActive(i);
    }
    let ticking = false;
    track.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const mid = track.scrollLeft + track.clientWidth / 2;
        let i = 0, best = Infinity;
        slides.forEach((s, n) => { const d = Math.abs(s.offsetLeft + s.clientWidth / 2 - mid); if (d < best) { best = d; i = n; } });
        if (i !== current) setActive(i);
      });
    });
    gallery.querySelector('[data-prev]').addEventListener('click', () => goTo(current - 1));
    gallery.querySelector('[data-next]').addEventListener('click', () => goTo(current + 1));
    thumbs.forEach((t, i) => t.addEventListener('click', () => goTo(i)));
    window.addEventListener('resize', () => track.scrollTo({ left: slideLeft(current) }));
    setActive(0, false);
  });
}

/* =========================================================
   4. LIGHTBOX
   ========================================================= */
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
const lbCount = document.getElementById('lb-count');
let lbGallery = [];
let lbIndex = 0;
let lastFocused = null;

function showLb() {
  const img = lbGallery[lbIndex];
  lbImg.src = img.currentSrc || img.src;
  lbImg.alt = img.alt;
  lbCount.textContent = `${lbIndex + 1} / ${lbGallery.length}`;
}
function openLb(img) {
  lastFocused = img;
  lbGallery = [...img.closest('[data-gallery]').querySelectorAll('[data-track] img')];
  lbIndex = lbGallery.indexOf(img);
  showLb();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('lb-close').focus();
}
function closeLb() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  if (lastFocused) lastFocused.focus();
}
function moveLb(step) {
  lbIndex = (lbIndex + step + lbGallery.length) % lbGallery.length;
  showLb();
}
function initLightbox() {
  document.querySelectorAll('[data-track] img').forEach((img) => {
    img.setAttribute('role', 'button');
    img.setAttribute('tabindex', '0');
    img.setAttribute('aria-label', `Ampliar ${img.alt}`);
    img.addEventListener('click', () => openLb(img));
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(img); }
    });
  });
  document.getElementById('lb-close').addEventListener('click', closeLb);
  document.getElementById('lb-prev').addEventListener('click', () => moveLb(-1));
  document.getElementById('lb-next').addEventListener('click', () => moveLb(1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLb(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') moveLb(-1);
    if (e.key === 'ArrowRight') moveLb(1);
  });
}

/* =========================================================
   5. FILTROS DE PROYECTOS
   ========================================================= */
function initFilters() {
  document.querySelectorAll('.filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const f = btn.dataset.filter;
      document.querySelectorAll('.proj').forEach((card) => {
        const show = f === 'all' || card.dataset.kind === f;
        card.classList.toggle('hide', !show);
      });
    });
  });
}

/* =========================================================
   CÁMARA LIGADA AL SCROLL + BROTE EN CANVAS
   El brote del logo se dibuja en un único canvas (nítido a cualquier zoom
   y sin repintar DOM). Coordenadas del logo: 1120×1120.
   ========================================================= */
type Cam = { x: number; y: number; s: number };
const CAM: Record<string, Cam> = {
  intro:     { x: 560, y: 552, s: 1.0 },
  corona:    { x: 566, y: 380, s: 3.3 },   // hoja central
  leafLeft:  { x: 474, y: 492, s: 3.1 },   // hoja izquierda
  stem:      { x: 556, y: 575, s: 2.9 },   // tallo
  leafRight: { x: 645, y: 492, s: 3.2 },   // hoja derecha
  roots:     { x: 560, y: 745, s: 2.2 },   // montículo "PZukko"
};
const scenes = [...document.querySelectorAll<HTMLElement>('.scene')];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const cvs = document.getElementById('fx') as HTMLCanvasElement;
const ctx = cvs.getContext('2d')!;

let vw = 0, vh = 0, dpr = 1, tops: number[] = [], started = false;
const cam: Cam = { ...CAM.intro };
let bias = 0.5;

function measure() {
  vw = innerWidth; vh = innerHeight;
  tops = scenes.map((s) => s.offsetTop);
  dpr = Math.min(devicePixelRatio || 1, 2);
  cvs.width = Math.round(vw * dpr); cvs.height = Math.round(vh * dpr);
}

const smooth = (t: number) => t * t * (3 - 2 * t);
function scrollTarget(): Cam {
  const p = scrollY + vh * 0.5, win = vh * 0.9;
  let c = { ...CAM[scenes[0].dataset.cam!] };
  for (let i = 1; i < scenes.length; i++) {
    const t = smooth(Math.min(1, Math.max(0, (p - tops[i] + win / 2) / win)));
    if (t === 0) break;
    const n = CAM[scenes[i].dataset.cam!];
    c = { x: c.x + (n.x - c.x) * t, y: c.y + (n.y - c.y) * t, s: c.s * Math.pow(n.s / c.s, t) };
  }
  return c;
}

/* --- formas y degradados del brote --- */
const lin = (x0: number, y0: number, x1: number, y1: number, st: [number, string][]) => {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  st.forEach(([o, c]) => g.addColorStop(o, c));
  return g;
};
const leafStops: [number, string][] = [[0, '#e2f94a'], [0.6, '#b9e83c'], [1, '#7fc83a']];
const G = {
  top: lin(560, 293, 590, 460, [[0, '#e0f84a'], [0.55, '#b4e63a'], [1, '#8fd23a']]),
  left: lin(400, 432, 545, 556, leafStops),
  right: lin(720, 432, 567, 556, leafStops),
  stem: lin(0, 452, 0, 680, [[0, '#a8de3a'], [1, '#5aa62c']]),
  hill: lin(0, 672, 0, 762, [[0, '#8ac841'], [1, '#3d7c2b']]),
  base: lin(0, 731, 0, 810, [[0, '#285c42'], [0.65, '#1a4533'], [1, 'rgba(12,42,28,0)']]),
  aura: (() => { const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, 'rgba(182,240,58,.22)'); g.addColorStop(0.6, 'rgba(74,222,128,.06)'); g.addColorStop(1, 'rgba(74,222,128,0)'); return g; })(),
};
const PATH = {
  hill: new Path2D('M352 762C385 712 475 672 560 672C645 672 725 706 768 762Z'),
  base: new Path2D('M278 770C278 744 322 731 372 732C440 733 500 751 560 751C625 751 690 731 752 735C806 738 828 752 827 772C826 796 700 810 560 810C420 810 279 800 278 770Z'),
  stem: new Path2D('M558 702C556 650 560 590 553 548C548 515 548 480 551 452'),
  fork: new Path2D('M556 592C558 574 562 560 568 550'),
  right: new Path2D('M720 432C665 428 598 440 567 478C565 500 563 528 561 548C625 556 685 540 706 480C713 460 716 445 720 432Z'),
  rVein: new Path2D('M648 478C618 495 594 520 578 546'),
  left: new Path2D('M400 432C455 428 520 440 545 478L541 546C495 556 450 540 430 490C420 462 410 445 400 432Z'),
  lVein: new Path2D('M458 468C490 482 520 505 541 528'),
  top: new Path2D('M578 293C560 330 513 365 513 405C513 440 540 460 565 460C595 460 615 435 615 400C615 360 592 320 578 293Z'),
  tVein: new Path2D('M553 367C547 400 546 430 548 455'),
  spk: new Path2D('M0-10Q1.5-1.5 10 0Q1.5 1.5 0 10Q-1.5 1.5-10 0Q-1.5-1.5 0-10Z'),
};
const SPARKS = [[421,368,1.8],[648,387,.9],[469,378,.3],[384,395,.25],[437,391,.2],[631,340,.25],[674,383,.2],[444,581,.9],[484,567,.6],[513,600,.8],[594,604,.7],[655,592,1.9],[649,654,.9],[620,620,.3],[676,614,.3],[478,658,.4],[603,648,.3],[408,549,.25],[430,602,.25],[695,556,.3]];

const pivot = (ox: number, oy: number, a: number) => { ctx.translate(ox, oy); ctx.rotate(a); ctx.translate(-ox, -oy); };
function leaf(shape: Path2D, g: CanvasGradient, vein: Path2D, ox: number, oy: number, a: number) {
  ctx.save(); pivot(ox, oy, a);
  ctx.fillStyle = g; ctx.fill(shape);
  ctx.strokeStyle = 'rgba(47,122,31,.85)'; ctx.lineWidth = 4.5; ctx.stroke(vein);
  ctx.restore();
}

function drawPlant(t: number) {
  const bob = (period: number) => -0.031 * (0.5 + 0.5 * Math.sin((t * 6.283) / period));
  ctx.save(); ctx.translate(560, 540); ctx.scale(430, 400);
  ctx.globalAlpha = 0.75 + 0.25 * Math.sin(t * 0.9);
  ctx.fillStyle = G.aura; ctx.beginPath(); ctx.arc(0, 0, 1, 0, 6.283); ctx.fill();
  ctx.restore();

  ctx.save(); pivot(558, 680, Math.sin((t * 6.283) / 12) * 0.0175);   // balanceo ±1°
  ctx.lineCap = 'round';
  ctx.lineWidth = 18; ctx.strokeStyle = G.stem; ctx.stroke(PATH.stem);
  ctx.lineWidth = 12; ctx.strokeStyle = '#6cb62e'; ctx.stroke(PATH.fork);
  leaf(PATH.right, G.right, PATH.rVein, 561, 548, -bob(9.5));
  leaf(PATH.left, G.left, PATH.lVein, 541, 546, bob(8));
  leaf(PATH.top, G.top, PATH.tVein, 556, 458, bob(10));
  ctx.restore();

  ctx.fillStyle = G.hill; ctx.fill(PATH.hill);
  ctx.fillStyle = G.base; ctx.fill(PATH.base);
  ctx.font = '700 38px "Space Grotesk", system-ui, sans-serif'; ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(79,128,104,.9)'; ctx.fillText('PZukko', 560, 810);

  ctx.fillStyle = '#e6f75a';
  SPARKS.forEach(([x, y, s], i) => {
    ctx.globalAlpha = reduce ? 0.7 : 0.15 + 0.85 * (0.5 + 0.5 * Math.sin(t * (1.2 + (i % 5) * 0.25) + i * 1.7));
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fill(PATH.spk); ctx.restore();
  });
  ctx.globalAlpha = 1;
}

/* estrellas y esporas */
const stars = Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() < 0.15 ? 1.4 : 0.9, p: Math.random() * 6.28, v: 0.8 + Math.random() * 1.6 }));
const spores = Array.from({ length: 16 }, () => ({ x: 0.3 + Math.random() * 0.4, y: Math.random(), v: 0.02 + Math.random() * 0.03, w: Math.random() * 6.28 }));
function drawFx(t: number, dt: number) {
  ctx.fillStyle = '#e8ffc2';
  for (const s of stars) {
    ctx.globalAlpha = 0.08 + 0.55 * (0.5 + 0.5 * Math.sin(t * s.v + s.p));
    ctx.beginPath(); ctx.arc(s.x * vw, s.y * vh, s.r, 0, 6.283); ctx.fill();
  }
  ctx.fillStyle = '#d9f99d';
  for (const s of spores) {
    if (!reduce) { s.y -= s.v * dt; if (s.y < -0.05) { s.y = 1.05; s.x = 0.3 + Math.random() * 0.4; } }
    ctx.globalAlpha = 0.8 * Math.sin(Math.PI * Math.min(1, Math.max(0, s.y)));
    ctx.beginPath(); ctx.arc(s.x * vw + Math.sin(t * 0.5 + s.w) * 20, s.y * vh, 1.6, 0, 6.283); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/* etiqueta "estás aquí": punto sobre la parte del brote + nombre de la sección */
const PARTS: Record<string, { part: string; label: string; x: number; y: number }> = {
  'sobre-mi':  { part: 'Hoja superior',  label: 'Sobre mí',    x: 566, y: 385 },
  proyectos:   { part: 'Hoja izquierda', label: 'Proyectos',   x: 474, y: 495 },
  stack:       { part: 'Tallo',          label: 'Skills',      x: 553, y: 600 },
  trayectoria: { part: 'Hoja derecha',   label: 'Trayectoria', x: 645, y: 495 },
  contacto:    { part: 'Raíces',         label: 'Contacto',    x: 560, y: 775 },
};
let activeId = 'sobre-mi';
const tag = { id: '', a: 0 };
function drawTag(t: number, dt: number, S: number) {
  const want = started && vw >= 1024 ? activeId : '';
  tag.a = Math.min(1, Math.max(0, tag.a + (tag.id === want ? dt * 4 : -dt * 6)));
  if (tag.a === 0) tag.id = want;
  const p = PARTS[tag.id];
  if (!p || tag.a === 0) return;
  const sx = vw * bias + (p.x - cam.x) * S, sy = vh * 0.5 + (p.y - cam.y) * S;
  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalAlpha = tag.a;
  ctx.font = '500 12px "Space Grotesk", system-ui, sans-serif';
  const w1 = ctx.measureText(p.part).width;
  ctx.font = '700 15px "Space Grotesk", system-ui, sans-serif';
  const w = w1 + ctx.measureText(p.label).width + 54, h = 38;
  const x = Math.max(vw * bias - w / 2, vw * 0.66), y = vh - 40 - h;
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(x + w / 2, y);
  ctx.strokeStyle = 'rgba(6,24,10,.55)'; ctx.lineWidth = 4; ctx.stroke();
  ctx.strokeStyle = 'rgba(244,255,217,.9)'; ctx.lineWidth = 1.5; ctx.stroke();
  const pulse = 0.5 + 0.5 * Math.sin(t * 3);
  ctx.strokeStyle = `rgba(244,255,217,${(0.8 - 0.65 * pulse).toFixed(2)})`; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(sx, sy, 11 + 9 * pulse, 0, 6.283); ctx.stroke();
  ctx.fillStyle = '#06210e'; ctx.strokeStyle = '#f4ffd9'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(sx, sy, 7, 0, 6.283); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(6,16,9,.92)'; ctx.strokeStyle = 'rgba(190,242,100,.45)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.fill(); ctx.stroke();
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.font = '500 12px "Space Grotesk", system-ui, sans-serif';
  ctx.fillStyle = '#9db98a'; ctx.fillText(p.part, x + 18, y + h / 2);
  ctx.fillStyle = 'rgba(190,242,100,.45)'; ctx.fillRect(x + 18 + w1 + 9, y + 11, 1, h - 22);
  ctx.font = '700 15px "Space Grotesk", system-ui, sans-serif';
  ctx.fillStyle = '#f4ffd9'; ctx.fillText(p.label, x + 18 + w1 + 18, y + h / 2);
  ctx.restore();
}

let last = performance.now(), lastDraw = 0;
function frame(now: number) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  const t = started ? scrollTarget() : CAM.intro;
  const tb = started && vw >= 1024 ? 0.72 : 0.5;   // en escritorio el brote va a la derecha
  const dx = t.x - cam.x, dy = t.y - cam.y, ds = t.s - cam.s, db = tb - bias;
  const moving = Math.abs(dx) + Math.abs(dy) + Math.abs(ds) * 100 + Math.abs(db) * 100;
  if (moving < 0.01 || reduce) { cam.x = t.x; cam.y = t.y; cam.s = t.s; bias = tb; }
  else { const a = 1 - Math.exp(-dt * 5.5); cam.x += dx * a; cam.y += dy * a; cam.s += ds * a; bias += db * a; }
  if (!moving && now - lastDraw < 33) return;   // en reposo basta con ~30 fps
  lastDraw = now;

  const time = reduce ? 0 : now / 1000;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, vw, vh);
  drawFx(time, dt);
  const S = (Math.min(vw, vh) / 1120) * cam.s;
  ctx.setTransform(dpr * S, 0, 0, dpr * S, dpr * (vw * bias - cam.x * S), dpr * (vh * 0.5 - cam.y * S));
  drawPlant(time);
  drawTag(time, dt, S);
}

/* sección activa (revelado de paneles + índice lateral) sin leer layout en cada scroll */
const rail = [...document.querySelectorAll<HTMLElement>('#rail a')];
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  activeId = (e.target as HTMLElement).id;
  scenes.forEach((s) => s.classList.toggle('active', s === e.target));
  rail.forEach((a) => a.classList.toggle('active', a.dataset.rail === (e.target as HTMLElement).id));
}), { rootMargin: '-42% 0px -42% 0px' });
scenes.forEach((s) => io.observe(s));

/* intro */
const intro = document.getElementById('intro')!;
function enter() {
  if (started) return;
  started = true;
  intro.classList.add('gone');
  document.body.classList.remove('intro');
  document.body.classList.add('ready');
}
document.getElementById('enter')!.addEventListener('click', enter);
intro.addEventListener('wheel', enter, { passive: true });
intro.addEventListener('touchmove', enter, { passive: true });
addEventListener('keydown', (e) => {
  if (!started && ['Enter', ' ', 'ArrowDown'].includes(e.key)) { e.preventDefault(); enter(); }
});

/* arranque */
document.getElementById('year')!.textContent = String(new Date().getFullYear());
initGalleries();
initLightbox();
initFilters();
measure();
addEventListener('resize', measure);
new ResizeObserver(() => { tops = scenes.map((s) => s.offsetTop); }).observe(document.querySelector('main')!);
if (scrollY > 40) enter();   // si se recarga a mitad de página, se salta la intro
requestAnimationFrame(frame);
