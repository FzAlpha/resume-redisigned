// Sound director: two music beds that crossfade per act, sample-based effects with
// music ducking, and small synthesized sounds (UI ticks, key clicks, sparkles, heartbeats).
const BASE = import.meta.env.BASE_URL;

const SFX = ['boot', 'glitch', 'wings', 'impact', 'choir-angel', 'servo', 'portal', 'riser', 'power-on', 'choir-swell', 'credits'];
const MUSIC = { epic: 'score-epic.mp3', calm: 'score-calm.mp3' };

export class SoundDirector {
  constructor() {
    this.enabled = false;
    this.ctx = null;
    this.buffers = new Map();
    this.mixTarget = { epic: 0, calm: 0 };
    this.duckDepth = 0;
    this.onchange = null;
  }

  /** Must be called from a user gesture (click). */
  #boot() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = (this.ctx = new AC());
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.knee.value = 12; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.25;
    this.master.connect(comp).connect(ctx.destination);

    this.musicBus = ctx.createGain();
    this.musicDuck = ctx.createGain();
    this.musicBus.connect(this.musicDuck).connect(this.master);
    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = 0.9;
    this.sfxBus.connect(this.master);

    // Small reverb for synthesized sounds (generated impulse response).
    this.verb = ctx.createConvolver();
    this.verb.buffer = this.#impulse(2.4, 2.2);
    const verbGain = ctx.createGain();
    verbGain.gain.value = 0.35;
    this.verb.connect(verbGain).connect(this.sfxBus);

