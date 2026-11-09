// THE OPENING FILM — a pre-rendered Blender sequence (blender/intro_film.blend) that plays
// after the gate, then crossfades into the live WebGL hero. Cues (sound, title card) are fired
// from the video's own clock so they stay in sync even if playback stutters.
const BASE = import.meta.env.BASE_URL;

// Shot timing of the film (24 fps): macro 0–3.2 s, orbit 3.25–6.5 s, push-in 6.5–9.5 s,
// flash + feather burst at 9.54 s, pull-back to the hero framing until 13 s.
export const FILM = { cutOrbit: 3.25, cutPush: 6.5, flash: 9.54, handoff: 11.7, length: 13.0 };

export class Film {
  constructor({ hd }) {
    this.el = document.getElementById('film');
    this.video = document.getElementById('film-video');
    this.failed = false;
    this.cues = [];
    // Phones held upright get a version re-framed in Blender for 9:16; everything else is 16:9.
    this.vertical = innerHeight > innerWidth * 1.15;
    this.src = `${BASE}film/${this.vertical ? 'intro-portrait' : hd ? 'intro-1080' : 'intro-720'}.mp4`;
    this.el.classList.toggle('is-vertical', this.vertical);
    this.video.addEventListener('error', () => {
      if (this.vertical) { // no vertical file: fall back to the landscape film (cropped + panned)
        this.vertical = false;
        this.el.classList.remove('is-vertical');
        this.video.src = `${BASE}film/intro-720.mp4`;
        this.video.load();
        return;
      }
      this.failed = true;
    });
  }

  /** Start downloading right away (the gate is a good time to buffer). */
  load() {
    if (this.video.src) return;
    this.video.src = this.src;
    this.video.load();
  }

  /** 0..1 — how much of the film is buffered. */
  progress() {
    const v = this.video;
    if (this.failed) return 1;
    if (v.readyState >= 4) return 1;
    if (!v.duration || !v.buffered.length) return 0;
    return Math.min(1, v.buffered.end(v.buffered.length - 1) / v.duration);
  }

  get playable() { return !this.failed && this.video.readyState >= 3; }
  get time() { return this.video.currentTime; }

  /** Run fn once when the film reaches `t` seconds. */
  at(t, fn) { this.cues.push({ t, fn, done: false }); }

  /** Play from the start. Resolves when it ends (or is stopped). */
  play() {
    const v = this.video;
    this.cues.forEach((c) => (c.done = false));
    v.currentTime = 0;
    this.el.classList.remove('is-fading', 'is-pan');
    this.el.classList.add('is-on');
    this.at(FILM.flash + 0.3, () => this.el.classList.add('is-pan'));
    return new Promise((resolve) => {
      this._resolve = resolve;
      const tick = () => {
        if (!this.el.classList.contains('is-on')) return;
        for (const c of this.cues) if (!c.done && v.currentTime >= c.t) { c.done = true; c.fn(); }
        this._raf = requestAnimationFrame(tick);
      };
      v.onended = () => this.stop();
      v.play().then(tick).catch(() => { this.failed = true; this.stop(); });
      // the rAF loop pauses in background tabs; keep cues firing anyway
      this._timer = setInterval(() => { for (const c of this.cues) if (!c.done && v.currentTime >= c.t) { c.done = true; c.fn(); } }, 120);
    });
  }

  /** Dissolve the film to reveal the live scene underneath. */
  fadeOut() { this.el.classList.add('is-fading'); }

  stop() {
    cancelAnimationFrame(this._raf);
    clearInterval(this._timer);
    this.video.pause();
    this.el.classList.remove('is-on', 'is-fading', 'is-pan');
    const r = this._resolve; this._resolve = null;
    r?.(!this.failed);
  }
}
