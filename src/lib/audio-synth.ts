// Procedural Web Audio API sound generator for StudySpace
// Generates ambient sounds without external network requests or missing MP3 files.

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private soundNodes: Map<string, { gain: GainNode; stop: () => void }> = new Map();

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.8;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMasterVolume(volume: number) {
    this.initContext();
    if (this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx!.currentTime + 0.05);
    }
  }

  public setSoundVolume(soundId: string, volume: number) {
    const entry = this.soundNodes.get(soundId);
    if (entry && this.ctx) {
      entry.gain.gain.linearRampToValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime + 0.05);
    }
  }

  public playChime() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.6); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.8); // D6

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 2.6);
    osc2.stop(now + 2.6);
  }

  public startSound(id: string, initialVolume = 0.5) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    if (this.soundNodes.has(id)) return; // already playing

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(initialVolume, this.ctx.currentTime + 0.3);
    gain.connect(this.masterGain);

    let stopFn: () => void = () => {};

    if (id === 'rain') {
      stopFn = this.createRain(gain);
    } else if (id === 'white_noise') {
      stopFn = this.createNoise(gain, 'white');
    } else if (id === 'brown_noise') {
      stopFn = this.createNoise(gain, 'brown');
    } else if (id === 'ocean') {
      stopFn = this.createOcean(gain);
    } else if (id === 'forest') {
      stopFn = this.createForest(gain);
    } else if (id === 'fireplace') {
      stopFn = this.createFireplace(gain);
    } else if (id === 'binaural') {
      stopFn = this.createBinaural(gain);
    }

    this.soundNodes.set(id, { gain, stop: stopFn });
  }

  public stopSound(id: string) {
    const entry = this.soundNodes.get(id);
    if (entry && this.ctx) {
      entry.gain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.2);
      setTimeout(() => {
        entry.stop();
        entry.gain.disconnect();
        this.soundNodes.delete(id);
      }, 250);
    }
  }

  public stopAll() {
    for (const [id] of this.soundNodes) {
      this.stopSound(id);
    }
  }

  private createNoise(targetNode: GainNode, type: 'white' | 'brown'): () => void {
    if (!this.ctx) return () => {};
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'brown') {
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // boost gain
      } else {
        output[i] = white * 0.15;
      }
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    whiteNoise.connect(targetNode);
    whiteNoise.start();

    return () => {
      try {
        whiteNoise.stop();
        whiteNoise.disconnect();
      } catch {
        // ignore
      }
    };
  }

  private createRain(targetNode: GainNode): () => void {
    if (!this.ctx) return () => {};
    // Filtered pink noise with modulated bandpass
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2) * 0.35;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200;

    source.connect(filter);
    filter.connect(targetNode);
    source.start();

    return () => {
      try {
        source.stop();
        source.disconnect();
        filter.disconnect();
      } catch {
        // ignore
      }
    };
  }

  private createOcean(targetNode: GainNode): () => void {
    if (!this.ctx) return () => {};
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (last + 0.02 * white) / 1.02;
      last = data[i];
      data[i] *= 2.5;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 450;

    // Periodic surge LFO
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 0.12; // wave every ~8 seconds
    lfoGain.gain.value = 250;

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    source.connect(filter);
    filter.connect(targetNode);

    source.start();
    lfo.start();

    return () => {
      try {
        source.stop();
        lfo.stop();
        source.disconnect();
        filter.disconnect();
        lfo.disconnect();
        lfoGain.disconnect();
      } catch {
        // ignore
      }
    };
  }

  private createForest(targetNode: GainNode): () => void {
    if (!this.ctx) return () => {};
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.1;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 650;
    filter.Q.value = 1.2;

    source.connect(filter);
    filter.connect(targetNode);
    source.start();

    return () => {
      try {
        source.stop();
        source.disconnect();
        filter.disconnect();
      } catch {
        // ignore
      }
    };
  }

  private createFireplace(targetNode: GainNode): () => void {
    if (!this.ctx) return () => {};
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (last + 0.015 * white) / 1.015;
      last = data[i];
      // occasional crackle spike
      if (Math.random() < 0.001) {
        data[i] += (Math.random() - 0.5) * 1.5;
      }
      data[i] *= 2.0;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 700;

    source.connect(filter);
    filter.connect(targetNode);
    source.start();

    return () => {
      try {
        source.stop();
        source.disconnect();
        filter.disconnect();
      } catch {
        // ignore
      }
    };
  }

  private createBinaural(targetNode: GainNode): () => void {
    if (!this.ctx) return () => {};
    const oscL = this.ctx.createOscillator();
    const oscR = this.ctx.createOscillator();
    const merger = this.ctx.createChannelMerger(2);

    oscL.type = 'sine';
    oscL.frequency.value = 216; // Base carrier
    oscR.type = 'sine';
    oscR.frequency.value = 226; // 10Hz Alpha wave beat

    oscL.connect(merger, 0, 0);
    oscR.connect(merger, 0, 1);
    merger.connect(targetNode);

    oscL.start();
    oscR.start();

    return () => {
      try {
        oscL.stop();
        oscR.stop();
        oscL.disconnect();
        oscR.disconnect();
        merger.disconnect();
      } catch {
        // ignore
      }
    };
  }
}

export const soundEngine = new AmbientSoundEngine();
