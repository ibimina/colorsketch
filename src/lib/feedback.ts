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

/**
 * Play a sound effect
 * @param soundName - The name of the sound to play
 */
export function playSound(
  soundName: "click" | "success" | "error" | "level-up",
) {
  // For now, just a placeholder - you can add actual sound files later
  // Sound files would be in /public/sounds/ directory

  try {
    const soundPaths = {
      click: "/sounds/click.mp3",
      success: "/sounds/success.mp3",
      error: "/sounds/error.mp3",
      "level-up": "/sounds/level-up.mp3",
    };

    const audio = new Audio(soundPaths[soundName]);
    audio.volume = 0.3; // 30% volume
    audio.play().catch(() => {
      // Silently fail if sound can't play (user hasn't interacted with page yet)
    });
  } catch {
    // Silently fail if Audio API not supported
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
