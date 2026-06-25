/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Lazy initialize to comply with browser autoplay policies
  }

  private initCtx() {
    if (!this.ctx) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioContextClass();
      } catch (e) {
        console.error('Web Audio API is not supported in this browser', e);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(err => console.warn('Context resume failed', err));
    }
  }

  setMute(mute: boolean) {
    this.isMuted = mute;
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  getIsMuted(): boolean {
    return this.isMuted;
  }

  // Play a bubble popping sound with a dynamic pitch
  playBubble(index: number, total: number = 5) {
    this.initCtx();
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Scale pitch based on index (ascending notes)
    // Major scale steps: C4, D4, E4, G4, A4, C5, D5, E5, etc.
    const baseFreq = 261.63; // C4
    const scale = [1, 1.125, 1.25, 1.5, 1.667, 2, 2.25, 2.5, 3];
    const multiplier = scale[index % scale.length] || 1;
    const freq = baseFreq * multiplier;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle'; // Nice, soft bubble pop sound
    osc.frequency.setValueAtTime(freq, now);
    // Rapid pitch slide up for a "pop" effect
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Play a success arpeggio
  playSuccess() {
    this.initCtx();
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C major arpeggio

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const noteTime = now + idx * 0.08;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.45);
    });
  }

  // Play a star / reward unlock magic sound
  playMagic() {
    this.initCtx();
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Create multiple high pitch chiming tones
    for (let i = 0; i < 6; i++) {
      const delay = i * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      // High bright sparkling notes
      const freq = 800 + Math.random() * 600 + i * 150;
      osc.frequency.setValueAtTime(freq, now + delay);
      
      gain.gain.setValueAtTime(0.15, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.3);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now + delay);
      osc.stop(now + delay + 0.35);
    }
  }

  // Soft click sound for UI buttons
  playClick() {
    this.initCtx();
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.05);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  // Cute warning "boing" for going out of limits or starting over
  playBoing() {
    this.initCtx();
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.25);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Pop sound for unlocking a sticker
  playUnlockSticker() {
    this.initCtx();
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Deep pop sound
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(150, now);
    osc1.frequency.exponentialRampToValueAtTime(450, now + 0.15);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(300, now);
    osc2.frequency.exponentialRampToValueAtTime(900, now + 0.15);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.3);
    osc2.stop(now + 0.3);
  }

  // Play children cheering/shouting "Yey!" and clapping
  playCheer() {
    this.initCtx();
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Synthesize multiple cheerful children voices shouting "Yey!"
    const voicesCount = 5;
    for (let i = 0; i < voicesCount; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      // Friendly, high-pitched vocal frequencies
      const startFreq = 280 + Math.random() * 120 + i * 40;
      const peakFreq = startFreq * (1.6 + Math.random() * 0.4); // Sweeping up for "Yaaay!"
      
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(startFreq, now + i * 0.02);
      osc.frequency.exponentialRampToValueAtTime(peakFreq, now + 0.15 + i * 0.02);
      osc.frequency.linearRampToValueAtTime(startFreq * 0.8, now + 0.6 + i * 0.02);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.1 + i * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75 + i * 0.02);

      // Add a bandpass filter to shape the tone to sound like human vocal formants
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200 + i * 150, now);
      filter.Q.setValueAtTime(1.5, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.02);
      osc.stop(now + 0.85 + i * 0.02);
    }

    // 2. Synthesize background applause/clapping
    const clapCount = 15;
    for (let i = 0; i < clapCount; i++) {
      const delay = Math.random() * 0.7;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150 + Math.random() * 100, now + delay);
      
      gain.gain.setValueAtTime(0.1, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.06);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now + delay);
      osc.stop(now + delay + 0.07);
    }

    // 3. Play a magical sparkling chime cascade on top
    this.playMagic();
  }

  // Kid-friendly Text-to-Speech saying custom phrases with natural voices
  speak(text: string) {
    if (this.isMuted) return;
    if (!('speechSynthesis' in window)) return;

    // Cancel any current speaking to avoid overlap
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Set a good default language
    utterance.lang = 'es-MX';

    const findAndSetVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const esVoices = voices.filter(v => v.lang.toLowerCase().startsWith('es'));

      if (esVoices.length > 0) {
        // High-quality & Natural voice selection priority:
        // 1. Google Cloud/Natural Spanish voices
        // 2. Neural/Natural Microsoft/Apple Spanish voices (Sabina, Monica, Jorge, etc.)
        // 3. es-MX (Mexican/Latin Spanish) or es-ES (Spain Spanish)
        const bestVoice = 
          esVoices.find(v => v.name.toLowerCase().includes('google') && v.lang.toLowerCase().startsWith('es')) ||
          esVoices.find(v => v.name.toLowerCase().includes('neural')) ||
          esVoices.find(v => v.name.toLowerCase().includes('natural')) ||
          esVoices.find(v => v.name.toLowerCase().includes('sabina')) ||
          esVoices.find(v => v.name.toLowerCase().includes('elvira')) ||
          esVoices.find(v => v.name.toLowerCase().includes('monica')) ||
          esVoices.find(v => v.name.toLowerCase().includes('jorge')) ||
          esVoices.find(v => v.lang.toLowerCase() === 'es-mx') ||
          esVoices.find(v => v.lang.toLowerCase() === 'es-es') ||
          esVoices[0];

        if (bestVoice) {
          utterance.voice = bestVoice;
          utterance.lang = bestVoice.lang;
        }
      }

      // Natural, warm voice tuning for kids:
      // Slightly higher pitch for friendliness, but low enough to avoid robotic/synthetic artifacts
      utterance.pitch = 1.12; 
      // Moderate speed, clear pronunciation so children can understand easily
      utterance.rate = 0.90;
      utterance.volume = 1.0;

      window.speechSynthesis.speak(utterance);
    };

    // Chrome/Safari voices are loaded asynchronously
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        findAndSetVoice();
        window.speechSynthesis.onvoiceschanged = null;
      };
    } else {
      findAndSetVoice();
    }
  }

  // Kid-friendly Text-to-Speech saying "Muy bien, esta es la letra/número ---"
  speakCompletion(character: string) {
    const isNumber = !isNaN(Number(character));
    const text = isNumber
      ? `¡Muy bien! Este es el número ${character}.`
      : `¡Muy bien! Esta es la letra ${character}.`;

    this.speak(text);
  }
}

export const sounds = new SoundSynthesizer();
