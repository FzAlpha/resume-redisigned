// Interface layer: navigation, modals, toasts, copy buttons, typewriter, counters,
// plus the cinematic overlays (letterbox, boot log, title card) the acts drive.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

export class UI {
  constructor(audio) {
    this.audio = audio;
    this.bootLog = $('#boot-log');
    this.heroCopyEl = $('.hero-copy');
    this.scrollCue = $('.scroll-cue');
    this.#nav();
    this.#modals();
    this.#copy();
    this.#form();
    this.#typewriter();
    this.#hoverTicks();
  }

  // ------------------------------------------------------------ overlays
  letterbox(on) {
    const h = on ? Math.max(40, Math.round(innerHeight * 0.11)) : 0;
    document.documentElement.style.setProperty('--lb', `${h}px`);
  }
  boot(on) {
    $('#boot').classList.toggle('is-on', on);
    if (on) this.bootLog.innerHTML = '';
  }
  bootLine(text, cls) {
    const line = document.createElement('div');
    if (cls) line.className = cls;
    line.textContent = text;
    this.bootLog.appendChild(line);
  }
  titleCard(on) { $('#title-card').classList.toggle('is-on', on); }
  heroCopy(alpha) {
    this.heroCopyEl.style.opacity = alpha;
    this.heroCopyEl.style.transform = `translateY(${(1 - alpha) * -30}px)`;
    this.heroCopyEl.style.pointerEvents = alpha < 0.3 ? 'none' : '';
    this.scrollCue.style.opacity = alpha;
  }
  sceneWait(on, text = 'Loading scene') {
    $('#scene-wait').classList.toggle('is-on', on);
    $('#scene-wait-text').textContent = text;
  }

  /** Show elements whose data-reveal="a-b" range contains p (for the active act). */
  reveal(section, p) {
    for (const el of section.querySelectorAll('[data-reveal]')) {
      const [a, b] = el.dataset.reveal.split('-').map(Number);
      el.classList.toggle('is-shown', p >= a && p <= b);
    }
  }
  hideReveals(section) { section.querySelectorAll('[data-reveal].is-shown').forEach((el) => el.classList.remove('is-shown')); }

  hud(num, name) { $('#act-hud-num').textContent = num; $('#act-hud-name').textContent = name; }

  setNav(id) {
    if (!id) return;
    $$('.nav-item').forEach((a) => a.classList.toggle('is-active', a.dataset.nav === id));
  }

  reel(list) {
    const dots = $('#reel-dots');
    if (dots.children.length !== list.length) dots.innerHTML = list.map(() => '<i></i>').join('');
    let loaded = 0, total = 0;
    list.forEach((it, i) => {
      const d = dots.children[i];
      const done = it.state === 'downloaded' || it.state === 'ready';
      d.classList.toggle('is-ready', done);
      d.style.setProperty('--p', it.total ? it.loaded / it.total : 0);
      d.title = `${it.id}: ${done ? 'ready' : it.state}`;
      loaded += done ? 1 : (it.total ? it.loaded / it.total : 0);
      total += 1;
    });
    const pct = Math.round((loaded / total) * 100);
    $('#reel-label').textContent = pct >= 100 ? 'Reel loaded' : `Reel ${pct}%`;
    $('#reel').classList.toggle('is-done', pct >= 100);
    const bar = $('#gate-load-bar');
    if (bar) bar.style.width = `${Math.min(100, pct * 4)}%`;
  }

  soundButton(on) {
    const b = $('#sound-toggle');
    b.setAttribute('aria-pressed', String(on));
    b.setAttribute('aria-label', on ? 'Sound on — turn sound off' : 'Sound off — turn sound on');
  }

  toast(msg) {
    const box = $('#toast-box');
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(10px)'; setTimeout(() => t.remove(), 300); }, 2800);
  }

