/**
 * Trigger haptic feedback on mobile devices
 * @param type - The type of haptic feedback
 */
export function triggerHaptic(type: "light" | "medium" | "heavy" = "light") {
  // Check if device supports haptic feedback
  if ("vibrate" in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 50,
    };

    navigator.vibrate(patterns[type]);
  }
}

// Audio context singleton
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Ambient Music Player - Generates relaxing continuous soundscape
 */
class AmbientMusicPlayer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private isPlaying = false;
  private volume = 0.15;

  start() {
    if (this.isPlaying) return;
    
    this.ctx = getAudioContext();
    if (!this.ctx) return;

    // Resume context if suspended
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 2);
    this.masterGain.connect(this.ctx.destination);

    // Create layered ambient pads - peaceful drone
    const baseFreqs = [
      130.81, // C3
      196.00, // G3
      261.63, // C4
      329.63, // E4
    ];

    baseFreqs.forEach((freq, i) => {
      // Main oscillator
      const osc = this.ctx!.createOscillator();
      const oscGain = this.ctx!.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);
      
      // Gentle LFO for subtle movement
      const lfo = this.ctx!.createOscillator();
      const lfoGain = this.ctx!.createGain();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(0.1 + i * 0.05, this.ctx!.currentTime); // Very slow
      lfoGain.gain.setValueAtTime(2, this.ctx!.currentTime); // Subtle pitch variation
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      // Volume varies by layer
      oscGain.gain.setValueAtTime(0.25 - i * 0.05, this.ctx!.currentTime);
      
      osc.connect(oscGain);
      oscGain.connect(this.masterGain!);
      
      osc.start();
      lfo.start();
      
      this.oscillators.push(osc, lfo);
    });

    // Add soft filtered noise for texture
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.setValueAtTime(200, this.ctx.currentTime);
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.03, this.ctx.currentTime);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start();

    this.isPlaying = true;
  }

  stop() {
    if (!this.isPlaying || !this.masterGain || !this.ctx) return;

    // Fade out
    this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1);

    // Stop oscillators after fade
    setTimeout(() => {
      this.oscillators.forEach(osc => {
        try { osc.stop(); } catch {}
      });
      this.oscillators = [];
      this.isPlaying = false;
    }, 1100);
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.1);
    }
  }

  getIsPlaying() {
    return this.isPlaying;
  }
}

// Singleton instance
export const ambientMusic = new AmbientMusicPlayer();

/**
 * Play a synthesized sound effect using Web Audio API
 * @param soundName - The name of the sound to play
 */
export function playSound(
  soundName: "click" | "success" | "error" | "level-up",
) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;

    switch (soundName) {
      case "click": {
        // Short pop sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }

      case "success": {
        // Pleasant ascending chime
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
        frequencies.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + i * 0.1);
          gain.gain.setValueAtTime(0, now + i * 0.1);
          gain.gain.linearRampToValueAtTime(0.12, now + i * 0.1 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.3);
        });
        break;
      }

      case "error": {
        // Low buzzy sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }

      case "level-up": {
        // Triumphant ascending arpeggio
        const frequencies = [392, 493.88, 587.33, 783.99]; // G4, B4, D5, G5
        frequencies.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          gain.gain.setValueAtTime(0, now + i * 0.08);
          gain.gain.linearRampToValueAtTime(0.15, now + i * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.4);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.4);
        });
        break;
      }
    }
  } catch {
    // Silently fail if Web Audio API not supported
  }
}

/**
 * Provide combined feedback (haptic + sound)
 */
export function provideFeedback(options: {
  haptic?: boolean;
  hapticType?: "light" | "medium" | "heavy";
  sound?: boolean;
  soundName?: "click" | "success" | "error" | "level-up";
}) {
  if (options.haptic) {
    triggerHaptic(options.hapticType || "light");
  }

  if (options.sound && options.soundName) {
    playSound(options.soundName);
  }
}
