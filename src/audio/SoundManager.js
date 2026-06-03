// Procedural sound effects using Web Audio API
export class SoundManager {
  constructor(scene) {
    this.scene = scene;
    this.ctx = null;
    this.masterGain = null;
    this.initialized = false;
    this.muted = false;
  }

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio not available');
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playHitLight() {
    if (!this.initialized || this.muted) return;
    this._playNoise(0.08, 800, 0.15);
    this._playTone(200, 0.05, 'square', 0.1);
  }

  playHitHeavy() {
    if (!this.initialized || this.muted) return;
    this._playNoise(0.15, 400, 0.2);
    this._playTone(100, 0.1, 'sawtooth', 0.15);
    this._playTone(80, 0.08, 'square', 0.12);
  }

  playBlock() {
    if (!this.initialized || this.muted) return;
    this._playTone(300, 0.05, 'triangle', 0.08);
    this._playNoise(0.06, 2000, 0.1);
  }

  playWhiff() {
    if (!this.initialized || this.muted) return;
    this._playSweep(400, 200, 0.1, 'sine', 0.06);
  }

  playSpecial() {
    if (!this.initialized || this.muted) return;
    this._playSweep(200, 800, 0.2, 'sawtooth', 0.12);
    this._playNoise(0.1, 600, 0.25);
    this._playTone(150, 0.15, 'square', 0.1);
  }

  playKO() {
    if (!this.initialized || this.muted) return;
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this._playTone(100 + i * 50, 0.2, 'sawtooth', 0.15);
        this._playNoise(0.15, 300, 0.2);
      }, i * 80);
    }
  }

  playRoundStart() {
    if (!this.initialized || this.muted) return;
    this._playTone(523, 0.15, 'square', 0.08);
    setTimeout(() => this._playTone(659, 0.15, 'square', 0.08), 150);
    setTimeout(() => this._playTone(784, 0.3, 'square', 0.1), 300);
  }

  playMenuSelect() {
    if (!this.initialized || this.muted) return;
    this._playTone(600, 0.05, 'sine', 0.08);
  }

  playMenuConfirm() {
    if (!this.initialized || this.muted) return;
    this._playTone(500, 0.08, 'square', 0.06);
    setTimeout(() => this._playTone(700, 0.1, 'square', 0.06), 100);
  }

  playBuzzer() {
    if (!this.initialized || this.muted) return;
    this._playTone(150, 0.25, 'sawtooth', 0.15);
    this._playTone(145, 0.25, 'sawtooth', 0.15);
  }

  playCinematicHit() {
    if (!this.initialized || this.muted) return;
    this._playNoise(0.5, 300, 0.35);
    this._playTone(80, 0.4, 'sawtooth', 0.25);
    this._playTone(50, 0.3, 'sine', 0.3);
  }

  playVictory() {
    if (!this.initialized || this.muted) return;
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this._playTone(freq, 0.3, 'square', 0.08), i * 200);
    });
  }

  playProjectile() {
    if (!this.initialized || this.muted) return;
    this._playSweep(300, 600, 0.15, 'sine', 0.08);
  }

  _playTone(freq, duration, type = 'sine', volume = 0.1) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  _playSweep(freqStart, freqEnd, duration, type = 'sine', volume = 0.1) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freqEnd, this.ctx.currentTime + duration);
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  _playNoise(duration, filterFreq = 1000, volume = 0.1) {
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start();
  }
}