  // ------------------------------------------------------------ counters
  countStats() {
    if (this.counted) return;
    this.counted = true;
    $$('.stat-num').forEach((el) => {
      const target = Number(el.dataset.target);
      const start = performance.now(), dur = 1400;
      const step = (now) => {
        const k = Math.min(1, (now - start) / dur);
        el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  // ------------------------------------------------------------ internals
  #nav() {
    const toggle = $('#mobile-toggle'), drawer = $('#mobile-drawer');
    const set = (open) => {
      drawer.classList.toggle('is-open', open);
      drawer.setAttribute('aria-hidden', String(!open));
      toggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('scroll-locked', open);
    };
    toggle.addEventListener('click', () => set(!drawer.classList.contains('is-open')));
    $$('.drawer-link').forEach((a) => a.addEventListener('click', () => set(false)));
    this.closeDrawer = () => set(false);

    // Anchor links jump straight to the start of an act (smooth scrolling across
    // thousands of pixels of film would feel like fast-forwarding).
    $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const extra = target.id === 'contact' ? innerHeight * 0.9 : innerHeight * 0.25;
      window.scrollTo({ top: target.offsetTop + (target.id === 'home' ? 0 : extra), behavior: 'instant' });
    }));
  }

  #modals() {
    const open = (m) => { m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false'); document.body.classList.add('scroll-locked'); m.querySelector('input, button')?.focus(); };
    const close = (m) => { m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true'); document.body.classList.remove('scroll-locked'); };
    const cv = $('#resume-modal'), msg = $('#message-modal');
    ['#open-resume-btn', '#hero-resume-trigger', '#drawer-resume-btn'].forEach((s) => $(s)?.addEventListener('click', () => { this.closeDrawer?.(); open(cv); }));
    $$('[data-open="message"]').forEach((b) => b.addEventListener('click', () => open(msg)));
    $$('.modal').forEach((m) => {
      m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('[data-close]')) close(m); });
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { $$('.modal.is-open').forEach(close); this.closeDrawer?.(); } });
    $('#print-cv-btn').addEventListener('click', () => window.print());
    this.closeModal = (id) => close($(id));
  }

  #copy() {
    $$('[data-copy]').forEach((btn) => btn.addEventListener('click', (e) => {
      e.preventDefault();
      const val = btn.dataset.copy;
      navigator.clipboard?.writeText(val).then(() => {
        if (btn.classList.contains('copy-btn')) { const o = btn.textContent; btn.textContent = 'Copied!'; setTimeout(() => (btn.textContent = o), 2000); }
        this.toast(`Copied "${val}" to clipboard!`);
        this.audio.sparkle(1.4);
      }).catch(() => this.toast(val));
    }));
  }

  #form() {
    const form = $('#contact-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#c-name').value.trim(), email = $('#c-email').value.trim(), msg = $('#c-msg').value.trim();
      if (!name || !email || !msg) { this.toast('Please complete all required fields.'); return; }
      this.toast(`Thanks ${name}! Preparing email message...`);
      const mailto = `mailto:hritabratabardhan13579@gmail.com?subject=Project Inquiry from ${encodeURIComponent(name)}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${msg}`)}`;
      window.location.href = mailto;
      form.reset();
      this.closeModal('#message-modal');
    });
  }

  #typewriter() {
    const el = $('#typed-text');
    const roles = ['Software Developer', 'C++ & Linux Systems Developer', 'DSA & Systems Specialist', 'Arch Linux & Hyprland Builder', 'Full-Stack & AI Engineer'];
    let r = 0, c = 0, del = false;
    const run = () => {
      const cur = roles[r];
      c += del ? -1 : 1;
      el.textContent = cur.substring(0, c);
      let wait = del ? 45 : 90;
      if (!del && c === cur.length) { wait = 2200; del = true; }
      else if (del && c === 0) { del = false; r = (r + 1) % roles.length; wait = 400; }
      setTimeout(run, wait);
    };
    el.textContent = '';
    setTimeout(run, 600);
  }

  #hoverTicks() {
    let last = 0;
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest('.btn, .nav-item, .pill-btn, .hero-socials a, .btn-link, .copy-btn');
      if (!t || performance.now() - last < 60) return;
      last = performance.now();
      this.audio.tick();
    });
  }
}
