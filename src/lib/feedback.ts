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
