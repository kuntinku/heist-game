// gilded-trust: tiny WebAudio synth — steps, loot chime, alarm klaxon, smoke, EMP.
// All tones are generated; no audio files, so the job stays fully offline.
export class Audio {
  constructor() {
    this.ctx = null;
    this.on = true;
  }
  ensure() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { this.on = false; }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.on;
  }
  tone(freq, dur, type = 'sine', gain = 0.12) {
    if (!this.ensure()) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(gain, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + dur);
    o.connect(g).connect(this.ctx.destination);
    o.start(); o.stop(this.ctx.currentTime + dur);
  }
  step() { this.tone(85 + Math.random() * 20, 0.07, 'triangle', 0.05); }
  loot() { this.tone(620, 0.12, 'sine', 0.15); setTimeout(() => this.tone(830, 0.16, 'sine', 0.12), 90); setTimeout(() => this.tone(1046, 0.2, 'sine', 0.1), 180); }
  alarm() { [0, 300, 600].forEach((ms) => setTimeout(() => this.tone(740, 0.35, 'square', 0.1), ms)); }
  smoke() { this.tone(140, 0.5, 'triangle', 0.1); }
  emp() { this.tone(900, 0.15, 'sawtooth', 0.1); setTimeout(() => this.tone(500, 0.2, 'sawtooth', 0.08), 120); }
  win() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.tone(f, 0.25, 'sine', 0.14), i * 140)); }
  lose() { [330, 262, 196].forEach((f, i) => setTimeout(() => this.tone(f, 0.35, 'sawtooth', 0.12), i * 200)); }
}