    this.tracks = {};
    for (const [k, file] of Object.entries(MUSIC)) {
      const el = new Audio(`${BASE}audio/${file}`);
      el.loop = true;
      el.preload = 'auto';
      const g = ctx.createGain();
      g.gain.value = 0;
      ctx.createMediaElementSource(el).connect(g).connect(this.musicBus);
      this.tracks[k] = { el, gain: g, playing: false };
    }
    SFX.forEach((n) => this.#load(n));

    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return;
      if (document.hidden) this.ctx.suspend(); else if (this.enabled) this.ctx.resume();
    });
  }

  async #load(name) {
    try {
      const res = await fetch(`${BASE}audio/${name}.mp3`);
      const arr = await res.arrayBuffer();
      this.buffers.set(name, await this.ctx.decodeAudioData(arr));
    } catch (e) { console.warn('[audio] could not load', name, e); }
  }

  #impulse(seconds, decay) {
    const rate = this.ctx.sampleRate, len = rate * seconds;
    const buf = this.ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  setEnabled(on) {
    if (on) this.#boot();
    if (!this.ctx) { this.enabled = false; return; }
    this.enabled = on;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(on ? 1 : 0, now, on ? 0.4 : 0.15);
    if (on) {
      this.ctx.resume();
      this.mix(this.mixTarget, 1.5);
    } else {
      setTimeout(() => { if (!this.enabled) Object.values(this.tracks).forEach((t) => { t.el.pause(); t.playing = false; }); }, 700);
    }
    this.onchange?.(on);
  }

  toggle() { this.setEnabled(!this.enabled); }

  /** Crossfade the music beds. Values 0..1. */
  mix(target, seconds = 2) {
    Object.assign(this.mixTarget, target);
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    for (const [k, t] of Object.entries(this.tracks)) {
      const v = this.mixTarget[k] ?? 0;
      if (v > 0 && !t.playing) { t.el.play().catch(() => {}); t.playing = true; }
      t.gain.gain.cancelScheduledValues(now);
      t.gain.gain.setValueAtTime(t.gain.gain.value, now);
      t.gain.gain.linearRampToValueAtTime(v, now + seconds);
      if (v === 0 && t.playing) {
        clearTimeout(t.stopTimer);
        t.stopTimer = setTimeout(() => { if ((this.mixTarget[k] ?? 0) === 0) { t.el.pause(); t.playing = false; } }, seconds * 1000 + 200);
      }
    }
  }

  /** Lower the music under a big moment. */
  duck(amount = 0.5, hold = 1.2, release = 1.5) {
    if (!this.enabled || !this.ctx) return;
    const g = this.musicDuck.gain, now = this.ctx.currentTime;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(1 - amount, now + 0.08);
    g.setValueAtTime(1 - amount, now + hold);
    g.linearRampToValueAtTime(1, now + hold + release);
  }

  /** Play a sample. */
  play(name, { volume = 1, rate = 1, delay = 0, duck = 0, pan = 0 } = {}) {
    if (!this.enabled || !this.ctx) return;
    const buf = this.buffers.get(name);
    if (!buf) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = rate;
    const g = this.ctx.createGain();
    g.gain.value = volume;
    const p = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (p) { p.pan.value = pan; src.connect(g).connect(p).connect(this.sfxBus); } else src.connect(g).connect(this.sfxBus);
    src.start(this.ctx.currentTime + delay);
    if (duck) this.duck(duck, Math.min(buf.duration * 0.6, 2.5));
    return src;
  }

  // ---------------------------------------------------------- synthesized
  #env(node, t, a, peak, d) {
    node.gain.setValueAtTime(0, t);
    node.gain.linearRampToValueAtTime(peak, t + a);
    node.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }

  /** Soft UI hover tick. */
  tick(pitch = 1) {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime, o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(1800 * pitch, t); o.frequency.exponentialRampToValueAtTime(900 * pitch, t + 0.05);
    this.#env(g, t, 0.003, 0.06, 0.06);
    o.connect(g).connect(this.sfxBus); o.start(t); o.stop(t + 0.1);
  }

  /** Mechanical key click for the terminal. */
  key() {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime, len = 0.03;
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 6);
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2400 + Math.random() * 1200; f.Q.value = 1.2;
    const g = this.ctx.createGain(); g.gain.value = 0.22;
    src.connect(f).connect(g).connect(this.sfxBus); src.start(t);
  }

  /** Droid chirp (K-2SO answering). */
  chirp() {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = 'square';
      const f = 500 + Math.random() * 900;
      o.frequency.setValueAtTime(f, t + i * 0.06);
      o.frequency.exponentialRampToValueAtTime(f * (Math.random() > 0.5 ? 1.6 : 0.6), t + i * 0.06 + 0.05);
      this.#env(g, t + i * 0.06, 0.004, 0.035, 0.05);
      o.connect(g).connect(this.sfxBus); o.start(t + i * 0.06); o.stop(t + i * 0.06 + 0.08);
    }
  }

  /** Glassy shimmer for the butterfly and the hotspots. */
  sparkle(base = 1) {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = [1, 1.25, 1.5, 2, 2.5];
    for (let i = 0; i < 4; i++) {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880 * base * notes[(Math.random() * notes.length) | 0];
      const st = t + i * 0.07;
      this.#env(g, st, 0.005, 0.05, 0.6);
      o.connect(g); g.connect(this.verb); g.connect(this.sfxBus);
      o.start(st); o.stop(st + 0.7);
    }
  }

  /** Deep heartbeat thump. */
  thump(volume = 0.6) {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    [0, 0.22].forEach((off, i) => {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(70, t + off); o.frequency.exponentialRampToValueAtTime(38, t + off + 0.18);
      this.#env(g, t + off, 0.008, volume * (i ? 0.6 : 1), 0.28);
      o.connect(g).connect(this.sfxBus); o.start(t + off); o.stop(t + off + 0.4);
    });
  }

  /** Short boot beep. */
  beep(freq = 880, vol = 0.05) {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime, o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = 'square'; o.frequency.value = freq;
    this.#env(g, t, 0.002, vol, 0.07);
    o.connect(g).connect(this.sfxBus); o.start(t); o.stop(t + 0.1);
  }
}
