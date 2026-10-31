// Tiny procedural audio engine: koto-ish music + anime game SFX.
export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.noiseBuf = null;
    this.muted = localStorage.getItem('hanami-muted') === '1';
    this.last = Object.create(null);
    this.musicTimer = null;
    this.step = 0;
    this.nextNote = 0;
    this.musicDucked = false;
  }

  init() {
    if (this.ctx) return this.ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : .75;
    this.master.connect(this.ctx.destination);
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = .55;
    this.sfxGain.connect(this.master);
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = .34;
    this.musicGain.connect(this.master);
    const len = this.ctx.sampleRate * 1.2;
    this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return this.ctx;
  }

  unlock() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  setMuted(m) {
    this.muted = m;
    localStorage.setItem('hanami-muted', m ? '1' : '0');
    if (this.master) this.master.gain.setTargetAtTime(m ? 0 : .75, this.ctx.currentTime, .04);
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  tone(freq, dur, opts = {}) {
    if (!this.ctx) return;
    const {
      type = 'sine', gain = .1, endFreq = null, delay = 0,
      attack = .005, release = dur, detune = 0, dest = null
    } = opts;
    const c = this.ctx;
    const t0 = c.currentTime + delay;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), t0 + dur);
    if (detune) osc.detune.value = detune;
    g.gain.setValueAtTime(.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + attack);
    g.gain.exponentialRampToValueAtTime(.0001, t0 + Math.max(attack + .02, release));
    osc.connect(g);
    g.connect(dest || this.sfxGain);
    osc.start(t0);
    osc.stop(t0 + release + .05);
  }

  noise(dur, opts = {}) {
    if (!this.ctx || !this.noiseBuf) return;
    const { gain = .15, delay = 0, filter = 'lowpass', freq = 900, endFreq = null, q = 1 } = opts;
    const c = this.ctx;
    const t0 = c.currentTime + delay;
    const src = c.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = c.createBiquadFilter();
    f.type = filter;
    f.frequency.setValueAtTime(freq, t0);
    if (endFreq) f.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), t0 + dur);
    f.Q.value = q;
    const g = c.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(this.sfxGain);
    src.start(t0);
    src.stop(t0 + dur + .05);
  }

  sfx(name) {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    if (this.last[name] && now - this.last[name] < .035) return;
    this.last[name] = now;
    switch (name) {
      case 'select':
        this.tone(720, .09, { type: 'triangle', gain: .07, endFreq: 980 });
        break;
      case 'ui':
        this.tone(520, .06, { type: 'sine', gain: .05 });
        break;
      case 'error':
        this.tone(180, .12, { type: 'square', gain: .04, endFreq: 120 });
        break;
      case 'deploy':
        this.noise(.22, { gain: .1, filter: 'highpass', freq: 700, endFreq: 2400 });
        this.tone(523.25, .2, { type: 'triangle', gain: .09 });
        this.tone(659.25, .22, { type: 'triangle', gain: .08, delay: .06 });
        this.tone(783.99, .24, { type: 'triangle', gain: .07, delay: .12 });
        break;
      case 'melee':
        this.noise(.09, { gain: .12, filter: 'lowpass', freq: 1600, endFreq: 500 });
        this.tone(140, .09, { type: 'sine', gain: .08, endFreq: 70 });
        break;
      case 'arrow':
        this.noise(.13, { gain: .07, filter: 'bandpass', freq: 2200, endFreq: 900, q: 2 });
        this.tone(1200, .07, { type: 'triangle', gain: .035, endFreq: 500 });
        break;
      case 'petal':
        this.tone(880, .12, { type: 'sine', gain: .04, endFreq: 1320 });
        this.tone(1175, .16, { type: 'sine', gain: .025, delay: .04 });
        break;
      case 'heal':
        this.tone(784, .28, { type: 'sine', gain: .06 });
        this.tone(988, .3, { type: 'sine', gain: .05, delay: .07 });
        this.tone(1175, .34, { type: 'sine', gain: .04, delay: .14 });
        break;
      case 'bolt':
        this.tone(420, .16, { type: 'sawtooth', gain: .035, endFreq: 120 });
        this.noise(.1, { gain: .05, filter: 'lowpass', freq: 1200 });
        break;
      case 'impact':
        this.noise(.08, { gain: .09, filter: 'lowpass', freq: 900, endFreq: 200 });
        break;
      case 'slow':
        this.tone(1600, .18, { type: 'sine', gain: .035, endFreq: 2400 });
        this.tone(2100, .2, { type: 'sine', gain: .022, delay: .02 });
        break;
      case 'shadowstep':
        this.noise(.22, { gain: .08, filter: 'bandpass', freq: 500, endFreq: 2600, q: 1.5 });
        this.tone(300, .26, { type: 'sine', gain: .05, endFreq: 900 });
        break;
      case 'crit':
        this.tone(1320, .16, { type: 'triangle', gain: .06 });
        this.tone(1760, .22, { type: 'sine', gain: .04, delay: .03 });
        this.noise(.08, { gain: .05, filter: 'highpass', freq: 2500 });
        break;
      case 'whirl':
        this.noise(.18, { gain: .06, filter: 'bandpass', freq: 1000, endFreq: 2000, q: 1.2 });
        break;
      case 'tower':
        this.noise(.09, { gain: .08, filter: 'lowpass', freq: 700, endFreq: 200 });
        this.tone(110, .12, { type: 'sine', gain: .05 });
        break;
      case 'towerDown':
        this.noise(.7, { gain: .16, filter: 'lowpass', freq: 900, endFreq: 80 });
        this.tone(82, .7, { type: 'sine', gain: .14, endFreq: 38 });
        this.tone(146.83, .5, { type: 'sawtooth', gain: .04, delay: .08, endFreq: 100 });
        break;
      case 'crown':
        [659, 784, 988, 1319].forEach((f, i) => this.tone(f, .3, { type: 'triangle', gain: .07, delay: i * .075 }));
        break;
      case 'kingWake':
        this.tone(110, .8, { type: 'sine', gain: .12, endFreq: 82 });
        this.tone(220, .8, { type: 'triangle', gain: .05, endFreq: 164 });
        this.noise(.5, { gain: .05, filter: 'lowpass', freq: 300 });
        break;
      case 'overtime':
        [220, 277, 330, 440].forEach((f, i) => this.tone(f, .6, { type: 'sawtooth', gain: .035, delay: i * .1 }));
        break;
      case 'count':
        this.tone(440, .12, { type: 'triangle', gain: .08 });
        break;
      case 'fight':
        this.tone(523, .5, { type: 'sawtooth', gain: .05 });
        this.tone(659, .5, { type: 'sawtooth', gain: .05 });
        this.tone(784, .5, { type: 'sawtooth', gain: .05 });
        this.noise(.4, { gain: .07, filter: 'highpass', freq: 500 });
        break;
      case 'win':
        [523, 659, 784, 1047].forEach((f, i) => this.tone(f, .5, { type: 'triangle', gain: .09, delay: i * .13 }));
        [659, 784, 1047].forEach(f => this.tone(f, .9, { type: 'sine', gain: .04, delay: .55 }));
        break;
      case 'lose':
        [392, 349, 311, 261].forEach((f, i) => this.tone(f, .55, { type: 'triangle', gain: .075, delay: i * .16 }));
        break;
      default:
        break;
    }
  }

  /* ---------------------------------------------------------------- */
  startMusic() {
    this.unlock();
    if (!this.ctx || this.musicTimer) return;
    this.step = 0;
    this.nextNote = this.ctx.currentTime + .15;
    this.musicTimer = setInterval(() => this.scheduleMusic(), 240);
  }

  stopMusic() {
    if (this.musicTimer) clearInterval(this.musicTimer);
    this.musicTimer = null;
  }

  duckMusic(on) {
    if (!this.musicGain) return;
    this.musicDucked = on;
    this.musicGain.gain.setTargetAtTime(on ? .12 : .34, this.ctx.currentTime, .35);
  }

  scheduleMusic() {
    if (!this.ctx) return;
    const lookahead = .9;
    const beat = 60 / 74 / 2;
    while (this.nextNote < this.ctx.currentTime + lookahead) {
      this.playStep(this.step, this.nextNote);
      this.step = (this.step + 1) % 32;
      this.nextNote += beat;
    }
  }

  playStep(step, time) {
    const c = this.ctx;
    const scale = [293.66, 349.23, 392, 440, 523.25, 587.33, 698.46];
    // plucked koto line
    if (step % 2 === 0 && (step % 8 !== 0 || Math.random() < .6)) {
      const note = scale[(step * 3 + 2) % scale.length];
      const osc = c.createOscillator();
      const g = c.createGain();
      const f = c.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = 1800;
      osc.type = 'triangle';
      osc.frequency.value = note * (Math.random() < .2 ? 2 : 1);
      g.gain.setValueAtTime(.0001, time);
      g.gain.exponentialRampToValueAtTime(.055, time + .02);
      g.gain.exponentialRampToValueAtTime(.0001, time + .8);
      osc.connect(f); f.connect(g); g.connect(this.musicGain);
      osc.start(time); osc.stop(time + .85);
    }
    // soft pad every bar
    if (step % 16 === 0) {
      const root = step === 0 ? 146.83 : 130.81;
      [1, 1.5, 2.0].forEach((mult, i) => {
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = 'sine';
        osc.frequency.value = root * mult;
        osc.detune.value = i === 1 ? 4 : -3;
        g.gain.setValueAtTime(.0001, time);
        g.gain.linearRampToValueAtTime(.028, time + 1.2);
        g.gain.linearRampToValueAtTime(.0001, time + 5.2);
        osc.connect(g); g.connect(this.musicGain);
        osc.start(time); osc.stop(time + 5.3);
      });
    }
    // airy shaker
    if (step % 4 === 2) {
      const src = c.createBufferSource();
      src.buffer = this.noiseBuf;
      const f = c.createBiquadFilter();
      f.type = 'highpass'; f.frequency.value = 5000;
      const g = c.createGain();
      g.gain.setValueAtTime(.018, time);
      g.gain.exponentialRampToValueAtTime(.0001, time + .12);
      src.connect(f); f.connect(g); g.connect(this.musicGain);
      src.start(time); src.stop(time + .14);
    }
  }
}
