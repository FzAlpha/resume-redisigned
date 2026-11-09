// THE GATE — the opening screen. A big counter climbs to 100 while the opening scene
// downloads, then a ring asks the visitor to press and hold. Holding enters with sound
// (the hold is the user gesture that unlocks audio); "Enter in silence" skips the sound.
const $ = (s) => document.querySelector(s);
const HOLD_SECONDS = 1.3;
const RING = 2 * Math.PI * 46;
// Next frame, with a timer fallback for tabs that pause requestAnimationFrame (hidden panes).
const nextFrame = (cb) => {
  let fired = false;
  const go = () => { if (!fired) { fired = true; cb(performance.now()); } };
  const id = requestAnimationFrame(go);
  const t = setTimeout(go, 40);
  return () => { fired = true; cancelAnimationFrame(id); clearTimeout(t); };
};

export class Gate {
  constructor(audio) {
    this.audio = audio;
    this.el = $('#gate');
    this.countEl = $('#gate-count');
    this.barEl = $('#gate-load-bar');
    this.btn = $('#gate-hold');
    this.ring = $('#gate-ring');
    this.ring.style.strokeDasharray = RING;
    this.ring.style.strokeDashoffset = RING;
    this.target = 0;
    this.shown = 0;
    this.isReady = false;
    this.done = false;
    nextFrame(() => this.el.classList.add('is-in'));
    this.#count();
  }

  /** 0..1 — how much of the opening scene has downloaded. */
  setProgress(p) {
    this.target = Math.max(this.target, Math.min(1, p));
  }

  /** Smoothly count the number up to the real progress. */
  #count() {
    let last = performance.now();
    const step = (now) => {
      if (this.done) return;
      const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
      last = now;
      this.shown += (this.target - this.shown) * (1 - Math.exp(-4 * dt));
      if (this.target - this.shown < 0.004) this.shown = this.target;
      const v = Math.round(this.shown * 100);
      this.countEl.textContent = String(v).padStart(2, '0');
      this.barEl.style.transform = `scaleX(${this.shown})`;
      if (this.shown >= 1 && !this.isReady) this.#ready();
      nextFrame(step);
    };
    nextFrame(step);
    // Never leave anyone stuck on a stalled download: offer the hold after 15 s regardless.
    setTimeout(() => { if (!this.isReady) this.#ready(); }, 15000);
  }

  #ready() {
    if (this.done) return; // already entered (e.g. "Enter in silence" before loading finished)
    this.isReady = true;
    this.el.classList.add('is-ready');
    $('#gate-label').textContent = 'Ready';
    $('#gate-hint').textContent = 'Press and hold to enter · best with headphones';
    this.btn.disabled = false;
  }

  /** Resolves with true (hold → sound on) or false (enter in silence). */
  waitForEnter() {
    return new Promise((resolve) => {
      let hold = 0, holding = false, last = 0, cancel = () => {}, ticks = 0;
      const render = () => {
        this.ring.style.strokeDashoffset = RING * (1 - hold);
        this.btn.style.setProperty('--hold', hold);
      };
      const loop = (now) => {
        const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
        last = now;
        hold = holding ? Math.min(1, hold + dt / HOLD_SECONDS) : Math.max(0, hold - dt * 2.2);
        render();
        // a rising tick every 10% while the ring fills
        const step = Math.floor(hold * 10);
        if (holding && step > ticks) { ticks = step; this.audio.beep(440 + step * 90, 0.035); }
        if (hold >= 1) return finish(true);
        if (holding || hold > 0) cancel = nextFrame(loop);
      };
      const start = (e) => {
        if (this.btn.disabled || holding) return;
        e?.preventDefault?.();
        holding = true;
        ticks = Math.floor(hold * 10);
        this.btn.classList.add('is-holding');
        // The press itself is the gesture that lets the browser play audio.
        if (!this.audio.enabled) this.audio.setEnabled(true);
        cancel();
        last = performance.now();
        cancel = nextFrame(loop);
      };
      const stop = () => {
        if (!holding) return;
        holding = false;
        this.btn.classList.remove('is-holding');
      };
      const key = (e) => { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) start(e); };
      const keyUp = (e) => { if (e.key === 'Enter' || e.key === ' ') stop(); };
      const silent = () => finish(false);
      const finish = (withSound) => {
        cancel();
        this.btn.removeEventListener('pointerdown', start);
        window.removeEventListener('pointerup', stop);
        window.removeEventListener('pointercancel', stop);
        this.btn.removeEventListener('keydown', key);
        this.btn.removeEventListener('keyup', keyUp);
        $('#gate-silent').removeEventListener('click', silent);
        resolve(withSound);
      };
      this.btn.addEventListener('pointerdown', start);
      window.addEventListener('pointerup', stop);
      window.addEventListener('pointercancel', stop);
      this.btn.addEventListener('keydown', key);
      this.btn.addEventListener('keyup', keyUp);
      this.btn.addEventListener('contextmenu', (e) => e.preventDefault());
      $('#gate-silent').addEventListener('click', silent);
    });
  }

  /** Fade the gate away. */
  hide() {
    this.done = true;
    this.el.classList.add('is-gone');
    setTimeout(() => this.el.remove(), 1400);
  }
}
